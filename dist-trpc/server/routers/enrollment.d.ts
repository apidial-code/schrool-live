export declare const enrollmentRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getEnrollmentBySession: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            sessionId: string;
        };
        output: {
            enrollmentId: number;
            studentName: string;
            yearLevel: string;
            tier: string;
            status: string;
        };
        meta: object;
    }>;
}>>;
