export declare const MetricsRequest: import("@sinclair/typebox").TObject<{
    agency_id: import("@sinclair/typebox").TString;
    credit: import("@sinclair/typebox").TInteger;
    completedPhaseOnTime: import("@sinclair/typebox").TInteger;
    noOfAcceptedProposals: import("@sinclair/typebox").TInteger;
    quality: import("@sinclair/typebox").TNumber;
}>;
export interface Metrics {
    completedPhaseOnTime: number;
    noOfAcceptedProposals: number;
    quality: number;
}
