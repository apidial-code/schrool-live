/**
 * Unified Enrollment Form for SCHROOL Platform
 * 
 * Supports:
 * - All year levels (5/6, 7, 8, 9)
 * - Standard and Elite tiers
 * - Upfront and Payment Plan options
 * - Dynamic pricing display
 * - Stripe checkout integration
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, CreditCard, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  type YearLevel,
  type Tier,
  type PaymentMethod,
  PRICING,
  getPaymentBreakdown,
  formatCurrency,
  getYearLevelName,
  getTierName,
} from '../../../shared/pricing';

export function EnrollmentForm() {
  // Form state
  const [yearLevel, setYearLevel] = useState<YearLevel>('year5-6');
  const [tier, setTier] = useState<Tier>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upfront');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get pricing details
  const pricing = PRICING[yearLevel][tier];
  const breakdown = getPaymentBreakdown(yearLevel, tier, paymentMethod);

  // Stripe checkout mutation
  const createCheckout = trpc.enrollmentNew.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!studentEmail.trim()) newErrors.studentEmail = 'Student email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      newErrors.studentEmail = 'Invalid email format';
    }
    if (!parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!parentEmail.trim()) newErrors.parentEmail = 'Parent email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      newErrors.parentEmail = 'Invalid email format';
    }
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    createCheckout.mutate({
      yearLevel,
      tier,
      paymentMethod,
      studentName,
      studentEmail,
      studentAge: '',
      parentName,
      parentEmail,
      phone,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Enroll in SCHROOL</h1>
          <p className="text-lg text-gray-600">
            Transform your child's mathematics journey with our proven 5QHackMath methodology
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Course Enrollment</CardTitle>
            <CardDescription>
              Select your course level, tier, and payment preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Year Level Selection */}
              <div className="space-y-2">
                <Label htmlFor="yearLevel">Year Level</Label>
                <Select value={yearLevel} onValueChange={(v) => setYearLevel(v as YearLevel)}>
                  <SelectTrigger id="yearLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year5-6">Year 5/6 (24 weeks)</SelectItem>
                    <SelectItem value="year7">Year 7 (26 weeks)</SelectItem>
                    <SelectItem value="year8">Year 8 (28 weeks)</SelectItem>
                    <SelectItem value="year9">Year 9 (30 weeks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tier Selection */}
              <div className="space-y-3">
                <Label>Course Tier</Label>
                <RadioGroup value={tier} onValueChange={(v) => setTier(v as Tier)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Tier */}
                    <Card
                      className={`cursor-pointer transition-all ${
                        tier === 'standard'
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setTier('standard')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div className="flex-1">
                            <Label htmlFor="standard" className="text-lg font-semibold cursor-pointer">
                              Standard
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Self-paced video lessons with exercises
                            </p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                              {formatCurrency(PRICING[yearLevel].standard.upfront)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Elite Tier */}
                    <Card
                      className={`cursor-pointer transition-all ${
                        tier === 'elite'
                          ? 'ring-2 ring-purple-500 bg-purple-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setTier('elite')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="elite" id="elite" />
                          <div className="flex-1">
                            <Label htmlFor="elite" className="text-lg font-semibold cursor-pointer">
                              Premium Elite
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              1-on-1 Zoom tutoring + all Standard features
                            </p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">
                              {formatCurrency(PRICING[yearLevel].elite.upfront)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {PRICING[yearLevel].sessions} Zoom sessions (2×/week)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <div className="space-y-3">
                    {/* Upfront Payment */}
                    <Card
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'upfront'
                          ? 'ring-2 ring-green-500 bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod('upfront')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="upfront" id="upfront" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="upfront" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Pay in Full
                              </Label>
                              <span className="text-2xl font-bold text-green-600">
                                {formatCurrency(pricing.upfront)}
                              </span>
                            </div>
                            {breakdown.savings && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                Save {formatCurrency(breakdown.savings)}!
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Plan */}
                    <Card
                      className={`cursor-pointer transition-all ${
                        paymentMethod === 'payment-plan'
                          ? 'ring-2 ring-orange-500 bg-orange-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setPaymentMethod('payment-plan')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value="payment-plan" id="payment-plan" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor="payment-plan"
                                className="text-base font-semibold cursor-pointer flex items-center gap-2"
                              >
                                <Calendar className="h-4 w-4" />
                                Payment Plan
                              </Label>
                              <span className="text-2xl font-bold text-orange-600">
                                {formatCurrency(breakdown.total)}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Deposit:</span> {formatCurrency(breakdown.deposit!)} (50%)
                              </p>
                              <p>
                                <span className="font-medium">Then:</span> {breakdown.numberOfPayments}× monthly payments of{' '}
                                {formatCurrency(breakdown.monthlyPayment!)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              {/* Student Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student's full name"
                    />
                    {errors.studentName && (
                      <p className="text-sm text-red-600">{errors.studentName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Student Email *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@example.com"
                    />
                    {errors.studentEmail && (
                      <p className="text-sm text-red-600">{errors.studentEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name *</Label>
                    <Input
                      id="parentName"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Enter parent's full name"
                    />
                    {errors.parentName && (
                      <p className="text-sm text-red-600">{errors.parentName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                    />
                    {errors.parentEmail && (
                      <p className="text-sm text-red-600">{errors.parentEmail}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+61 4XX XXX XXX"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Error Alert */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Proceed to Payment - {formatCurrency(paymentMethod === 'upfront' ? breakdown.total : breakdown.deposit!)}
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <p className="text-xs text-center text-gray-500">
                Secure payment powered by Stripe. Your payment information is encrypted and never stored on our servers.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Phone Tutor Contact */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Questions? Call our Phone Tutor:{' '}
            <a href="tel:+61499989179" className="font-semibold text-blue-600 hover:underline">
              +61 499 989 179
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Will be replaced with 1800 number at launch)
          </p>
        </div>
      </div>
    </div>
  );
}
