export declare const teacherRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    setAvailability: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            teacherId: number;
            availability: {
                date: string;
                slots: string[];
            }[];
        };
        output: {
            success: boolean;
        };
        meta: object;
    }>;
}>>;
