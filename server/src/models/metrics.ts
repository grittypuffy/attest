import { t } from "elysia";
export const MetricsRequest = t.Object({
	agency_id: t.String(),
	credit: t.Integer(),
	completedPhaseOnTime: t.Integer(),
	noOfAcceptedProposals: t.Integer(),
	quality: t.Number(),
});
