import { ReactNode } from "react";
interface ImpersonationContextType {
    impersonatedUserId: number | null;
    impersonatedUserRole: string | null;
    impersonatedUserName: string | null;
    startImpersonation: (userId: number, role: string, name: string) => void;
    endImpersonation: () => void;
    isImpersonating: boolean;
}
export declare function ImpersonationProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useImpersonation(): ImpersonationContextType;
export {};
