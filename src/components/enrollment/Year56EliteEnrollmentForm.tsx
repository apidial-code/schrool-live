import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

interface Year56EliteEnrollmentFormProps {
  onSuccess?: (enrollmentId: string) => void;
}

export function Year56EliteEnrollmentForm({
  onSuccess,
}: Year56EliteEnrollmentFormProps) {
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<'upfront' | 'payment_plan'>('upfront');
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast({
        title: 'Error',
        description: 'Please accept the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result: any = await (createCheckoutMutation.mutateAsync as any)({
        paymentType,
        studentName: formData.studentName,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
      });

      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
        toast({
          title: 'Success',
          description: 'Redirecting to payment page...',
        });
        onSuccess?.(result);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create enrollment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#4169E1]">
            Year 5/6 Mathematics Excellence - Elite
          </h1>
          <p className="text-gray-600">
            Premium tier with dedicated elite teacher and twice-weekly Zoom sessions
          </p>
          <div className="mt-2 inline-block bg-[#4169E1] text-white px-3 py-1 rounded-full text-sm font-semibold">
            Course Duration: 6 months (24 weeks)
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 p-4 bg-[#EEF2FF] rounded-lg border border-[#4169E1]">
          <h3 className="font-semibold mb-3 text-[#4169E1]">What's Included:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Year 5/6 curriculum</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Dedicated elite teacher assignment</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Intense course duration: 24 weeks</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>48 one-to-one hourly Zoom sessions</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>2x weekly Zoom sessions (live tutoring)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Personalized learning plan</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Parents' own dashboard for monitoring</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Parents' access to teacher via internal messages</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Parents' passive attendance encouraged</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Parents' limited participation if required</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Monthly assessments</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Achievement badges and trophies</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Scholarship for excellence</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Certificate of achievement</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Priority email support (24-hour response)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Monthly progress reports</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-[#22C55E]">✓</span>
              <span>Access to exclusive learning resources</span>
            </li>
          </ul>
        </div>

        {/* Payment Options */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Payment Options:</h3>
          <RadioGroup value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
            <div className="space-y-4">
              {/* Upfront Payment */}
              <div className={`flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                paymentType === 'upfront' ? 'bg-[#EEF2FF] border-[#4169E1]' : 'border-gray-200'
              }`}>
                <RadioGroupItem value="upfront" id="upfront" className="mt-1" />
                <Label htmlFor="upfront" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Full Payment</div>
                  <div className="text-sm text-gray-600">Pay the full amount upfront</div>
                  <div className="text-lg font-bold text-[#4169E1] mt-1">$5,897.00</div>
                </Label>
              </div>

              {/* Installment Payment */}
              <div className={`flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                paymentType === 'payment_plan' ? 'bg-[#EEF2FF] border-[#4169E1]' : 'border-gray-200'
              }`}>
                <RadioGroupItem value="payment_plan" id="payment_plan" className="mt-1" />
                <Label htmlFor="payment_plan" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Payment Plan</div>
                  <div className="text-sm text-gray-600">30% deposit now, then 3 equal monthly payments</div>
                  <div className="text-sm text-gray-700 mt-1">
                    <div>Deposit: $1,892.10</div>
                    <div>Monthly: $1,471.63 × 3 months</div>
                  </div>
                  <div className="text-lg font-bold text-[#4169E1] mt-1">Total: $6,307.00</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Name */}
          <div>
            <Label htmlFor="studentName" className="font-semibold">
              Student Name *
            </Label>
            <Input
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              placeholder="Enter student's full name"
              required
              className="mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]"
            />
          </div>

          {/* Parent Name */}
          <div>
            <Label htmlFor="parentName" className="font-semibold">
              Parent/Guardian Name *
            </Label>
            <Input
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              placeholder="Enter parent/guardian's full name"
              required
              className="mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]"
            />
          </div>

          {/* Parent Email */}
          <div>
            <Label htmlFor="parentEmail" className="font-semibold">
              Parent/Guardian Email *
            </Label>
            <Input
              id="parentEmail"
              name="parentEmail"
              type="email"
              value={formData.parentEmail}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              className="mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]"
            />
          </div>

          {/* Parent Phone */}
          <div>
            <Label htmlFor="parentPhone" className="font-semibold">
              Parent/Guardian Phone *
            </Label>
            <Input
              id="parentPhone"
              name="parentPhone"
              type="tel"
              value={formData.parentPhone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
              className="mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
              }
              className="mt-1"
            />
            <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
              I agree to the{' '}
              <a href="/terms" className="text-[#4169E1] hover:underline" target="_blank">
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-[#4169E1] hover:underline" target="_blank">
                Privacy Policy
              </a>
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4169E1] hover:bg-[#3358C4] text-white font-semibold py-3 rounded-lg"
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted
          </p>
        </form>
      </Card>
    </div>
  );
}
