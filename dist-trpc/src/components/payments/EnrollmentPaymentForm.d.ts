interface EnrollmentPaymentFormProps {
    enrollmentId: number;
    courseTitle: string;
    standardPrice: number;
    elitePrice: number;
    tier: "standard" | "elite";
    onPaymentSuccess?: () => void;
}
export declare function EnrollmentPaymentForm({ enrollmentId, courseTitle, standardPrice, elitePrice, tier, onPaymentSuccess, }: EnrollmentPaymentFormProps): import("react/jsx-runtime").JSX.Element;
export {};
