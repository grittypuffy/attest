export declare const CreateProjectRequest: import("@sinclair/typebox").TObject<{
    project_name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
}>;
export declare const CreateProjectProposalRequest: import("@sinclair/typebox").TObject<{
    proposal_name: import("@sinclair/typebox").TString;
    total_budget: import("@sinclair/typebox").TNumber;
    timeline: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    no_of_phases: import("@sinclair/typebox").TInteger;
    outcome: import("@sinclair/typebox").TString;
}>;
export declare const AcceptProjectProposalRequest: import("@sinclair/typebox").TObject<{
    proposal_id: import("@sinclair/typebox").TString;
}>;
export declare const AcceptProjectPhaseRequest: import("@sinclair/typebox").TObject<{
    phase_id: import("@sinclair/typebox").TString;
}>;
export declare const CreateProjectPhasesRequest: import("@sinclair/typebox").TObject<{
    phases: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        number: import("@sinclair/typebox").TString;
        title: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        budget: import("@sinclair/typebox").TNumber;
        start_date: import("@sinclair/typebox").TString;
        end_date: import("@sinclair/typebox").TString;
        validating_documents: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    }>>;
}>;
