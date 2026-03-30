import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  CheckCircle2, 
  User, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Upload,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

export default function TeacherApplicationNew() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    timezone: "Australia/Sydney",
    linkedIn: "",
    
    // Step 2: Qualifications & Experience
    highestEducation: "",
    teachingCertifications: "",
    yearsExperience: "",
    specializations: [] as string[],
    teachingPhilosophy: "",
    
    // Step 3: Availability
    availableDays: [] as string[],
    preferredHours: "",
    maxStudents: "",
    
    // Step 4: Document Uploads
    wwccFile: null as File | null,
    certFile: null as File | null,
    idFile: null as File | null,
    
    // Step 5: Terms
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Qualifications", icon: GraduationCap },
    { number: 3, title: "Availability", icon: Calendar },
    { number: 4, title: "Documents", icon: FileText },
    { number: 5, title: "Review", icon: CheckCircle2 },
  ];

  const specializationOptions = [
    "Year 5/6 Mathematics",
    "Year 7 Mathematics",
    "Year 8 Mathematics",
    "Year 9 Mathematics",
  ];

  const dayOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast.error("Please fill in all required personal information");
          return false;
        }
        return true;
      case 2:
        if (!formData.highestEducation || !formData.yearsExperience || formData.specializations.length === 0) {
          toast.error("Please complete all qualification fields and select at least one specialization");
          return false;
        }
        return true;
      case 3:
        if (formData.availableDays.length === 0 || !formData.preferredHours) {
          toast.error("Please select available days and preferred hours");
          return false;
        }
        return true;
      case 4:
        if (!formData.wwccFile || !formData.certFile || !formData.idFile) {
          toast.error("Please upload all required documents");
          return false;
        }
        return true;
      case 5:
        if (!formData.acceptTerms || !formData.acceptPrivacy) {
          toast.error("Please accept Terms of Service and Privacy Policy");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    try {
      // TODO: Implement file upload to S3 and teacher application submission
      toast.success("Application submitted successfully! We'll review and contact you soon.");
      console.log("Teacher Application Data:", formData);
      
      // Navigate to confirmation page
      setTimeout(() => {
        setLocation("/");
      }, 2000);
      
    } catch (error) {
      toast.error("Application submission failed. Please try again or contact support");
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
            <h1 className="text-4xl font-bold">Become a SCHROOL Teacher</h1>
            <p className="text-xl text-blue-100">
              Join our team of passionate educators and make a difference
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-blue-600 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`text-sm mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute h-1 bg-gray-200" style={{ width: '100px', marginTop: '24px', marginLeft: '100px' }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "Share your qualifications and experience"}
              {currentStep === 3 && "Let us know when you're available"}
              {currentStep === 4 && "Upload required documents"}
              {currentStep === 5 && "Review and submit your application"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <select
                      id="timezone"
                      value={formData.timezone}
                      onChange={(e) => handleInputChange("timezone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                      <option value="Australia/Melbourne">Australia/Melbourne (AEDT)</option>
                      <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                      <option value="Australia/Perth">Australia/Perth (AWST)</option>
                      <option value="Australia/Adelaide">Australia/Adelaide (ACDT)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                    <Input
                      id="linkedIn"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedIn}
                      onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Qualifications & Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="highestEducation">Highest Education Level *</Label>
                  <select
                    id="highestEducation"
                    value={formData.highestEducation}
                    onChange={(e) => handleInputChange("highestEducation", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select education level</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Teaching Diploma">Teaching Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachingCertifications">Teaching Certifications</Label>
                  <Input
                    id="teachingCertifications"
                    placeholder="e.g., NSW Teaching Certificate, VIT Registration"
                    value={formData.teachingCertifications}
                    onChange={(e) => handleInputChange("teachingCertifications", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Teaching Experience *</Label>
                  <select
                    id="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Subject Specializations * (Select all that apply)</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {specializationOptions.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <Checkbox
                          id={spec}
                          checked={formData.specializations.includes(spec)}
                          onCheckedChange={() => handleSpecializationToggle(spec)}
                        />
                        <Label htmlFor={spec} className="cursor-pointer flex-1">{spec}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachingPhilosophy">Teaching Philosophy (Optional)</Label>
                  <textarea
                    id="teachingPhilosophy"
                    rows={4}
                    placeholder="Share your approach to teaching mathematics..."
                    value={formData.teachingPhilosophy}
                    onChange={(e) => handleInputChange("teachingPhilosophy", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Available Days * (Select all that apply)</Label>
                  <div className="grid md:grid-cols-4 gap-3">
                    {dayOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <Checkbox
                          id={day}
                          checked={formData.availableDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <Label htmlFor={day} className="cursor-pointer flex-1">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredHours">Preferred Teaching Hours *</Label>
                  <select
                    id="preferredHours"
                    value={formData.preferredHours}
                    onChange={(e) => handleInputChange("preferredHours", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select preferred hours</option>
                    <option value="Morning (8am-12pm)">Morning (8am-12pm)</option>
                    <option value="Afternoon (12pm-5pm)">Afternoon (12pm-5pm)</option>
                    <option value="Evening (5pm-9pm)">Evening (5pm-9pm)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Maximum Students You Can Handle</Label>
                  <select
                    id="maxStudents"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange("maxStudents", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select capacity</option>
                    <option value="1-5">1-5 students</option>
                    <option value="6-10">6-10 students</option>
                    <option value="11-15">11-15 students</option>
                    <option value="16-20">16-20 students</option>
                    <option value="20+">20+ students</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Your availability helps us match you with students in compatible timezones. 
                    You'll be able to update your schedule after approval.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Document Uploads */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-900">
                    <strong>Important:</strong> All documents must be clear, valid, and in PDF or image format (JPG, PNG). 
                    Maximum file size: 5MB per document.
                  </p>
                </div>

                {/* WWCC Upload */}
                <div className="space-y-2">
                  <Label htmlFor="wwccFile">Working with Children Check (WWCC) *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <Input
                        id="wwccFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("wwccFile", e.target.files?.[0] || null)}
                        className="max-w-xs"
                      />
                      {formData.wwccFile && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {formData.wwccFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teaching Certificate Upload */}
                <div className="space-y-2">
                  <Label htmlFor="certFile">Teaching Certificate *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <Input
                        id="certFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("certFile", e.target.files?.[0] || null)}
                        className="max-w-xs"
                      />
                      {formData.certFile && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {formData.certFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ID Upload */}
                <div className="space-y-2">
                  <Label htmlFor="idFile">Government-Issued ID *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <Input
                        id="idFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("idFile", e.target.files?.[0] || null)}
                        className="max-w-xs"
                      />
                      {formData.idFile && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ {formData.idFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Application Summary</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium">{formData.highestEducation}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{formData.yearsExperience} years</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Specializations:</span>
                      <span className="font-medium">{formData.specializations.join(", ")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Available Days:</span>
                      <span className="font-medium">{formData.availableDays.join(", ")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-gray-600">Documents:</span>
                      <span className="font-medium text-green-600">✓ All uploaded</span>
                    </div>
                  </div>
                </div>

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

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>Next Steps:</strong> After submission, our team will review your application within 3-5 business days. 
                    You'll receive an email with further instructions if approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
