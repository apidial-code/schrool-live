import { createContext, useContext, useState, ReactNode } from "react";

interface ImpersonationContextType {
  impersonatedUserId: number | null;
  impersonatedUserRole: string | null;
  impersonatedUserName: string | null;
  startImpersonation: (userId: number, role: string, name: string) => void;
  endImpersonation: () => void;
  isImpersonating: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedUserId, setImpersonatedUserId] = useState<number | null>(null);
  const [impersonatedUserRole, setImpersonatedUserRole] = useState<string | null>(null);
  const [impersonatedUserName, setImpersonatedUserName] = useState<string | null>(null);

  const startImpersonation = (userId: number, role: string, name: string) => {
    setImpersonatedUserId(userId);
    setImpersonatedUserRole(role);
    setImpersonatedUserName(name);
    
    // Store start time in sessionStorage for duration calculation
    try {
      sessionStorage.setItem('impersonation_start', new Date().toISOString());
      sessionStorage.setItem('impersonation_target', JSON.stringify({ userId, role, name }));
    } catch (error) {
      console.error('Failed to store impersonation start:', error);
    }
  };

  const endImpersonation = () => {
    // Clear session storage
    try {
      sessionStorage.removeItem('impersonation_start');
      sessionStorage.removeItem('impersonation_target');
    } catch (error) {
      console.error('Failed to clear impersonation data:', error);
    }
    
    setImpersonatedUserId(null);
    setImpersonatedUserRole(null);
    setImpersonatedUserName(null);
  };

  const isImpersonating = impersonatedUserId !== null;

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedUserId,
        impersonatedUserRole,
        impersonatedUserName,
        startImpersonation,
        endImpersonation,
        isImpersonating,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error("useImpersonation must be used within ImpersonationProvider");
  }
  return context;
}
