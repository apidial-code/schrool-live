import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
export default function MagicLinkLogin() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState("email");
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleRequestMagicLink = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Call the backend to generate and send magic link
            const response = await fetch("/api/magic-link/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
                credentials: "include",
            });
            const data = await response.json();
            if (data.success) {
                setStep("sent");
                // For demo purposes, show the token if provided
                if (data.token) {
                    setToken(data.token);
                }
            }
            else {
                setError(data.message || "Failed to send magic link");
            }
        }
        catch (err) {
            setError(err.message || "An error occurred");
        }
        finally {
            setLoading(false);
        }
    };
    const handleUseMagicLink = () => {
        if (token) {
            // Redirect to the magic link verification endpoint
            window.location.href = `/auth/magic?token=${token}`;
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs(Card, { className: "w-full max-w-md p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4", children: _jsx(Mail, { className: "w-6 h-6 text-blue-600" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Magic Link Login" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Passwordless authentication for SCHROOL" })] }), step === "email" && (_jsxs("form", { onSubmit: handleRequestMagicLink, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address" }), _jsx(Input, { type: "email", placeholder: "student@schrool.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("p", { className: "text-sm text-red-600", children: error })] })), _jsx(Button, { type: "submit", className: "w-full", disabled: loading || !email, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Sending..."] })) : ("Send Magic Link") }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: "Demo users: student@schrool.com, parent@schrool.com, teacher@schrool.com, admin@schrool.com" })] })), step === "sent" && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Check Your Email" }), _jsxs("p", { className: "text-gray-600 mb-4", children: ["We've sent a magic link to ", _jsx("strong", { children: email })] }), _jsx("p", { className: "text-sm text-gray-500", children: "Click the link in your email to log in. The link expires in 1 hour." })] }), token && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200", children: [_jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Demo Token (for testing):" }), _jsx("code", { className: "text-xs break-all font-mono text-gray-900", children: token }), _jsx(Button, { onClick: handleUseMagicLink, className: "w-full mt-3", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Logging in..."] })) : ("Use This Token") })] })), _jsx(Button, { variant: "outline", className: "w-full", onClick: () => {
                                setStep("email");
                                setEmail("");
                                setError("");
                                setToken("");
                            }, children: "Try Another Email" }), error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("p", { className: "text-sm text-red-600", children: error })] }))] }))] }) }));
}
