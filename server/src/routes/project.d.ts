import { ObjectId } from "mongodb";
export declare const createProjectHandler: ({ store, body, cookie: { token }, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        project_name: any;
        project_id: string;
        description: string | undefined;
        budget: any;
        onchain_id: any;
    };
    error: null;
    message: string;
}>;
export declare const getProjectHandler: ({ store, params: { project_id }, }: any) => Promise<{
    success: boolean;
    data: null;
    message: string;
    error: string;
} | {
    success: boolean;
    data: {
        project_name: any;
        project_id: string;
        description: any;
        onchain_id: any;
    };
    error: null;
    message: string;
}>;
export declare const getAllProjectsHandler: ({ store }: any) => Promise<{
    success: boolean;
    data: {
        project_name: any;
        project_id: string;
        description: any;
        onchain_id: any;
    }[];
    error: null;
    message: string;
}>;
export declare const registerProjectProposalHandler: ({ store, cookie: { token }, params: { project_id }, body, }: any) => Promise<{
    success: boolean;
    data: {
        project_id: ObjectId;
        agency_id: ObjectId;
        proposal_name: any;
        total_budget: any;
        timeline: any;
        summary: any;
        no_of_phases: any;
        outcome: any;
        description: string | undefined;
        onchain_id: any;
        status: string;
        proposal_id: string;
    };
    error: null;
    message: string;
} | {
    error: any;
    message: string;
    data: null;
    success: boolean;
}>;
export declare const registerProposalPhasesHandler: ({ store, cookie: { token }, params: { project_id, proposal_id }, body, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        [key: number]: ObjectId;
    };
    error: null;
    message: string;
}>;
export declare const getProjectProposalHandler: ({ store, params: { proposal_id }, }: any) => Promise<{
    success: boolean;
    data: null;
    error: null;
    message: string;
} | {
    success: boolean;
    data: {
        agency_id: any;
        proposal_id: string;
        project_id: any;
        onchain_id: any;
        phases: import("mongodb").WithId<import("bson").Document>[];
    };
    error: null;
    message: string;
}>;
export declare const getProjectProposalsHandler: ({ store, params: { project_id }, }: any) => Promise<{
    success: boolean;
    data: {
        agency_id: any;
        proposal_id: string;
        project_id: any;
        onchain_id: any;
        phases: import("mongodb").WithId<import("bson").Document>[];
    }[];
    error: null;
    message: string;
}>;
export declare const acceptProjectProposalHandler: ({ store, cookie: { token }, params: { project_id }, body, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    error: null;
    message: string;
    data: {
        proposal_id: string;
    };
}>;
export declare const acceptProjectPhaseHandler: ({ store, cookie: { token }, params: { project_id, proposal_id }, body, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    error: null;
    message: string;
    data: {
        proposal_id: string;
    };
}>;
