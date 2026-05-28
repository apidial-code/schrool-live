export declare const enrollmentNewRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    createCheckoutSession: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            studentName: string;
            parentEmail: string;
            tier: "standard" | "elite";
            yearLevel: "year5-6" | "year7" | "year8" | "year9";
            paymentMethod: "upfront" | "payment-plan";
            studentEmail: string;
            studentAge: string;
            parentName: string;
            phone: string;
            preferredDays?: string | undefined;
        };
        output: {
            url: any;
            sessionId: any;
        };
        meta: object;
    }>;
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
