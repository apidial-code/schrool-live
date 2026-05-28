import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle2, Clock, Users, Video, Eye, EyeOff } from "lucide-react";
export default function Year56EliteEnrollmentPage() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
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
        // Course Selection (PRE-SELECTED)
        courseLevel: "Y5-6",
        // Tutor Session Days (2 selections required)
        sessionDay1: "",
        sessionDay2: "",
        // Payment Option
        paymentOption: "",
        // Terms Acceptance
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
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleDaySelection = (day, position) => {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        try {
            // TODO: Call enrollment API with formData
            toast.success("Proceeding to secure payment...");
            // Redirect to payment processing
            setTimeout(() => {
                setLocation("/enrollment/success");
            }, 1500);
        }
        catch (error) {
            toast.error("Enrollment failed. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4", children: "Elite Program" }), _jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Premium Math Course" }), _jsx("p", { className: "text-lg text-gray-600", children: "Year 5/6 Mathematics Excellence" }), _jsx("p", { className: "text-gray-500 mt-2", children: "This exclusive course includes 24+ weeks of personalised instruction and dedicated teacher support" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-12", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Clock, { className: "w-8 h-8 text-blue-600 mb-2" }), _jsx("p", { className: "font-semibold", children: "24+ Weeks Duration" }), _jsx("p", { className: "text-sm text-gray-600", children: "Twice 1-hour weekly sessions" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600 mb-2" }), _jsx("p", { className: "font-semibold", children: "Dedicated Teacher" }), _jsx("p", { className: "text-sm text-gray-600", children: "Personalised instruction and support" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Video, { className: "w-8 h-8 text-blue-600 mb-2" }), _jsx("p", { className: "font-semibold", children: "Live Zoom Sessions" }), _jsx("p", { className: "text-sm text-gray-600", children: "Interactive online learning" })] }) })] }), _jsxs(Card, { className: "mb-8", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "What's Included" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                                    "Personalised Instruction - One-on-one attention from certified teachers",
                                    "Dedicated Teacher Support - Consistent teacher throughout the course",
                                    "Access to Monitored Resources - Curated learning materials and practice exercises",
                                    "Parent's Internal Message Access - Direct communication with teacher and progress updates",
                                    "Progress Tracking - Detailed analytics and performance reports",
                                    "Certificate of Completion - Official recognition upon course completion"
                                ].map((feature, idx) => (_jsxs("div", { className: "flex gap-3", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-gray-700", children: feature })] }, idx))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Elite Program Enrollment - Year 5/6" }), _jsx(CardDescription, { children: "Complete the form below to begin your enrollment" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx("span", { className: "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm", children: "1" }), "Student Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "studentFirstName", children: "First Name *" }), _jsx(Input, { id: "studentFirstName", type: "text", placeholder: "John", value: formData.studentFirstName, onChange: (e) => handleInputChange("studentFirstName", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "studentLastName", children: "Last Name *" }), _jsx(Input, { id: "studentLastName", type: "text", placeholder: "Smith", value: formData.studentLastName, onChange: (e) => handleInputChange("studentLastName", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "studentEmail", children: "Email *" }), _jsx(Input, { id: "studentEmail", type: "email", placeholder: "john@example.com", value: formData.studentEmail, onChange: (e) => handleInputChange("studentEmail", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "studentPhone", children: "Phone" }), _jsx(Input, { id: "studentPhone", type: "tel", placeholder: "+61 412 345 678", value: formData.studentPhone, onChange: (e) => handleInputChange("studentPhone", e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "studentAge", children: "Age *" }), _jsx(Input, { id: "studentAge", type: "number", placeholder: "11", value: formData.studentAge, onChange: (e) => handleInputChange("studentAge", e.target.value), required: true })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx("span", { className: "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm", children: "2" }), "Parent/Guardian Information"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "parentFirstName", children: "First Name *" }), _jsx(Input, { id: "parentFirstName", type: "text", placeholder: "Jane", value: formData.parentFirstName, onChange: (e) => handleInputChange("parentFirstName", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentLastName", children: "Last Name *" }), _jsx(Input, { id: "parentLastName", type: "text", placeholder: "Smith", value: formData.parentLastName, onChange: (e) => handleInputChange("parentLastName", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentEmail", children: "Email *" }), _jsx(Input, { id: "parentEmail", type: "email", placeholder: "jane@example.com", value: formData.parentEmail, onChange: (e) => handleInputChange("parentEmail", e.target.value), required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentPhone", children: "Phone *" }), _jsx(Input, { id: "parentPhone", type: "tel", placeholder: "+61 412 345 679", value: formData.parentPhone, onChange: (e) => handleInputChange("parentPhone", e.target.value), required: true })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx("span", { className: "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm", children: "3" }), "Select Two Days for Weekly Sessions *"] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Choose two different days for your 1-hour sessions each week" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium mb-3 block", children: "First Session Day" }), _jsx(RadioGroup, { value: formData.sessionDay1, onValueChange: (val) => handleDaySelection(val, 1), children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: sessionDays.map(day => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: day.value, id: `day1-${day.value}` }), _jsx(Label, { htmlFor: `day1-${day.value}`, className: "cursor-pointer", children: day.label })] }, day.value))) }) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium mb-3 block", children: "Second Session Day" }), _jsx(RadioGroup, { value: formData.sessionDay2, onValueChange: (val) => handleDaySelection(val, 2), children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: sessionDays.map(day => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: day.value, id: `day2-${day.value}` }), _jsx(Label, { htmlFor: `day2-${day.value}`, className: "cursor-pointer", children: day.label })] }, day.value))) }) })] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [_jsx("span", { className: "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm", children: "4" }), "Payment Options"] }), _jsx(RadioGroup, { value: formData.paymentOption, onValueChange: (val) => handleInputChange("paymentOption", val), children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "border rounded-lg p-4 cursor-pointer hover:bg-blue-50", onClick: () => handleInputChange("paymentOption", "upfront"), children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "upfront", className: "cursor-pointer font-semibold text-lg", children: "$5,897 - Pay in Full" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "One-time payment - complete access to the course" })] })] }) }), _jsx("div", { className: "border rounded-lg p-4 cursor-pointer hover:bg-blue-50", onClick: () => handleInputChange("paymentOption", "plan"), children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "plan", id: "plan" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "plan", className: "cursor-pointer font-semibold text-lg", children: "$6,307 - Payment Plan" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["\u2022 30% Deposit: $1,892.10 (due today)", _jsx("br", {}), "\u2022 3 Monthly Payments: $1,471.63 each", _jsx("br", {}), "No interest charged - flexible payment schedule"] })] })] }) })] }) })] }), _jsxs("div", { className: "border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx("span", { className: "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm", children: "5" }), "Payment Details"] }), _jsx("button", { type: "button", onClick: () => setShowPaymentDetails(!showPaymentDetails), className: "flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900", children: showPaymentDetails ? (_jsxs(_Fragment, { children: [_jsx(EyeOff, { className: "w-4 h-4" }), "Hide"] })) : (_jsxs(_Fragment, { children: [_jsx(Eye, { className: "w-4 h-4" }), "Show"] })) })] }), showPaymentDetails ? (_jsxs("div", { className: "space-y-4 bg-white p-4 rounded border border-yellow-200", children: [_jsx("p", { className: "text-sm text-gray-600 font-semibold", children: "\uD83D\uDD12 Secure payment powered by Stripe" }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cardName", children: "Cardholder Name *" }), _jsx(Input, { id: "cardName", type: "text", placeholder: "John Smith", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cardNumber", children: "Card Number *" }), _jsx(Input, { id: "cardNumber", type: "text", placeholder: "4242 4242 4242 4242", maxLength: 19, required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "cardExpiry", children: "Expiry Date *" }), _jsx(Input, { id: "cardExpiry", type: "text", placeholder: "MM/YY", maxLength: 5, required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "cardCVC", children: "CVC *" }), _jsx(Input, { id: "cardCVC", type: "text", placeholder: "123", maxLength: 4, required: true })] })] })] })) : (_jsxs("div", { className: "bg-white p-4 rounded border border-yellow-200 text-center text-gray-500", children: [_jsx("p", { children: "Payment details hidden for privacy" }), _jsx("p", { className: "text-sm mt-1", children: "Click \"Show\" to enter payment information" })] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "acceptTerms", checked: formData.acceptTerms, onCheckedChange: (checked) => handleInputChange("acceptTerms", checked) }), _jsxs(Label, { htmlFor: "acceptTerms", className: "cursor-pointer text-sm", children: ["I accept the ", _jsx("a", { href: "/terms", className: "text-blue-600 hover:underline", children: "Terms of Service" })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "acceptPrivacy", checked: formData.acceptPrivacy, onCheckedChange: (checked) => handleInputChange("acceptPrivacy", checked) }), _jsxs(Label, { htmlFor: "acceptPrivacy", className: "cursor-pointer text-sm", children: ["I accept the ", _jsx("a", { href: "/privacy", className: "text-blue-600 hover:underline", children: "Privacy Policy" })] })] })] }), _jsx(Button, { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold", children: loading ? "Processing..." : "Proceed to Secure Payment" }), _jsx("p", { className: "text-center text-xs text-gray-500", children: "\uD83D\uDD12 Secure payment powered by Stripe" })] }) })] })] }) }));
}
