import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, User, GraduationCap, Calendar, FileText, Upload, ChevronRight, ChevronLeft } from "lucide-react";
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
        specializations: [],
        teachingPhilosophy: "",
        // Step 3: Availability
        availableDays: [],
        preferredHours: "",
        maxStudents: "",
        // Step 4: Document Uploads
        wwccFile: null,
        certFile: null,
        idFile: null,
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
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleSpecializationToggle = (spec) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }));
    };
    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };
    const handleFileChange = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };
    const validateStep = (step) => {
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
        if (!validateStep(currentStep))
            return;
        setLoading(true);
        try {
            // TODO: Implement file upload to S3 and teacher application submission
            toast.success("Application submitted successfully! We'll review and contact you soon.");
            console.log("Teacher Application Data:", formData);
            // Navigate to confirmation page
            setTimeout(() => {
                setLocation("/");
            }, 2000);
        }
        catch (error) {
            toast.error("Application submission failed. Please try again or contact support");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12", children: _jsx("div", { className: "container max-w-4xl", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h1", { className: "text-4xl font-bold", children: "Become a SCHROOL Teacher" }), _jsx("p", { className: "text-xl text-blue-100", children: "Join our team of passionate educators and make a difference" })] }) }) }), _jsxs("div", { className: "container max-w-4xl py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex justify-between items-center mb-4", children: steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.number;
                                    const isCompleted = currentStep > step.number;
                                    return (_jsxs("div", { className: "flex flex-col items-center flex-1", children: [_jsx("div", { className: `
                    w-12 h-12 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' :
                                                    isActive ? 'bg-blue-600 text-white' :
                                                        'bg-gray-200 text-gray-500'}
                  `, children: isCompleted ? _jsx(CheckCircle2, { className: "h-6 w-6" }) : _jsx(Icon, { className: "h-6 w-6" }) }), _jsx("span", { className: `text-sm mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`, children: step.title }), index < steps.length - 1 && (_jsx("div", { className: "hidden md:block absolute h-1 bg-gray-200", style: { width: '100px', marginTop: '24px', marginLeft: '100px' } }))] }, step.number));
                                }) }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-500", style: { width: `${progressPercentage}%` } }) })] }), _jsxs(Card, { className: "border-blue-200", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-2xl text-blue-900", children: ["Step ", currentStep, ": ", steps[currentStep - 1].title] }), _jsxs(CardDescription, { children: [currentStep === 1 && "Tell us about yourself", currentStep === 2 && "Share your qualifications and experience", currentStep === 3 && "Let us know when you're available", currentStep === 4 && "Upload required documents", currentStep === 5 && "Review and submit your application"] })] }), _jsxs(CardContent, { children: [currentStep === 1 && (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name *" }), _jsx(Input, { id: "firstName", value: formData.firstName, onChange: (e) => handleInputChange("firstName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name *" }), _jsx(Input, { id: "lastName", value: formData.lastName, onChange: (e) => handleInputChange("lastName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleInputChange("email", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone *" }), _jsx(Input, { id: "phone", type: "tel", value: formData.phone, onChange: (e) => handleInputChange("phone", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "timezone", children: "Timezone *" }), _jsxs("select", { id: "timezone", value: formData.timezone, onChange: (e) => handleInputChange("timezone", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "Australia/Sydney", children: "Australia/Sydney (AEDT)" }), _jsx("option", { value: "Australia/Melbourne", children: "Australia/Melbourne (AEDT)" }), _jsx("option", { value: "Australia/Brisbane", children: "Australia/Brisbane (AEST)" }), _jsx("option", { value: "Australia/Perth", children: "Australia/Perth (AWST)" }), _jsx("option", { value: "Australia/Adelaide", children: "Australia/Adelaide (ACDT)" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "linkedIn", children: "LinkedIn Profile (Optional)" }), _jsx(Input, { id: "linkedIn", type: "url", placeholder: "https://linkedin.com/in/yourprofile", value: formData.linkedIn, onChange: (e) => handleInputChange("linkedIn", e.target.value) })] })] }) })), currentStep === 2 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "highestEducation", children: "Highest Education Level *" }), _jsxs("select", { id: "highestEducation", value: formData.highestEducation, onChange: (e) => handleInputChange("highestEducation", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select education level" }), _jsx("option", { value: "Bachelor's Degree", children: "Bachelor's Degree" }), _jsx("option", { value: "Master's Degree", children: "Master's Degree" }), _jsx("option", { value: "PhD", children: "PhD" }), _jsx("option", { value: "Teaching Diploma", children: "Teaching Diploma" }), _jsx("option", { value: "Other", children: "Other" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "teachingCertifications", children: "Teaching Certifications" }), _jsx(Input, { id: "teachingCertifications", placeholder: "e.g., NSW Teaching Certificate, VIT Registration", value: formData.teachingCertifications, onChange: (e) => handleInputChange("teachingCertifications", e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "yearsExperience", children: "Years of Teaching Experience *" }), _jsxs("select", { id: "yearsExperience", value: formData.yearsExperience, onChange: (e) => handleInputChange("yearsExperience", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select experience" }), _jsx("option", { value: "0-2", children: "0-2 years" }), _jsx("option", { value: "3-5", children: "3-5 years" }), _jsx("option", { value: "6-10", children: "6-10 years" }), _jsx("option", { value: "10+", children: "10+ years" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Subject Specializations * (Select all that apply)" }), _jsx("div", { className: "grid md:grid-cols-2 gap-3", children: specializationOptions.map((spec) => (_jsxs("div", { className: "flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors", children: [_jsx(Checkbox, { id: spec, checked: formData.specializations.includes(spec), onCheckedChange: () => handleSpecializationToggle(spec) }), _jsx(Label, { htmlFor: spec, className: "cursor-pointer flex-1", children: spec })] }, spec))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "teachingPhilosophy", children: "Teaching Philosophy (Optional)" }), _jsx("textarea", { id: "teachingPhilosophy", rows: 4, placeholder: "Share your approach to teaching mathematics...", value: formData.teachingPhilosophy, onChange: (e) => handleInputChange("teachingPhilosophy", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })), currentStep === 3 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Available Days * (Select all that apply)" }), _jsx("div", { className: "grid md:grid-cols-4 gap-3", children: dayOptions.map((day) => (_jsxs("div", { className: "flex items-center space-x-2 border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-colors", children: [_jsx(Checkbox, { id: day, checked: formData.availableDays.includes(day), onCheckedChange: () => handleDayToggle(day) }), _jsx(Label, { htmlFor: day, className: "cursor-pointer flex-1", children: day })] }, day))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "preferredHours", children: "Preferred Teaching Hours *" }), _jsxs("select", { id: "preferredHours", value: formData.preferredHours, onChange: (e) => handleInputChange("preferredHours", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select preferred hours" }), _jsx("option", { value: "Morning (8am-12pm)", children: "Morning (8am-12pm)" }), _jsx("option", { value: "Afternoon (12pm-5pm)", children: "Afternoon (12pm-5pm)" }), _jsx("option", { value: "Evening (5pm-9pm)", children: "Evening (5pm-9pm)" }), _jsx("option", { value: "Flexible", children: "Flexible" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "maxStudents", children: "Maximum Students You Can Handle" }), _jsxs("select", { id: "maxStudents", value: formData.maxStudents, onChange: (e) => handleInputChange("maxStudents", e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "Select capacity" }), _jsx("option", { value: "1-5", children: "1-5 students" }), _jsx("option", { value: "6-10", children: "6-10 students" }), _jsx("option", { value: "11-15", children: "11-15 students" }), _jsx("option", { value: "16-20", children: "16-20 students" }), _jsx("option", { value: "20+", children: "20+ students" })] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-900", children: [_jsx("strong", { children: "Note:" }), " Your availability helps us match you with students in compatible timezones. You'll be able to update your schedule after approval."] }) })] })), currentStep === 4 && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6", children: _jsxs("p", { className: "text-sm text-yellow-900", children: [_jsx("strong", { children: "Important:" }), " All documents must be clear, valid, and in PDF or image format (JPG, PNG). Maximum file size: 5MB per document."] }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "wwccFile", children: "Working with Children Check (WWCC) *" }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(Upload, { className: "h-8 w-8 text-gray-400" }), _jsx(Input, { id: "wwccFile", type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => handleFileChange("wwccFile", e.target.files?.[0] || null), className: "max-w-xs" }), formData.wwccFile && (_jsxs("p", { className: "text-sm text-green-600 font-medium", children: ["\u2713 ", formData.wwccFile.name] }))] }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "certFile", children: "Teaching Certificate *" }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(Upload, { className: "h-8 w-8 text-gray-400" }), _jsx(Input, { id: "certFile", type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => handleFileChange("certFile", e.target.files?.[0] || null), className: "max-w-xs" }), formData.certFile && (_jsxs("p", { className: "text-sm text-green-600 font-medium", children: ["\u2713 ", formData.certFile.name] }))] }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "idFile", children: "Government-Issued ID *" }), _jsx("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(Upload, { className: "h-8 w-8 text-gray-400" }), _jsx(Input, { id: "idFile", type: "file", accept: ".pdf,.jpg,.jpeg,.png", onChange: (e) => handleFileChange("idFile", e.target.files?.[0] || null), className: "max-w-xs" }), formData.idFile && (_jsxs("p", { className: "text-sm text-green-600 font-medium", children: ["\u2713 ", formData.idFile.name] }))] }) })] })] })), currentStep === 5 && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-4", children: "Application Summary" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Name:" }), _jsxs("span", { className: "font-medium", children: [formData.firstName, " ", formData.lastName] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Email:" }), _jsx("span", { className: "font-medium", children: formData.email })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Phone:" }), _jsx("span", { className: "font-medium", children: formData.phone })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Education:" }), _jsx("span", { className: "font-medium", children: formData.highestEducation })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Experience:" }), _jsxs("span", { className: "font-medium", children: [formData.yearsExperience, " years"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Specializations:" }), _jsx("span", { className: "font-medium", children: formData.specializations.join(", ") })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Available Days:" }), _jsx("span", { className: "font-medium", children: formData.availableDays.join(", ") })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("span", { className: "text-gray-600", children: "Documents:" }), _jsx("span", { className: "font-medium text-green-600", children: "\u2713 All uploaded" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Checkbox, { id: "acceptTerms", checked: formData.acceptTerms, onCheckedChange: (checked) => handleInputChange("acceptTerms", checked) }), _jsxs(Label, { htmlFor: "acceptTerms", className: "text-sm cursor-pointer leading-relaxed", children: ["I accept the", " ", _jsx("a", { href: "/terms", target: "_blank", className: "text-blue-600 hover:underline font-semibold", children: "Terms of Service" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Checkbox, { id: "acceptPrivacy", checked: formData.acceptPrivacy, onCheckedChange: (checked) => handleInputChange("acceptPrivacy", checked) }), _jsxs(Label, { htmlFor: "acceptPrivacy", className: "text-sm cursor-pointer leading-relaxed", children: ["I accept the", " ", _jsx("a", { href: "/privacy", target: "_blank", className: "text-blue-600 hover:underline font-semibold", children: "Privacy Policy" })] })] })] }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-green-900", children: [_jsx("strong", { children: "Next Steps:" }), " After submission, our team will review your application within 3-5 business days. You'll receive an email with further instructions if approved."] }) })] })), _jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t border-gray-200", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: prevStep, disabled: currentStep === 1, className: "flex items-center gap-2", children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "Previous"] }), currentStep < totalSteps ? (_jsxs(Button, { type: "button", onClick: nextStep, className: "bg-blue-600 hover:bg-blue-700 flex items-center gap-2", children: ["Next", _jsx(ChevronRight, { className: "h-4 w-4" })] })) : (_jsxs(Button, { type: "button", onClick: handleSubmit, disabled: loading, className: "bg-green-600 hover:bg-green-700 flex items-center gap-2", children: [loading ? "Submitting..." : "Submit Application", _jsx(CheckCircle2, { className: "h-4 w-4" })] }))] })] })] })] })] }));
}
