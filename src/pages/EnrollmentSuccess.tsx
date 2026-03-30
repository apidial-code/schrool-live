import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Mail, Calendar, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function EnrollmentSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid);
  }, []);

  const { data: enrollment, isLoading } = trpc.enrollment.getEnrollmentBySessionId.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading your enrollment details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Enrollment Not Found</CardTitle>
            <CardDescription>We couldn't find your enrollment details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">SCHROOL</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Enrollment Successful!</h2>
          <p className="text-xl text-gray-600">
            Welcome to SCHROOL, {enrollment.studentName}!
          </p>
        </div>

        {/* Enrollment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enrollment Details</CardTitle>
            <CardDescription>Your course information and next steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-600">Student Name</div>
                  <div className="text-gray-900">{enrollment.studentName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-600">Grade/Year</div>
                  <div className="text-gray-900">{enrollment.studentGrade}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-600">Parent Email</div>
                  <div className="text-gray-900">{enrollment.parentEmail}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-600">Payment Status</div>
                  <div className="text-green-600 font-semibold">
                    {enrollment.paymentType === 'upfront' ? 'Paid in Full' : 'Deposit Paid'}
                  </div>
                </div>
              </div>
            </div>

            {enrollment.paymentType === 'payment_plan' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Payment Plan Details</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Deposit: ${enrollment.depositAmount} (Paid)</li>
                  <li>• Remaining: 5 monthly payments of ${enrollment.monthlyAmount}</li>
                  <li>• Next payment: Automatically charged on the same date next month</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Check Your Email</h4>
                  <p className="text-sm text-gray-600">
                    We've sent a confirmation email to <strong>{enrollment.parentEmail}</strong> with your login credentials and course access details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Access Your Course</h4>
                  <p className="text-sm text-gray-600">
                    Log in to your student dashboard to start learning. All 24 lessons are available immediately.
                  </p>
                </div>
              </div>

              {/* Elite tier only: Phone Tutor Support and Zoom Attendance */}
              {enrollment.tier === 'elite' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone Tutor Support</h4>
                      <p className="text-sm text-gray-600">
                        Remember: Phone tutor support if required is available every Wednesday from 6-10 PM Aus Standard time for the duration of the course.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Complete Within 6 Months</h4>
                      <p className="text-sm text-gray-600">
                        You have to attend every Zoom meeting with your assigned Teacher for the next 24 weeks. Your progress and performance will be available in the dashboard.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => navigate('/login')} className="flex-1" size="lg">
            Go to Login
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1" size="lg">
            Return to Home
          </Button>
        </div>

        {/* Support */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help? Contact us at <a href="mailto:support@schrool.com" className="text-blue-600 hover:underline">support@schrool.com</a></p>
        </div>
      </div>
    </div>
  );
}
