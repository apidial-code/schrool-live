interface ToastOptions {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}
declare function toast(options: ToastOptions | string): void;
export declare function useToast(): {
    toast: typeof toast;
};
export {};
