export declare const createAgencyHandler: ({ store, body, cookie: { token }, }: any) => Promise<{
    error: string;
    data?: undefined;
    success?: undefined;
    message?: undefined;
} | {
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        agency_id: string;
    };
    error: null;
    message: string;
}>;
