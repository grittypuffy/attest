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
