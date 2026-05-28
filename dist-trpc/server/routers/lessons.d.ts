export declare const lessonsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
        res: import("express").Response<any, Record<string, any>>;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    list: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            id: number;
            title: string;
            description: string;
            videoUrl: string;
            order: number;
        }[];
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            lessonId: number;
        };
        output: {
            id: number;
            title: string;
            description: string;
            videoUrl: string;
            order: number;
        };
        meta: object;
    }>;
    getExercises: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            lessonId: number;
        };
        output: {
            id: number;
            lessonId: number;
            difficulty: string;
            question: string;
            options: string;
            correctAnswer: string;
            solutionVideoId: string;
            orderIndex: number;
        }[] | {
            id: number;
            lessonId: number;
            difficulty: string;
            question: string;
            options: string;
            correctAnswer: string;
            solutionVideoId: string;
            orderIndex: number;
        }[] | {
            id: number;
            lessonId: number;
            difficulty: string;
            question: string;
            options: string;
            correctAnswer: string;
            solutionVideoId: string;
            orderIndex: number;
        }[];
        meta: object;
    }>;
}>>;
