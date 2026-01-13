import { t } from "elysia";

export const CreateProjectRequest = t.Object({
	project_name: t.String(),
	description: t.String(),
	budget: t.Optional(t.String()),
	onchain_id: t.Optional(t.Number()),
});

export const CreateProjectProposalRequest = t.Object({
	proposal_name: t.String(),
	total_budget: t.Number(),
	timeline: t.String(),
	description: t.String(),
	summary: t.Optional(t.String()),
	no_of_phases: t.Integer(),
	outcome: t.String(),
	onchain_id: t.Optional(t.Number()),
});

export const AcceptProjectProposalRequest = t.Object({
	proposal_id: t.String(),
});

export const AcceptProjectPhaseRequest = t.Object({
	phase_id: t.String(),
});


export const CreateProjectPhasesRequest = t.Object({
	phases: t.Array(
		t.Object({
			number: t.String(),
			title: t.String(),
			description: t.String(),
			budget: t.Number(),
			start_date: t.String({ format: "date-time" }),
			end_date: t.String({ format: "date-time" }),
			validating_documents: t.Optional(t.Array(t.String())),
		}),
	),
});
