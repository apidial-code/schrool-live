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
import { CheckCircle2, Clock, Users, Video, MessageSquare, FileText } from "lucide-react";

export default function EliteEnrollment() {
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
    
    // Tutor Session Days (2 selections required)
    sessionDay1: "",
    sessionDay2: "",
    
    // Payment Option
    paymentOption: "", // upfront or plan
    
    // Terms Acceptance
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const courseLevels = [
    { value: "Y5-6", label: "Year 5/6 Elite Course", description: "Foundation level with advanced problem-solving" },
    { value: "Y7", label: "Year 7 Elite Course", description: "Intermediate level with critical thinking focus" },
    { value: "Y8", label: "Year 8 Elite Course", description: "Advanced level with complex problem-solving" },
    { value: "Y9", label: "Year 9 Elite Course", description: "Expert level with competition preparation" },
  ];

  const sessionDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDaySelection = (day: string, position: 1 | 2) => {
    const field = position === 1 ? "sessionDay1" : "sessionDay2";
    const otherField = position === 1 ? "sessionDay2" : "sessionDay1";
    
    // Prevent selecting the same day twice
    if (formData[otherField] === day) {
      toast.error("Please select two different days for your sessions");
      return;
    }
    
    handleInputChange(field, day);
  };

  const validateForm = () => {
    if (!formData.studentFirstName || !formData.studentLastName || !formData.studentEmail || !formData.studentAge) {
      toast.error("Please fill in all student details including age");
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
    if (!formData.sessionDay1 || !formData.sessionDay2) {
      toast.error("Please select two days for your weekly sessions");
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

      // Capitalize day names for webhook
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const preferredDays = `${capitalize(formData.sessionDay1)},${capitalize(formData.sessionDay2)}`;

      // Create Stripe checkout session
      const result = await createCheckout.mutateAsync({
        yearLevel,
        tier: 'elite',
        paymentMethod: formData.paymentOption === 'upfront' ? 'upfront' : 'payment-plan',
        studentName: `${formData.studentFirstName} ${formData.studentLastName}`,
        studentEmail: formData.studentEmail,
        studentAge: formData.studentAge, // Add student age
        parentName: `${formData.parentFirstName} ${formData.parentLastName}`,
        parentEmail: formData.parentEmail,
        phone: formData.parentPhone,
        preferredDays,
      });

      // Redirect to Stripe Checkout
      toast.success("Redirecting to secure payment...");
      window.location.href = result.url;
      
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
              Elite Program
            </div>
            <h1 className="text-4xl font-bold">Premium Math Course</h1>
            <p className="text-xl text-blue-100">
              This exclusive course includes 24+ weeks of personalised instruction and dedicated teacher support
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
              <CardTitle className="text-lg">24+ Weeks Duration</CardTitle>
              <CardDescription>Twice 1-hour weekly sessions</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Dedicated Teacher</CardTitle>
              <CardDescription>Personalised instruction and support</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader>
              <Video className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Live Zoom Sessions</CardTitle>
              <CardDescription>Interactive online learning</CardDescription>
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
                  <div className="font-semibold text-gray-900">Personalised Instruction</div>
                  <div className="text-sm text-gray-600">One-on-one attention from certified teachers</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Dedicated Teacher Support</div>
                  <div className="text-sm text-gray-600">Consistent teacher throughout the course</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Access to Monitored Resources</div>
                  <div className="text-sm text-gray-600">Curated learning materials and practice exercises</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Parent's Internal Message Access</div>
                  <div className="text-sm text-gray-600">Direct communication with teacher and progress updates</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Progress Tracking</div>
                  <div className="text-sm text-gray-600">Detailed analytics and performance reports</div>
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
            <CardTitle className="text-2xl text-blue-900">Elite Program Enrollment</CardTitle>
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

              {/* Tutor Session Days */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2">
                  Select Two Days for Weekly Sessions *
                </h3>
                <p className="text-sm text-gray-600">Choose two different days for your 1-hour sessions each week</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>First Session Day</Label>
                    <RadioGroup value={formData.sessionDay1} onValueChange={(value) => handleDaySelection(value, 1)}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sessionDays.map((day) => (
                          <div key={`day1-${day.value}`} className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value={day.value} id={`day1-${day.value}`} disabled={formData.sessionDay2 === day.value} />
                            <Label htmlFor={`day1-${day.value}`} className="cursor-pointer flex-1">{day.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Second Session Day</Label>
                    <RadioGroup value={formData.sessionDay2} onValueChange={(value) => handleDaySelection(value, 2)}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sessionDays.map((day) => (
                          <div key={`day2-${day.value}`} className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value={day.value} id={`day2-${day.value}`} disabled={formData.sessionDay1 === day.value} />
                            <Label htmlFor={`day2-${day.value}`} className="cursor-pointer flex-1">{day.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
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
                        SAVE $410
                      </div>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="upfront" id="upfront" className="mt-1" />
                        <Label htmlFor="upfront" className="flex-1 cursor-pointer">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900">$5,584</span>
                            <span className="text-lg text-gray-500 line-through">$5,994</span>
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">Pay in Full (Best Value)</div>
                          <div className="text-sm text-gray-600">One-time payment - Save $410 compared to payment plan</div>
                        </Label>
                      </div>
                    </div>

                    {/* Payment Plan Option */}
                    <div className="border border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="plan" id="plan" className="mt-1" />
                        <Label htmlFor="plan" className="flex-1 cursor-pointer">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold text-gray-900">$5,994</span>
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">Payment Plan</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>• 30% Deposit: <span className="font-semibold">$1,798.20</span> (due today)</div>
                            <div>• 4 Monthly Payments: <span className="font-semibold">$1,049.50</span> each</div>
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
