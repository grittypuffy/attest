import { ObjectId } from "mongodb";
import { db } from "../index";
import { Metrics } from "../models/metrics";

export async function initMetrics(agency_id: string) {
	const metrics = db.collection("metrics");
	const result = await metrics.updateOne(
		{ agency_id },
		{
			$setOnInsert: {
				agency_id: new ObjectId(agency_id),
				credit: 0,
				completedPhaseOnTime: 0,
				noOfAcceptedProposals: 0,
				quality: 0,
			},
		},
		{ upsert: true },
	);
	return result;
}

export function calculateCredit(metrics: Metrics) {
	return (
		(metrics.noOfAcceptedProposals ?? 0) * 10 +
		(metrics.completedPhaseOnTime ?? 0) * 5 +
		(metrics.quality ?? 0) * 2
	);
}

export async function onProposalAccepted(proposal_id: string) {
	const proposal = db.collection("proposal");
	const proposalResult = await proposal.findOne({
		_id: new ObjectId(proposal_id)
	});
	if (!proposalResult?._id) return;
	const metrics = db.collection("metrics");
	const result = await metrics.findOneAndUpdate(
		{ agency_id: proposalResult?.agency_id },
		{
			$inc: { noOfAcceptedProposals: 1 },
		},
		{ returnDocument: "after", upsert: true },
	);

	if (!result) return;

	const noOfAcceptedProposals = result.noOfAcceptedProposals ?? 0;
	const completedPhaseOnTime = result.completedPhaseOnTime ?? 0;
	const quality = result.quality ?? 0;
	const metricData: Metrics = {
		noOfAcceptedProposals,
		completedPhaseOnTime,
		quality,
	};
	const credit = calculateCredit(metricData);

	await metrics.updateOne({ agency_id: proposalResult.agency_id }, { $set: { ...metricData, credit: credit } });
}

export async function onPhaseCompleted(
	proposal_id: string,
	completedOnTime: boolean,
) {
	if (!completedOnTime) return;
	const proposal = db.collection("proposal");
	const proposalResult = await proposal.findOne({
		_id: new ObjectId(proposal_id)
	});
	if (!proposalResult?._id) return;
	const metrics = db.collection("metrics");
	const result = await metrics.findOneAndUpdate(
		{ agency_id: proposalResult.agency_id },
		{
			$inc: { completedPhaseOnTime: 1 },
		},
		{ returnDocument: "after", upsert: true },
	);

		if (!result) return;
	const noOfAcceptedProposals = result.noOfAcceptedProposals ?? 0;
	const completedPhaseOnTime = result.completedPhaseOnTime ?? 0;
	const quality = result.quality ?? 0;
	const metricData: Metrics = {
		noOfAcceptedProposals,
		completedPhaseOnTime,
		quality,
	};
	const credit = calculateCredit(metricData);
	await metrics.updateOne({ agency_id: proposalResult.agency_id }, { $set: { credit: credit, ...metricData } });
}
