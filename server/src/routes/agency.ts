import { Collection, ObjectId } from "mongodb";

export const getAgencyProjectProposalsHandler = async ({
	store,
	params: { agency_id },
}: any) => {
	const proposalCollection: Collection = store.state.proposalCollection;
	const phaseCollection: Collection = store.state.phaseCollection;
	const proposals = await proposalCollection
		.find({
			agency_id: new ObjectId(agency_id),
		})
		.toArray();
	const proposalMeta = await Promise.all(proposals.map(async (proposal) => {
		const phases = await phaseCollection
			.find({
				proposal_id: { $in: [proposal._id] },
			})
			.toArray();
		const { _id, ...proposalData } = proposal;
		return {
			...proposalData,
			agency_id: proposal.agency_id.toString(),
			proposal_id: _id.toString(),
			project_id: proposal.project_id.toString(),
			phases: phases,
		};
	}));

	return {
		success: true,
		data: proposalMeta.map((proposal) => ({
			...proposal,
			agency_id: proposal.agency_id.toString(),
			proposal_id: proposal.proposal_id,
			project_id: proposal.project_id.toString(),
		})),
		error: null,
		message: "Proposals fetched successfully",
	};
};

export const getAgencyData = async ({
	store,
	params: { agency_id },
}: any) => {
	const userCollection: Collection = store.state.userCollection;
	const existingUser = await userCollection.findOne({
		_id: new ObjectId(agency_id),
        role: "Agency"
	});
	if (!existingUser)
		return {
			error: "No user found",
			data: null,
			success: false,
			message: "Failed to get user data",
		};
	return {
		success: true,
		data: {
			id: existingUser._id.toString(),
			email: existingUser.email,
			role: existingUser.role,
			name: existingUser.name,
			address: existingUser.address,
		},
		error: null,
		message: "User retrived successfully",
	};
};

export const getAllAgenciesHandler = async ({ store }: any) => {
	const userCollection: Collection = store.state.userCollection;
	const agencies = await userCollection.find({ role: "Agency" }).toArray();

	return {
		success: true,
		data: agencies.map((agency) => ({
			id: agency._id.toString(),
			name: agency.name,
			email: agency.email,
			address: agency.address,
			walletAddress: agency.walletAddress,
			// Add default values for UI if not in DB
			rating: agency.rating || 4.5,
			reviewCount: agency.reviewCount || 0,
			isAccredited: agency.isAccredited ?? true,
			specialization: agency.specialization || ["General Infrastructure"],
			location: agency.location || "New Delhi",
			completedProjects: agency.completedProjects || 0,
			description: agency.description || "Verified government agency.",
		})),
		error: null,
		message: "Agencies fetched successfully",
	};
};
