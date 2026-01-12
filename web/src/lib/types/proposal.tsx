export type Proposal = {
  proposal_id: string;
  name: string;
  total_budget: number;
  timeline: string;
  executing_agency: string;
  summary: string;
  meta: Record<string, unknown>;
  phases: number;
  status: boolean;
  content?: any;
};
