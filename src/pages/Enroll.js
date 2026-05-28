import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        suggestedEnrollmentDate: undefined,
        // Payment
        paymentType: 'upfront',
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
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50", children: [_jsx("div", { className: "bg-white border-b", children: _jsx("div", { className: "container mx-auto px-4 py-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "SCHROOL Enrollment" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Year 5/6 Combined Program - Standard Course" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Step ", step, " of 3"] }), _jsx("div", { className: "w-48 h-2 bg-gray-200 rounded-full mt-2", children: _jsx("div", { className: "h-full bg-blue-600 rounded-full transition-all", style: { width: `${(step / 3) * 100}%` } }) })] })] }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-12 max-w-4xl", children: [step === 1 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-6 h-6 text-blue-600" }), "Student Information"] }), _jsx(CardDescription, { children: "Tell us about the student who will be enrolling" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentName", children: "Student Full Name *" }), _jsx(Input, { id: "studentName", placeholder: "John Smith", value: formData.studentName, onChange: (e) => updateField('studentName', e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentAge", children: "Student Age *" }), _jsx(Input, { id: "studentAge", type: "number", placeholder: "10", value: formData.studentAge, onChange: (e) => updateField('studentAge', e.target.value) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentGrade", children: "Current Grade/Year *" }), _jsx(Input, { id: "studentGrade", value: formData.studentGrade, onChange: (e) => updateField('studentGrade', e.target.value), placeholder: "Year 5" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "diagnosticTestScore", children: "Diagnostic Test Score (Optional)" }), _jsx(Input, { id: "diagnosticTestScore", type: "number", placeholder: "85", value: formData.diagnosticTestScore, onChange: (e) => updateField('diagnosticTestScore', e.target.value) }), _jsx("p", { className: "text-sm text-gray-500", children: "If your child completed our diagnostic test, enter their score here" })] }), _jsx(Button, { onClick: () => setStep(2), disabled: !formData.studentName || !formData.studentAge || !formData.studentGrade, className: "w-full", children: "Continue to Parent Information" })] })] })), step === 2 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Parent & Contact Information" }), _jsx(CardDescription, { children: "We'll use this information to contact you about your child's progress" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentName", children: "Parent/Guardian Name *" }), _jsx(Input, { id: "parentName", placeholder: "Jane Smith", value: formData.parentName, onChange: (e) => updateField('parentName', e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentEmail", children: "Email Address *" }), _jsx(Input, { id: "parentEmail", type: "email", placeholder: "jane@example.com", value: formData.parentEmail, onChange: (e) => updateField('parentEmail', e.target.value) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentPhone", children: "Phone Number *" }), _jsx(Input, { id: "parentPhone", type: "tel", placeholder: "+61 400 000 000", value: formData.parentPhone, onChange: (e) => updateField('parentPhone', e.target.value) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Label, { children: "Address" }), _jsx(Input, { placeholder: "Street Address", value: formData.addressStreet, onChange: (e) => updateField('addressStreet', e.target.value) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Input, { placeholder: "City", value: formData.addressCity, onChange: (e) => updateField('addressCity', e.target.value) }), _jsx(Input, { placeholder: "State", value: formData.addressState, onChange: (e) => updateField('addressState', e.target.value) }), _jsx(Input, { placeholder: "Postcode", value: formData.addressPostcode, onChange: (e) => updateField('addressPostcode', e.target.value) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Suggested Enrollment Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn('w-full justify-start text-left font-normal', !formData.suggestedEnrollmentDate && 'text-muted-foreground'), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), formData.suggestedEnrollmentDate ? (format(formData.suggestedEnrollmentDate, 'PPP')) : (_jsx("span", { children: "Pick a date (within 2-3 days recommended)" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: formData.suggestedEnrollmentDate, onSelect: (date) => updateField('suggestedEnrollmentDate', date), initialFocus: true }) })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(1), className: "flex-1", children: "Back" }), _jsx(Button, { onClick: () => setStep(3), disabled: !formData.parentName || !formData.parentEmail || !formData.parentPhone, className: "flex-1", children: "Continue to Payment" })] })] })] })), step === 3 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-6 h-6 text-green-600" }), "Payment Options"] }), _jsx(CardDescription, { children: "Choose your preferred payment method" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs(RadioGroup, { value: formData.paymentType, onValueChange: (value) => updateField('paymentType', value), children: [_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer", children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront" }), _jsxs(Label, { htmlFor: "upfront", className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "font-semibold text-lg", children: "Full Payment - $997" }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: "Pay in full today and save $121" }), _jsx("div", { className: "text-xs text-green-600 mt-2 font-medium", children: "\u2713 Best Value - Recommended" })] })] }), _jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer", children: [_jsx(RadioGroupItem, { value: "payment_plan", id: "payment_plan" }), _jsxs(Label, { htmlFor: "payment_plan", className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "font-semibold text-lg", children: "Payment Plan - $1,118" }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: "30% deposit ($335.40) + 5 monthly payments of $156.52" }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: "Total: $1,118 (includes $121 payment plan fee)" })] })] })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Standard Course Includes:" }), _jsxs("ul", { className: "space-y-2 text-sm text-blue-800", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "24 comprehensive lessons (Year 5/6 Combined)"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Self-paced learning (complete within 12 months)"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Phone tutor support: Wednesdays 6-7 PM (3 months)"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Access to all course materials and resources"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Progress tracking and reporting"] })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "terms", checked: formData.termsAccepted, onCheckedChange: (checked) => updateField('termsAccepted', checked) }), _jsxs(Label, { htmlFor: "terms", className: "text-sm leading-relaxed cursor-pointer", children: ["I accept the", ' ', _jsx("a", { href: "/terms", target: "_blank", className: "text-blue-600 hover:underline", children: "Terms & Conditions" }), ' ', "and understand that payment is required to complete enrollment"] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Button, { variant: "outline", onClick: () => setStep(2), className: "flex-1", children: "Back" }), _jsx(Button, { onClick: handleSubmit, disabled: !formData.termsAccepted || createCheckout.isPending, className: "flex-1 bg-green-600 hover:bg-green-700", children: createCheckout.isPending ? 'Processing...' : 'Proceed to Payment' })] })] })] }))] })] }));
}
