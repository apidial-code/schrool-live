type UseAuthOptions = {
    redirectOnUnauthenticated?: boolean;
    redirectPath?: string;
};
export declare function useAuth(options?: UseAuthOptions): {
    refresh: () => Promise<import("@tanstack/query-core").QueryObserverResult<{
        id: number;
        name: string;
        email: string;
        role: string;
    }, import("@trpc/client").TRPCClientErrorLike<{
        input: void;
        output: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        transformer: true;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    }>>>;
    logout: () => Promise<void>;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
    loading: boolean;
    error: import("@trpc/client").TRPCClientErrorLike<{
        input: void;
        output: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
        transformer: true;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    }> | null;
    isAuthenticated: boolean;
};
export {};
