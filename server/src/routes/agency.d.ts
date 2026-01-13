export declare const getAgencyProjectProposalsHandler: ({ store, params: { agency_id }, }: any) => Promise<{
    success: boolean;
    data: {
        agency_id: any;
        proposal_id: string;
        project_id: any;
        phases: import("mongodb").WithId<import("bson").Document>[];
    }[];
    error: null;
    message: string;
}>;
export declare const getAgencyData: ({ store, params: { agency_id }, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        id: string;
        email: any;
        role: any;
        name: any;
        address: any;
    };
    error: null;
    message: string;
}>;
export declare const getAllAgenciesHandler: ({ store }: any) => Promise<{
    success: boolean;
    data: {
        id: string;
        name: any;
        email: any;
        address: any;
        walletAddress: any;
        rating: any;
        reviewCount: any;
        isAccredited: any;
        specialization: any;
        location: any;
        completedProjects: any;
        description: any;
    }[];
    error: null;
    message: string;
}>;
