export declare const signInHandler: ({ store, body, cookie: { token }, }: any) => Promise<{
    error: string;
    data?: undefined;
    message?: undefined;
    success?: undefined;
} | {
    error: string;
    data: null;
    message: string;
    success: boolean;
} | {
    success: boolean;
    data: {
        role: any;
        email: any;
        name: any;
    };
    error: null;
    message: string;
}>;
export declare const getAuthUserHandler: ({ store, cookie: { token } }: any) => Promise<{
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
export declare const getUserHandler: ({ store, params: { user_id } }: any) => Promise<{
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
export declare const verifySessionHandler: ({ store, cookie: { token }, }: any) => Promise<{
    error: string;
    data: {
        valid: boolean;
    };
    success: boolean;
    message: string;
} | {
    success: boolean;
    data: {
        valid: boolean;
    };
    error: null;
    message: string;
}>;
export declare const signOutHandler: ({ cookie: { token } }: any) => Promise<{
    success: boolean;
    data: null;
    error: null;
    message: string;
}>;
