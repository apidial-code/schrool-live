import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import AdminDashboardComponent from "@/components/AdminDashboard";
export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    // DEMO MODE: Allow access without authentication
    const isDemoMode = true; // Set to false to require authentication
    useEffect(() => {
        if (isDemoMode)
            return; // Skip auth check in demo mode
        if (loading)
            return;
        if (!user) {
            setLocation("/login");
            return;
        }
        if (user.role !== "admin") {
            setLocation("/");
            return;
        }
    }, [user, loading, setLocation]);
    if (!isDemoMode && loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Loader2, { className: "animate-spin w-8 h-8" }) }));
    }
    if (!isDemoMode && (!user || user.role !== "admin")) {
        return null;
    }
    return _jsx(AdminDashboardComponent, {});
}
