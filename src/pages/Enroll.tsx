import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle2, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

export default function Enroll() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Student info
    studentName: '',
    studentAge: '',
    studentGrade: 'Year 5/6',
    // Parent info
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    // Address
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressPostcode: '',
    // Optional
    diagnosticTestScore: '',
    suggestedEnrollmentDate: undefined as Date | undefined,
    // Payment
    paymentType: 'upfront' as 'upfront' | 'payment_plan',
    termsAccepted: false,
  });

  const createCheckout = trpc.enrollment.createPublicCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      alert('Error creating checkout: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      alert('Please accept the Terms & Conditions');
      return;
    }

    createCheckout.mutate({
      studentName: formData.studentName,
      studentAge: parseInt(formData.studentAge),
      studentGrade: formData.studentGrade,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      addressStreet: formData.addressStreet,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      addressPostcode: formData.addressPostcode,
      diagnosticTestScore: formData.diagnosticTestScore ? parseInt(formData.diagnosticTestScore) : undefined,
      suggestedEnrollmentDate: formData.suggestedEnrollmentDate?.toISOString(),
      paymentType: formData.paymentType,
      courseId: 1, // Year 5/6 Standard course
      tier: 'standard',
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SCHROOL Enrollment</h1>
              <p className="text-gray-600 mt-1">Year 5/6 Combined Program - Standard Course</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Step {step} of 3</div>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Step 1: Student Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Student Information
              </CardTitle>
              <CardDescription>Tell us about the student who will be enrolling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Full Name *</Label>
                  <Input
                    id="studentName"
                    placeholder="John Smith"
                    value={formData.studentName}
                    onChange={(e) => updateField('studentName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentAge">Student Age *</Label>
                  <Input
                    id="studentAge"
                    type="number"
                    placeholder="10"
                    value={formData.studentAge}
                    onChange={(e) => updateField('studentAge', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentGrade">Current Grade/Year *</Label>
                <Input
                  id="studentGrade"
                  value={formData.studentGrade}
                  onChange={(e) => updateField('studentGrade', e.target.value)}
                  placeholder="Year 5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosticTestScore">Diagnostic Test Score (Optional)</Label>
                <Input
                  id="diagnosticTestScore"
                  type="number"
                  placeholder="85"
                  value={formData.diagnosticTestScore}
                  onChange={(e) => updateField('diagnosticTestScore', e.target.value)}
                />
                <p className="text-sm text-gray-500">If your child completed our diagnostic test, enter their score here</p>
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={!formData.studentName || !formData.studentAge || !formData.studentGrade}
                className="w-full"
              >
                Continue to Parent Information
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Parent & Contact Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Parent & Contact Information</CardTitle>
              <CardDescription>We'll use this information to contact you about your child's progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    placeholder="Jane Smith"
                    value={formData.parentName}
                    onChange={(e) => updateField('parentName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email Address *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.parentEmail}
                    onChange={(e) => updateField('parentEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="+61 400 000 000"
                  value={formData.parentPhone}
                  onChange={(e) => updateField('parentPhone', e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Address</Label>
                <Input
                  placeholder="Street Address"
                  value={formData.addressStreet}
                  onChange={(e) => updateField('addressStreet', e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="City"
                    value={formData.addressCity}
                    onChange={(e) => updateField('addressCity', e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={formData.addressState}
                    onChange={(e) => updateField('addressState', e.target.value)}
                  />
                  <Input
                    placeholder="Postcode"
                    value={formData.addressPostcode}
                    onChange={(e) => updateField('addressPostcode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Suggested Enrollment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.suggestedEnrollmentDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.suggestedEnrollmentDate ? (
                        format(formData.suggestedEnrollmentDate, 'PPP')
                      ) : (
                        <span>Pick a date (within 2-3 days recommended)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.suggestedEnrollmentDate}
                      onSelect={(date) => updateField('suggestedEnrollmentDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!formData.parentName || !formData.parentEmail || !formData.parentPhone}
                  className="flex-1"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Payment Options
              </CardTitle>
              <CardDescription>Choose your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={formData.paymentType} onValueChange={(value) => updateField('paymentType', value)}>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="upfront" id="upfront" />
                  <Label htmlFor="upfront" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg">Full Payment - $997</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Pay in full today and save $121
                    </div>
                    <div className="text-xs text-green-600 mt-2 font-medium">
                      ✓ Best Value - Recommended
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="payment_plan" id="payment_plan" />
                  <Label htmlFor="payment_plan" className="flex-1 cursor-pointer">
                    <div className="font-semibold text-lg">Payment Plan - $1,118</div>
                    <div className="text-sm text-gray-600 mt-1">
                      30% deposit ($335.40) + 5 monthly payments of $156.52
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Total: $1,118 (includes $121 payment plan fee)
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Standard Course Includes:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    24 comprehensive lessons (Year 5/6 Combined)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Self-paced learning (complete within 12 months)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Phone tutor support: Wednesdays 6-7 PM (3 months)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Access to all course materials and resources
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Progress tracking and reporting
                  </li>
                </ul>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => updateField('termsAccepted', checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and understand that payment is required to complete enrollment
                </Label>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.termsAccepted || createCheckout.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createCheckout.isPending ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
