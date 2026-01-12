export declare const createAgencyHandler: ({ store, body, cookie: { token }, }: any) => Promise<{
    error: string;
    data: null;
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: null;
    error: null;
    message: string;
} | {
    error: string;
    data?: undefined;
    success?: undefined;
    message?: undefined;
}>;
