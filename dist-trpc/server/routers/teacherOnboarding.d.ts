export declare const teacherOnboardingRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    validateApprovalCode: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            code: string;
        };
        output: {
            valid: boolean;
        };
        meta: object;
    }>;
    getExamAttempts: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            teacherId: number;
        };
        output: {
            attempts: number;
        };
        meta: object;
    }>;
}>>;
