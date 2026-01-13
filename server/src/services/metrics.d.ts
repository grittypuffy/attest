import { Metrics } from "../models/metrics";
export declare function initMetrics(agency_id: string): Promise<import("mongodb").UpdateResult<import("bson").Document>>;
export declare function calculateCredit(metrics: Metrics): number;
export declare function onProposalAccepted(proposal_id: string): Promise<void>;
export declare function onPhaseCompleted(proposal_id: string, completedOnTime: boolean): Promise<void>;
