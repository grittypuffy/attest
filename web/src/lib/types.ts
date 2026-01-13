export type User = {
  id: string;
  email: string;
  name?: string;
  role: "Government" | "Agency" | string;
};

export type Project = {
  project_name: string;
  project_id: string;
  description: string;
  onchain_id?: number;
};

export type Phase = {
  agency_id: string;
  proposal_id: string;
  project_id: string;
  phases: any;
};

export interface Proposal {
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
  status: "Accepted" | "Not Accepted" | "Pending" | string;
}

export type PhaseRegistrationItem = {
  budget: number;
  description: string;
  end_date: string; // RFC 3339 date-time format
  number: string;
  start_date: string; // RFC 3339 date-time format
  title: string;
  validating_documents?: string[];
};

export type PhaseRegistrationPayload = {
  phases: PhaseRegistrationItem[];
};
