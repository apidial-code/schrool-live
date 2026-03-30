import { Download, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function LessonCertificates({ certificates, isLoading }: LessonCertificatesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading certificates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          My Certificates
        </CardTitle>
        <CardDescription>{certificates.length} certificates earned</CardDescription>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Complete all 3 difficulty levels to earn a certificate!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cert.lesson.title}</h3>
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(cert.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => window.open(cert.certificateUrl, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
