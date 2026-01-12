import type { Context } from "elysia";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignUpRequest } from "../models/auth";
import {
	AcceptProjectPhaseRequest,
	AcceptProjectProposalRequest,
	CreateProjectPhasesRequest,
	CreateProjectProposalRequest,
	CreateProjectRequest,
} from "../models/project";
import { Collection, ObjectId } from "mongodb";

export const createProjectHandler = async ({
	store,
	body,
	cookie: { token },
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const projectData = body as typeof CreateProjectRequest;
		const projectCollection: Collection = store.state.projectCollection;

		const _result = await projectCollection.insertOne({
			project_name: projectData.project_name,
			description: projectData.description,
		});

		return {
			success: true,
			data: {
				project_name: projectData.name,
				project_id: _result.insertedId.toString(),
				description: projectData.description,
			},
			error: null,
			message: "Agency created successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

export const getProjectHandler = async ({
	store,
	params: { project_id },
}: any) => {
	const projectCollection: Collection = store.state.projectCollection;

	const result = await projectCollection.findOne({
		_id: new ObjectId(project_id),
	});
	if (!result)
		return {
			success: false,
			data: null,
			message: "Unable to find project",
			error: "Project does not exist",
		};
	return {
		success: true,
		data: {
			project_name: result.project_name,
			project_id: result._id.toString(),
			description: result.description,
		},
		error: null,
		message: "Agency created successfully",
	};
};

export const registerProjectProposalHandler = async ({
	store,
	cookie: { token },
	params: { project_id },
	body,
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Agency")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const projectProposalData = body as typeof CreateProjectProposalRequest;
		const proposalCollection: Collection = store.state.proposalCollection;
		const proposalDoc = {
			project_id: new ObjectId(project_id),
			agency_id: new ObjectId(decoded.id),
			proposal_name: projectProposalData.proposal_name,
			total_budget: projectProposalData.total_budget,
			timeline: projectProposalData.timeline,
			summary: projectProposalData?.summary || null,
			no_of_phases: projectProposalData.no_of_phases,
			outcome: projectProposalData.outcome,
			description: projectProposalData.description,
			status: "Pending",
		};
		const result = await proposalCollection.insertOne(proposalDoc);
		return {
			success: true,
			data: {
				proposal_id: result.insertedId.toString(),
			},
			error: null,
			message: "Agency created successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

export const registerProposalPhasesHandler = async ({
	store,
	cookie: { token },
	params: { project_id, proposal_id },
	body,
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Agency")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const proposalPhasesData = body as typeof CreateProjectPhasesRequest;
		const phaseCollection: Collection = store.state.phaseCollection;
		const phaseDocs = proposalPhasesData.phases.map(
			(proposalPhaseData: any) => ({
				agency_id: new ObjectId(decoded.id),
				proposal_id: new ObjectId(proposal_id),
				project_id: new ObjectId(project_id),
				number: proposalPhaseData.number,
				title: proposalPhaseData.title,
				description: proposalPhaseData.description,
				budget: proposalPhaseData.budget,
				start_date: proposalPhaseData.start_date,
				end_date: proposalPhaseData.end_date,
				validating_documents: proposalPhaseData.validating_documents || null,
				freeze_funds: true,
				status: "Not Started",
			}),
		);
		const result = await phaseCollection.insertMany(phaseDocs);
		if (!result.insertedCount) {
			return {
				success: false,
				data: null,
				error: "An error occured while inserting phases",
				message: "Failure in phase creation",
			};
		}
		return {
			success: true,
			data: result.insertedCount,
			error: null,
			message: "Phases created successfully",
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

export const getProjectProposalsHandler = async ({
	store,
	params: { project_id },
}: any) => {
	const proposalCollection: Collection = store.state.proposalCollection;
	const phaseCollection: Collection = store.state.phaseCollection;
	const proposals = await proposalCollection
		.find({
			project_id: new ObjectId(project_id),
		})
		.toArray();
	const proposalMeta = proposals.map(async (proposal) => {
		const phases = await phaseCollection
			.find({
				proposal_id: { $in: [proposal._id] },
			})
			.toArray();
		return {
			...proposal,
			agency_id: proposal.agency_id.toString(),
			proposal_id: proposal._id.toString(),
			project_id: proposal.project_id.toString(),
			phases: phases,
		};
	});

	return {
		success: true,
		data: proposals.map((proposal) => ({
			...proposal,
			agency_id: proposal.agency_id.toString(),
			proposal_id: proposal._id.toString(),
			project_id: proposal.project_id.toString(),
		})),
		error: null,
		message: "Proposals fetched successfully",
	};
};

export const acceptProjectProposalHandler = async ({
	store,
	cookie: { token },
	params: { project_id },
	body,
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const acceptProposalData = body as typeof AcceptProjectProposalRequest;
		const proposalCollection: Collection = store.state.proposalCollection;
		const phaseCollection: Collection = store.state.phaseCollection;
		const proposalObjectId = new ObjectId(acceptProposalData.proposal_id);
		const projectObjectId = new ObjectId(project_id);
		const acceptResult = await proposalCollection.updateOne(
			{
				_id: proposalObjectId,
				project_id: projectObjectId,
			},
			{
				$set: { status: "Accepted" },
			},
		);

		if (acceptResult.matchedCount === 0) {
			return {
				success: false,
				error: "Not Found",
				message: "Proposal not found for this project",
				data: null,
			};
		}
		await proposalCollection.updateMany(
			{
				project_id: projectObjectId,
				_id: { $ne: proposalObjectId },
			},
			{
				$set: { status: "Not Accepted" },
			},
		);
		await phaseCollection.findOneAndUpdate(
			{
				number: 1,
				proposal_id: proposalObjectId,
			},
			{
				$set: {
					freeze_funds: false,
					status: "In Progress",
				},
			},
		);
		return {
			success: true,
			error: null,
			message: "Proposal accepted and others rejected successfully",
			data: {
				proposal_id: proposalObjectId.toString(),
			},
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};

export const acceptProjectPhaseHandler = async ({
	store,
	cookie: { token },
	params: { project_id, proposal_id },
	body,
}: any) => {
	try {
		const decoded = jwt.verify(token.value, store.state.jwtSecret) as {
			id: string;
			email: string;
			role: string;
		};
		if (decoded.role !== "Government")
			return {
				error: "Not found",
				data: null,
				success: false,
				message: "Not found",
			};
		const acceptPhaseData = body as typeof AcceptProjectPhaseRequest;
		const phaseCollection: Collection = store.state.phaseCollection;
		const phaseObjectId = new ObjectId(acceptPhaseData.phase_id);
		const proposalObjectId = new ObjectId(proposal_id);
		const projectObjectId = new ObjectId(project_id);
		const initialPhase = await phaseCollection.findOne({
			_id: phaseObjectId,
		});
		const acceptResult = await phaseCollection.updateOne(
			{
				project_id: projectObjectId,
				proposal_id: proposalObjectId,
				number: (initialPhase?.number || 1) + 1,
			},
			{
				$set: { freeze_funds: false, status: "In Progress" },
			},
		);

		if (acceptResult.matchedCount === 0) {
			return {
				success: false,
				error: "Not Found",
				message: "Proposal not found for this project",
				data: null,
			};
		}
		return {
			success: true,
			error: null,
			message: "Phase accepted and funds released successfully",
			data: {
				proposal_id: proposalObjectId.toString(),
			},
		};
	} catch (_e) {
		return {
			error: "Invalid or expired token",
			message: "Unauthorized",
			data: null,
			success: false,
		};
	}
};
