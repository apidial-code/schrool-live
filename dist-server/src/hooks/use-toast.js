/**
 * use-toast hook - wraps sonner's toast for shadcn/ui compatibility
 * Provides a { toast } object that matches the shadcn/ui useToast API
 */
import { toast as sonnerToast } from "sonner";
function toast(options) {
    if (typeof options === "string") {
        sonnerToast(options);
        return;
    }
    const { title, description, variant } = options;
    const message = title || description || "";
    if (variant === "destructive") {
        sonnerToast.error(message, description && title ? { description } : undefined);
    }
    else {
        sonnerToast.success(message, description && title ? { description } : undefined);
    }
}
export function useToast() {
    return { toast };
}
