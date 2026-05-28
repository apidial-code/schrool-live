import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
export default function Home() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    useEffect(() => {
        if (loading)
            return;
        if (!user) {
            setLocation("/login");
            return;
        }
        // If user hasn't selected a role yet, show role selector
        if (!user.roleSelected) {
            setLocation("/select-role");
            return;
        }
        // Redirect to role-specific dashboard
        switch (user.role) {
            case "student":
                setLocation("/student");
                break;
            case "parent":
                setLocation("/parent");
                break;
            case "teacher":
                setLocation("/teacher");
                break;
            case "admin":
                setLocation("/admin");
                break;
            default:
                setLocation("/select-role");
        }
    }, [user, loading, setLocation]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Loader2, { className: "animate-spin w-8 h-8" }) }));
    }
    return null;
}
