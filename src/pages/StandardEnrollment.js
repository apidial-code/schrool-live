import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { CheckCircle2, Clock, Video, Phone, FileText } from "lucide-react";
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
    const handleInputChange = (field, value) => {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        try {
            // Map course level to year level format
            const yearLevelMap = {
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
            window.location.href = result.checkoutUrl || result.url;
        }
        catch (error) {
            console.error('Enrollment error:', error);
            toast.error("Enrollment failed. Please try again or contact support");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12", children: _jsx("div", { className: "container max-w-4xl", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "inline-block px-4 py-1 bg-blue-500 rounded-full text-sm font-semibold mb-2", children: "Standard Program" }), _jsx("h1", { className: "text-4xl font-bold", children: "Self-Paced Math Course" }), _jsx("p", { className: "text-xl text-blue-100", children: "Learn at your own pace with 12 months access to comprehensive video lessons and practice exercises" })] }) }) }), _jsxs("div", { className: "container max-w-6xl py-12", children: [_jsxs("div", { className: "grid md:grid-cols-3 gap-6 mb-12", children: [_jsx(Card, { className: "border-blue-200", children: _jsxs(CardHeader, { children: [_jsx(Clock, { className: "h-8 w-8 text-blue-600 mb-2" }), _jsx(CardTitle, { className: "text-lg", children: "12 Months Access" }), _jsx(CardDescription, { children: "Self-paced - complete at your own speed" })] }) }), _jsx(Card, { className: "border-blue-200", children: _jsxs(CardHeader, { children: [_jsx(Video, { className: "h-8 w-8 text-blue-600 mb-2" }), _jsx(CardTitle, { className: "text-lg", children: "Video Lessons" }), _jsx(CardDescription, { children: "Pre-recorded comprehensive lessons" })] }) }), _jsx(Card, { className: "border-blue-200", children: _jsxs(CardHeader, { children: [_jsx(Phone, { className: "h-8 w-8 text-blue-600 mb-2" }), _jsx(CardTitle, { className: "text-lg", children: "Phone Tutor Support" }), _jsx(CardDescription, { children: "3 months assistance included" })] }) })] }), _jsxs(Card, { className: "mb-12 border-blue-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-2xl text-blue-900", children: "What's Included" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Self-Paced Video Lessons" }), _jsx("div", { className: "text-sm text-gray-600", children: "Comprehensive pre-recorded lessons available 24/7" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Practice Exercises" }), _jsx("div", { className: "text-sm text-gray-600", children: "Extensive exercise library with instant feedback" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Progress Tracking" }), _jsx("div", { className: "text-sm text-gray-600", children: "Automated tracking and detailed analytics" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "3 Months Phone Tutor Assistance" }), _jsx("div", { className: "text-sm text-gray-600", children: "30 mins/week on Wednesdays 18:00-19:00 (1800 SCHROOL)" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Excluding public holidays" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Access to Course Materials" }), _jsx("div", { className: "text-sm text-gray-600", children: "Downloadable worksheets and resources" })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-gray-900", children: "Certificate of Completion" }), _jsx("div", { className: "text-sm text-gray-600", children: "Official recognition upon course completion" })] })] })] }) })] }), _jsxs(Card, { className: "border-blue-200", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl text-blue-900", children: "Standard Program Enrollment" }), _jsx(CardDescription, { children: "Complete the form below to begin your enrollment" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2", children: "Student Information" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentFirstName", children: "First Name *" }), _jsx(Input, { id: "studentFirstName", value: formData.studentFirstName, onChange: (e) => handleInputChange("studentFirstName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentLastName", children: "Last Name *" }), _jsx(Input, { id: "studentLastName", value: formData.studentLastName, onChange: (e) => handleInputChange("studentLastName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentEmail", children: "Email *" }), _jsx(Input, { id: "studentEmail", type: "email", value: formData.studentEmail, onChange: (e) => handleInputChange("studentEmail", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentPhone", children: "Phone" }), _jsx(Input, { id: "studentPhone", type: "tel", value: formData.studentPhone, onChange: (e) => handleInputChange("studentPhone", e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentAge", children: "Age" }), _jsx(Input, { id: "studentAge", type: "number", value: formData.studentAge, onChange: (e) => handleInputChange("studentAge", e.target.value) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2", children: "Parent/Guardian Information" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentFirstName", children: "First Name *" }), _jsx(Input, { id: "parentFirstName", value: formData.parentFirstName, onChange: (e) => handleInputChange("parentFirstName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentLastName", children: "Last Name *" }), _jsx(Input, { id: "parentLastName", value: formData.parentLastName, onChange: (e) => handleInputChange("parentLastName", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentEmail", children: "Email *" }), _jsx(Input, { id: "parentEmail", type: "email", value: formData.parentEmail, onChange: (e) => handleInputChange("parentEmail", e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentPhone", children: "Phone *" }), _jsx(Input, { id: "parentPhone", type: "tel", value: formData.parentPhone, onChange: (e) => handleInputChange("parentPhone", e.target.value), required: true })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2", children: "Course Selection" }), _jsx(RadioGroup, { value: formData.courseLevel, onValueChange: (value) => handleInputChange("courseLevel", value), children: _jsx("div", { className: "space-y-3", children: courseLevels.map((course) => (_jsxs("div", { className: "flex items-start space-x-3 border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors", children: [_jsx(RadioGroupItem, { value: course.value, id: course.value, className: "mt-1" }), _jsxs(Label, { htmlFor: course.value, className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "font-semibold text-gray-900", children: course.label }), _jsx("div", { className: "text-sm text-gray-600", children: course.description })] })] }, course.value))) }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2", children: "Payment Options" }), _jsx(RadioGroup, { value: formData.paymentOption, onValueChange: (value) => handleInputChange("paymentOption", value), children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "border-2 border-green-500 rounded-lg p-6 bg-green-50 relative", children: [_jsx("div", { className: "absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold", children: "SAVE $191" }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront", className: "mt-1" }), _jsxs(Label, { htmlFor: "upfront", className: "flex-1 cursor-pointer", children: [_jsxs("div", { className: "flex items-baseline gap-2 mb-2", children: [_jsx("span", { className: "text-3xl font-bold text-gray-900", children: "$997" }), _jsx("span", { className: "text-lg text-gray-500 line-through", children: "$1,188" })] }), _jsx("div", { className: "font-semibold text-gray-900 mb-1", children: "Pay in Full (Best Value)" }), _jsx("div", { className: "text-sm text-gray-600", children: "One-time payment - Save $191 compared to payment plan" })] })] })] }), _jsx("div", { className: "border border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "plan", id: "plan", className: "mt-1" }), _jsxs(Label, { htmlFor: "plan", className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "flex items-baseline gap-2 mb-2", children: _jsx("span", { className: "text-3xl font-bold text-gray-900", children: "$1,188" }) }), _jsx("div", { className: "font-semibold text-gray-900 mb-1", children: "Payment Plan" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["\u2022 30% Deposit: ", _jsx("span", { className: "font-semibold", children: "$356.40" }), " (due today)"] }), _jsxs("div", { children: ["\u2022 5 Monthly Payments: ", _jsx("span", { className: "font-semibold", children: "$166.32" }), " each"] }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: "No interest charged - flexible payment schedule" })] })] })] }) })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-blue-200 pb-2", children: "Terms & Conditions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Checkbox, { id: "acceptTerms", checked: formData.acceptTerms, onCheckedChange: (checked) => handleInputChange("acceptTerms", checked) }), _jsxs(Label, { htmlFor: "acceptTerms", className: "text-sm cursor-pointer leading-relaxed", children: ["I accept the", " ", _jsx("a", { href: "/terms", target: "_blank", className: "text-blue-600 hover:underline font-semibold", children: "Terms of Service" })] })] }), _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Checkbox, { id: "acceptPrivacy", checked: formData.acceptPrivacy, onCheckedChange: (checked) => handleInputChange("acceptPrivacy", checked) }), _jsxs(Label, { htmlFor: "acceptPrivacy", className: "text-sm cursor-pointer leading-relaxed", children: ["I accept the", " ", _jsx("a", { href: "/privacy", target: "_blank", className: "text-blue-600 hover:underline font-semibold", children: "Privacy Policy" })] })] })] })] }), _jsxs("div", { className: "pt-6 border-t border-gray-200", children: [_jsx(Button, { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold", children: loading ? "Processing..." : "Proceed to Secure Payment" }), _jsxs("p", { className: "text-center text-sm text-gray-500 mt-4", children: [_jsx(FileText, { className: "inline h-4 w-4 mr-1" }), "Secure payment powered by Stripe"] })] })] }) })] })] })] }));
}
