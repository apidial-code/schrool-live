import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useLocation } from "wouter";
import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

export default function ImpersonationBanner() {
  const { isImpersonating, impersonatedUserName, impersonatedUserRole, endImpersonation } = useImpersonation();
  const [, setLocation] = useLocation();

  if (!isImpersonating) return null;

  const handleReturnToAdmin = () => {
    endImpersonation();
    setLocation("/admin");
  };

  return (
    <div className="bg-yellow-500 text-white px-6 py-3 flex items-center justify-between shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">
          Viewing as: <strong>{impersonatedUserName}</strong> ({impersonatedUserRole})
        </span>
      </div>
      <Button
        onClick={handleReturnToAdmin}
        variant="outline"
        size="sm"
        className="bg-white text-yellow-600 hover:bg-gray-100 border-none"
      >
        <X className="w-4 h-4 mr-2" />
        Return to Admin
      </Button>
    </div>
  );
}
