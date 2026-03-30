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
import { CheckCircle2, Clock, Users, Video, Eye, EyeOff } from "lucide-react";

export default function Year8EliteEnrollmentPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const [formData, setFormData] = useState({
    studentFirstName: "",
    studentLastName: "",
    studentEmail: "",
    studentPhone: "",
    studentAge: "",
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    courseLevel: "Y8",
    sessionDay1: "",
    sessionDay2: "",
    paymentOption: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      toast.success("Proceeding to secure payment...");
      setTimeout(() => {
        setLocation("/enrollment/success");
      }, 1500);
    } catch (error) {
      toast.error("Enrollment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Elite Program
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Premium Math Course</h1>
          <p className="text-lg text-gray-600">Year 8 Mathematics Excellence</p>
          <p className="text-gray-500 mt-2">This exclusive course includes 43+ weeks of personalised instruction and dedicated teacher support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Clock className="w-8 h-8 text-orange-600 mb-2" />
              <p className="font-semibold">43+ Weeks Duration</p>
              <p className="text-sm text-gray-600">Twice 1-hour weekly sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-orange-600 mb-2" />
              <p className="font-semibold">Dedicated Teacher</p>
              <p className="text-sm text-gray-600">Personalised instruction and support</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Video className="w-8 h-8 text-orange-600 mb-2" />
              <p className="font-semibold">Live Zoom Sessions</p>
              <p className="text-sm text-gray-600">Interactive online learning</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Personalised Instruction - One-on-one attention from certified teachers",
                "Dedicated Teacher Support - Consistent teacher throughout the course",
                "Access to Monitored Resources - Curated learning materials and practice exercises",
                "Parent's Internal Message Access - Direct communication with teacher and progress updates",
                "Progress Tracking - Detailed analytics and performance reports",
                "Certificate of Completion - Official recognition upon course completion"
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elite Program Enrollment - Year 8</CardTitle>
            <CardDescription>Complete the form below to begin your enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentFirstName">First Name *</Label>
                    <Input
                      id="studentFirstName"
                      type="text"
                      placeholder="John"
                      value={formData.studentFirstName}
                      onChange={(e) => handleInputChange("studentFirstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentLastName">Last Name *</Label>
                    <Input
                      id="studentLastName"
                      type="text"
                      placeholder="Smith"
                      value={formData.studentLastName}
                      onChange={(e) => handleInputChange("studentLastName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentEmail">Email *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.studentEmail}
                      onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentPhone">Phone</Label>
                    <Input
                      id="studentPhone"
                      type="tel"
                      placeholder="+61 412 345 678"
                      value={formData.studentPhone}
                      onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentAge">Age *</Label>
                    <Input
                      id="studentAge"
                      type="number"
                      placeholder="13"
                      value={formData.studentAge}
                      onChange={(e) => handleInputChange("studentAge", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentFirstName">First Name *</Label>
                    <Input
                      id="parentFirstName"
                      type="text"
                      placeholder="Jane"
                      value={formData.parentFirstName}
                      onChange={(e) => handleInputChange("parentFirstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentLastName">Last Name *</Label>
                    <Input
                      id="parentLastName"
                      type="text"
                      placeholder="Smith"
                      value={formData.parentLastName}
                      onChange={(e) => handleInputChange("parentLastName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentEmail">Email *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentPhone">Phone *</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="+61 412 345 679"
                      value={formData.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Select Two Days for Weekly Sessions *
                </h3>
                <p className="text-sm text-gray-600 mb-4">Choose two different days for your 1-hour sessions each week</p>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">First Session Day</Label>
                    <RadioGroup value={formData.sessionDay1} onValueChange={(val) => handleDaySelection(val, 1)}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sessionDays.map(day => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={day.value} id={`day1-${day.value}`} />
                            <Label htmlFor={`day1-${day.value}`} className="cursor-pointer">{day.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Second Session Day</Label>
                    <RadioGroup value={formData.sessionDay2} onValueChange={(val) => handleDaySelection(val, 2)}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sessionDays.map(day => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={day.value} id={`day2-${day.value}`} />
                            <Label htmlFor={`day2-${day.value}`} className="cursor-pointer">{day.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Payment Options
                </h3>
                <RadioGroup value={formData.paymentOption} onValueChange={(val) => handleInputChange("paymentOption", val)}>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-orange-50" onClick={() => handleInputChange("paymentOption", "upfront")}>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="upfront" id="upfront" />
                        <div className="flex-1">
                          <Label htmlFor="upfront" className="cursor-pointer font-semibold text-lg">
                            $6,897 - Pay in Full
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">One-time payment - complete access to the course</p>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 cursor-pointer hover:bg-orange-50" onClick={() => handleInputChange("paymentOption", "plan")}>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="plan" id="plan" />
                        <div className="flex-1">
                          <Label htmlFor="plan" className="cursor-pointer font-semibold text-lg">
                            $7,297 - Payment Plan
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            • 30% Deposit: $2,189.10 (due today)<br/>
                            • 3 Monthly Payments: $1,702.63 each<br/>
                            No interest charged - flexible payment schedule
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                    Payment Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showPaymentDetails ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                
                {showPaymentDetails ? (
                  <div className="space-y-4 bg-white p-4 rounded border border-yellow-200">
                    <p className="text-sm text-gray-600 font-semibold">🔒 Secure payment powered by Stripe</p>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        type="text"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date *</Label>
                        <Input
                          id="cardExpiry"
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCVC">CVC *</Label>
                        <Input
                          id="cardCVC"
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded border border-yellow-200 text-center text-gray-500">
                    <p>Payment details hidden for privacy</p>
                    <p className="text-sm mt-1">Click "Show" to enter payment information</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                  />
                  <Label htmlFor="acceptTerms" className="cursor-pointer text-sm">
                    I accept the <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onCheckedChange={(checked) => handleInputChange("acceptPrivacy", checked)}
                  />
                  <Label htmlFor="acceptPrivacy" className="cursor-pointer text-sm">
                    I accept the <a href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</a>
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
              >
                {loading ? "Processing..." : "Proceed to Secure Payment"}
              </Button>
              <p className="text-center text-xs text-gray-500">🔒 Secure payment powered by Stripe</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
