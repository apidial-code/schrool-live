interface LessonProgress {
    easyCompleted: number;
    mediumCompleted: number;
    challengingCompleted: number;
    score: number;
    lastAttempt: Date;
}
export declare const progressRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getUserProgress: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            completed: boolean;
            correctAnswers: number;
            easyCompleted: number;
            mediumCompleted: number;
            challengingCompleted: number;
            score: number;
            lastAttempt: Date;
            lessonId: number;
        }[];
        meta: object;
    }>;
    getLessonProgress: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            lessonId: number;
        };
        output: LessonProgress;
        meta: object;
    }>;
    updateLessonProgress: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            lessonId: number;
            score: number;
            difficulty: "easy" | "medium" | "challenging";
        };
        output: {
            success: boolean;
            passed: boolean;
            score: number;
        };
        meta: object;
    }>;
}>>;
export {};
