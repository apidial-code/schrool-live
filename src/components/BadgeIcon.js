import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Award } from "lucide-react";
export function BadgeIcon({ type, size = "md" }) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };
    const iconSize = {
        sm: 16,
        md: 24,
        lg: 32,
    };
    // Badge colors
    const isGreen = type === "green_revision";
    const badgeColor = isGreen ? "text-green-600" : "text-blue-600";
    const bgColor = isGreen ? "bg-green-50" : "bg-blue-50";
    // Number of stripes for blue badges
    const stripes = type === "blue_1_stripe" ? 1 : type === "blue_2_stripe" ? 2 : type === "blue_3_stripe" ? 3 : 0;
    return (_jsxs("div", { className: `relative ${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center`, children: [_jsx(Award, { className: badgeColor, size: iconSize[size] }), stripes > 0 && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "flex gap-0.5", children: Array.from({ length: stripes }).map((_, i) => (_jsx("div", { className: "w-0.5 h-6 bg-blue-600 rounded-full", style: {
                            height: size === "sm" ? "12px" : size === "md" ? "18px" : "24px",
                        } }, i))) }) }))] }));
}
