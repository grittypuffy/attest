import {t} from "elysia";

export const CreateProjectRequest = t.Object({
    project_name: t.String(),
    description: t.String()
})

export const CreateProjectProposalRequest =  t.Object({
  proposal_name: t.String(),
  total_budget: t.Integer(),
  timeline: t.String(),
  description: t.String(),
  summary: t.Optional(t.String()),
  phases: t.Integer(),
  outcome: t.String()
})
