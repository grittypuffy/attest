export declare const initMetricsHandler: ({ store, cookie: { token }, params: { agency_id } }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        upserted_id: string | undefined;
    };
    error: null;
    message: string;
}>;
export declare const updateMetricsHandler: ({ store, cookie: { token }, params: { agency_id }, body }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        upserted_id: string | undefined;
    };
    error: null;
    message: string;
}>;
