export interface Proposal {
  project_id: string;
  proposal_id: string;

  project_name: string;
  project_description: string;     // from /project

  proposal_name: string;
  proposal_description: any;       // from /agency/{id}/proposals

  total_budget: number;
  timeline: string;
  summary: string;
  no_of_phases: number;
  outcome: string;
  status: "Pending" | "Approved" | "Rejected";
  phases: any[];
}
