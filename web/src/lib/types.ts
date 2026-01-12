export type Project = {
  project_name: string;
  project_id: string;
  description: string;
}

export type Phase = {
  agency_id: string;
  proposal_id: string;
  project_id: string;
  phases: any;
}

export type Proposal = {
  proposal_id: string;
  proposal_name: string;
  project_id: string;
  agency_id: string;
  total_budget: number;
  timeline: string;
  summary: string;
  no_of_phases: number;
  outcome: string;
  description: string;
  status: 'Accepted' | 'Not Accepted' | 'Pending' | string;
}
