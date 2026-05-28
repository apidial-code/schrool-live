interface AuthDialogProps {
    title?: string;
    logo?: string;
    open?: boolean;
    onLogin: () => void;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
}
export declare function AuthDialog({ title, logo, open, onLogin, onOpenChange, onClose, }: AuthDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
