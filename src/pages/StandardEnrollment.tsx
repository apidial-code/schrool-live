import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, Video, BookOpen, Phone, FileText } from "lucide-react";

export default function StandardEnrollment() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Student Information
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhone: "",
    studentAge: "",
    
    // Parent/Guardian Information
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    
    // Course Selection
    courseLevel: "", // Y5/6, Y7, Y8, Y9
    
    // Payment Option
    paymentOption: "", // upfront or plan
    
    // Terms Acceptance
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const courseLevels = [
    { value: "Y5-6", label: "Year 5/6 Standard Course", description: "Foundation level with self-paced learning" },
    { value: "Y7", label: "Year 7 Standard Course", description: "Intermediate level with guided practice" },
    { value: "Y8", label: "Year 8 Standard Course", description: "Advanced level with comprehensive exercises" },
    { value: "Y9", label: "Year 9 Standard Course", description: "Expert level with challenging problems" },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.studentFirstName || !formData.studentLastName || !formData.studentEmail) {
      toast.error("Please fill in all student details");
      return false;
    }
    if (!formData.parentFirstName || !formData.parentLastName || !formData.parentEmail) {
      toast.error("Please fill in all parent/guardian details");
      return false;
    }
    if (!formData.courseLevel) {
      toast.error("Please select a course level");
      return false;
    }
    if (!formData.paymentOption) {
      toast.error("Please select a payment option");
      return false;
    }
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      toast.error("Please accept Terms of Service and Privacy Policy");
      return false;
    }
    return true;
  };

  const createCheckout = trpc.enrollmentNew.createCheckoutSession.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Map course level to year level format
      const yearLevelMap: Record<string, 'year5-6' | 'year7' | 'year8' | 'year9'> = {
        'Y5-6': 'year5-6',
        'Y7': 'year7',
        'Y8': 'year8',
        'Y9': 'year9',
      };

      const yearLevel = yearLevelMap[formData.courseLevel];
      if (!yearLevel) {
        toast.error("Invalid course level selected");
        return;
      }

      // Create Stripe checkout session
      const result = await createCheckout.mutateAsync({
        yearLevel,
        tier: 'standard',
        paymentMethod: formData.paymentOption === 'upfront' ? 'upfront' : 'payment-plan',
        studentName: `${formData.studentFirstName} ${formData.studentLastName}`,
        studentEmail: formData.studentEmail,
        studentAge: formData.studentAge || "10",
        parentName: `${formData.parentFirstName} ${formData.parentLastName}`,
        parentEmail: formData.parentEmail,
        phone: formData.parentPhone,
      });

      // Redirect to Stripe Checkout
      toast.success("Redirecting to secure payment...");
      window.location.href = (result as any).checkoutUrl || (result as any).url;
      
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error("Enrollment failed. Please try again or contact support");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container max-w-4xl">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1 bg-blue-500 rounded-full text-sm font-semibold mb-2">
              Standard Program
            </div>
            <h1 className="text-4xl font-bold">Self-Paced Math Course</h1>
            <p className="text-xl text-blue-100">
              Learn at your own pace with 12 months access to comprehensive video lessons and practice exercises
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container max-w-6xl py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-200">
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">12 Months Access</CardTitle>
              <CardDescription>Self-paced - complete at your own speed</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader>
              <Video className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Video Lessons</CardTitle>
              <CardDescription>Pre-recorded comprehensive lessons</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader>
              <Phone className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Phone Tutor Support</CardTitle>
              <CardDescription>3 months assistance included</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="mb-12 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Self-Paced Video Lessons</div>
                  <div className="text-sm text-gray-600">Comprehensive pre-recorded lessons available 24/7</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Practice Exercises</div>
                  <div className="text-sm text-gray-600">Extensive exercise library with instant feedback</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Progress Tracking</div>
                  <div className="text-sm text-gray-600">Automated tracking and detailed analytics</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">3 Months Phone Tutor Assistance</div>
                  <div className="text-sm text-gray-600">30 mins/week on Wednesdays 18:00-19:00 (1800 SCHROOL)</div>
                  <div className="text-xs text-gray-500 mt-1">Excluding public holidays</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Access to Course Materials</div>
                  <div className="text-sm text-gray-600">Downloadable worksheets and resources</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Certificate of Completion</div>
                  <div className="text-sm text-gray-600">Official recognition upon course completion</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Form */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">Standard Program Enrollment</CardTitle>
            <CardDescription>Complete the form below to begin your enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Student Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">First Name *</Label>
                    <Input
                      id="studentFirstName"
                      value={formData.studentFirstName}
                      onChange={(e) => handleInputChange("studentFirstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">Last Name *</Label>
                    <Input
                      id="studentLastName"
                      value={formData.studentLastName}
                      onChange={(e) => handleInputChange("studentLastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPhone">Phone</Label>
                    <Input
                      id="studentPhone"
                      type="tel"
                      value={formData.studentPhone}
                      onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentAge">Age</Label>
                    <Input
                      id="studentAge"
                      type="number"
                      value={formData.studentAge}
                      onChange={(e) => handleInputChange("studentAge", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Parent/Guardian Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">First Name *</Label>
                    <Input
                      id="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={(e) => handleInputChange("parentFirstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentLastName">Last Name *</Label>
                    <Input
                      id="parentLastName"
                      value={formData.parentLastName}
                      onChange={(e) => handleInputChange("parentLastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone *</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Course Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Course Selection
                </h3>
                <RadioGroup value={formData.courseLevel} onValueChange={(value) => handleInputChange("courseLevel", value)}>
                  <div className="space-y-3">
                    {courseLevels.map((course) => (
                      <div key={course.value} className="flex items-start space-x-3 border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <RadioGroupItem value={course.value} id={course.value} className="mt-1" />
                        <Label htmlFor={course.value} className="flex-1 cursor-pointer">
                          <div className="font-semibold text-gray-900">{course.label}</div>
                          <div className="text-sm text-gray-600">{course.description}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Payment Options
                </h3>
                <RadioGroup value={formData.paymentOption} onValueChange={(value) => handleInputChange("paymentOption", value)}>
                  <div className="space-y-3">
                    {/* Upfront Payment Option */}
                    <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50 relative">
                      <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        SAVE $191
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="upfront" id="upfront" className="mt-1" />
                        <Label htmlFor="upfront" className="flex-1 cursor-pointer">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900">$997</span>
                            <span className="text-lg text-gray-500 line-through">$1,188</span>
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">Pay in Full (Best Value)</div>
                          <div className="text-sm text-gray-600">One-time payment - Save $191 compared to payment plan</div>
                        </Label>
                      </div>
                    </div>

                    {/* Payment Plan Option */}
                    <div className="border border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="plan" id="plan" className="mt-1" />
                        <Label htmlFor="plan" className="flex-1 cursor-pointer">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900">$1,188</span>
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">Payment Plan</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>• 30% Deposit: <span className="font-semibold">$356.40</span> (due today)</div>
                            <div>• 5 Monthly Payments: <span className="font-semibold">$166.32</span> each</div>
                            <div className="text-xs text-gray-500 mt-2">No interest charged - flexible payment schedule</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Terms & Conditions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm cursor-pointer leading-relaxed">
                      I accept the{" "}
                      <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-semibold">
                        Terms of Service
                      </a>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => handleInputChange("acceptPrivacy", checked as boolean)}
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm cursor-pointer leading-relaxed">
                      I accept the{" "}
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:underline font-semibold">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                >
                  {loading ? "Processing..." : "Proceed to Secure Payment"}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Secure payment powered by Stripe
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
