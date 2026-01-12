import { Elysia } from "elysia";
import type AppState from "./config";
declare const app: Elysia<"", {
    decorator: {};
    store: {
        state: AppState;
    };
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
}, {
    auth: {
        sign_in: {
            post: {
                body: {
                    email: string;
                    password: string;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    auth: {
        user: {
            get: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    auth: {
        session: {
            valid: {
                get: {
                    body: unknown;
                    params: {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
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
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    auth: {
        sign_out: {
            post: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        success: boolean;
                        data: null;
                        error: null;
                        message: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    user: {
        ":user_id": {
            get: {
                body: unknown;
                params: {
                    user_id: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    chat: {
        new: {
            post: {
                body: {
                    prompt: string;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        error: null;
                        success: boolean;
                        message: string;
                        data: {
                            content: any;
                        };
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    government: {
        agency: {
            create: {
                post: {
                    body: {
                        email: string;
                        password: string;
                        name: string;
                        address: string;
                    };
                    params: {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
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
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        create: {
            post: {
                body: {
                    project_name: string;
                    description: string;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                        };
                        error: null;
                        message: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    project: {
        all: {
            get: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        success: boolean;
                        data: {
                            project_name: any;
                            project_id: string;
                            description: any;
                        }[];
                        error: null;
                        message: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            get: {
                body: unknown;
                params: {
                    project_id: string;
                };
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                        };
                        error: null;
                        message: string;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            proposal: {
                register: {
                    post: {
                        body: {
                            summary?: string | undefined;
                            description: string;
                            proposal_name: string;
                            total_budget: number;
                            timeline: string;
                            no_of_phases: number;
                            outcome: string;
                        };
                        params: {
                            project_id: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                data: null;
                                success: boolean;
                                message: string;
                            } | {
                                success: boolean;
                                data: {
                                    project_id: import("bson").ObjectId;
                                    agency_id: import("bson").ObjectId;
                                    proposal_name: any;
                                    total_budget: any;
                                    timeline: any;
                                    summary: any;
                                    no_of_phases: any;
                                    outcome: any;
                                    description: string | undefined;
                                    status: string;
                                    proposal_id: string;
                                };
                                error: null;
                                message: string;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        proposal: {
            ":proposal_id": {
                get: {
                    body: unknown;
                    params: {
                        proposal_id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
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
                                phases: import("mongodb").WithId<import("bson").Document>[];
                            };
                            error: null;
                            message: string;
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            proposal: {
                ":proposal_id": {
                    phase: {
                        register: {
                            post: {
                                body: {
                                    phases: {
                                        validating_documents?: string[] | undefined;
                                        number: string;
                                        description: string;
                                        title: string;
                                        budget: number;
                                        start_date: string;
                                        end_date: string;
                                    }[];
                                };
                                params: {
                                    proposal_id: string;
                                    project_id: string;
                                };
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
                                        error: string;
                                        data: null;
                                        success: boolean;
                                        message: string;
                                    } | {
                                        success: boolean;
                                        data: number;
                                        error: null;
                                        message: string;
                                    };
                                    422: {
                                        type: "validation";
                                        on: string;
                                        summary?: string;
                                        message?: string;
                                        found?: unknown;
                                        property?: string;
                                        expected?: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            proposal: {
                all: {
                    get: {
                        body: unknown;
                        params: {
                            project_id: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                success: boolean;
                                data: {
                                    agency_id: any;
                                    proposal_id: string;
                                    project_id: any;
                                    phases: import("mongodb").WithId<import("bson").Document>[];
                                }[];
                                error: null;
                                message: string;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            proposal: {
                accept: {
                    post: {
                        body: unknown;
                        params: {
                            project_id: string;
                        };
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
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
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    project: {
        ":project_id": {
            proposal: {
                ":proposal_id": {
                    phase: {
                        accept: {
                            post: {
                                body: unknown;
                                params: {
                                    proposal_id: string;
                                    project_id: string;
                                } & {};
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
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
                                    };
                                    422: {
                                        type: "validation";
                                        on: string;
                                        summary?: string;
                                        message?: string;
                                        found?: unknown;
                                        property?: string;
                                        expected?: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    agency: {
        ":agency_id": {
            proposals: {
                get: {
                    body: unknown;
                    params: {
                        agency_id: string;
                    };
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            success: boolean;
                            data: {
                                agency_id: any;
                                proposal_id: string;
                                project_id: any;
                                phases: import("mongodb").WithId<import("bson").Document>[];
                            }[];
                            error: null;
                            message: string;
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    agency: {
        ":agency_id": {
            get: {
                body: unknown;
                params: {
                    agency_id: string;
                } & {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
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
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
export type App = typeof app;
export {};
