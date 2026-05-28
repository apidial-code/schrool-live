interface Certificate {
    id: number;
    certificateId: string;
    certificateUrl: string;
    completedAt: string;
    lesson: {
        title: string;
    };
}
interface LessonCertificatesProps {
    certificates: Certificate[];
    isLoading: boolean;
}
export declare function LessonCertificates({ certificates, isLoading }: LessonCertificatesProps): import("react/jsx-runtime").JSX.Element;
export {};
