import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Unified Enrollment Form for SCHROOL Platform
 *
 * Supports:
 * - All year levels (5/6, 7, 8, 9)
 * - Standard and Elite tiers
 * - Upfront and Payment Plan options
 * - Dynamic pricing display
 * - Stripe checkout integration
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, CreditCard, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { PRICING, getPaymentBreakdown, formatCurrency, } from '../../../shared/pricing';
export function EnrollmentForm() {
    // Form state
    const [yearLevel, setYearLevel] = useState('year5-6');
    const [tier, setTier] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('upfront');
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});
    // Get pricing details
    const pricing = PRICING[yearLevel][tier];
    const breakdown = getPaymentBreakdown(yearLevel, tier, paymentMethod);
    // Stripe checkout mutation
    const createCheckout = trpc.enrollmentNew.createCheckoutSession.useMutation({
        onSuccess: (data) => {
            // Redirect to Stripe checkout
            window.location.href = data.url;
        },
        onError: (error) => {
            setErrors({ submit: error.message });
        },
    });
    // Validation
    const validate = () => {
        const newErrors = {};
        if (!studentName.trim())
            newErrors.studentName = 'Student name is required';
        if (!studentEmail.trim())
            newErrors.studentEmail = 'Student email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
            newErrors.studentEmail = 'Invalid email format';
        }
        if (!parentName.trim())
            newErrors.parentName = 'Parent name is required';
        if (!parentEmail.trim())
            newErrors.parentEmail = 'Parent email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
            newErrors.parentEmail = 'Invalid email format';
        }
        if (!phone.trim())
            newErrors.phone = 'Phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate())
            return;
        createCheckout.mutate({
            yearLevel,
            tier,
            paymentMethod,
            studentName,
            studentEmail,
            studentAge: '',
            parentName,
            parentEmail,
            phone,
        });
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Enroll in SCHROOL" }), _jsx("p", { className: "text-lg text-gray-600", children: "Transform your child's mathematics journey with our proven 5QHackMath methodology" })] }), _jsxs(Card, { className: "shadow-xl", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Course Enrollment" }), _jsx(CardDescription, { children: "Select your course level, tier, and payment preference" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "yearLevel", children: "Year Level" }), _jsxs(Select, { value: yearLevel, onValueChange: (v) => setYearLevel(v), children: [_jsx(SelectTrigger, { id: "yearLevel", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "year5-6", children: "Year 5/6 (24 weeks)" }), _jsx(SelectItem, { value: "year7", children: "Year 7 (26 weeks)" }), _jsx(SelectItem, { value: "year8", children: "Year 8 (28 weeks)" }), _jsx(SelectItem, { value: "year9", children: "Year 9 (30 weeks)" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Course Tier" }), _jsx(RadioGroup, { value: tier, onValueChange: (v) => setTier(v), children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Card, { className: `cursor-pointer transition-all ${tier === 'standard'
                                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                                : 'hover:bg-gray-50'}`, onClick: () => setTier('standard'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "standard", id: "standard" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "standard", className: "text-lg font-semibold cursor-pointer", children: "Standard" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Self-paced video lessons with exercises" }), _jsx("p", { className: "text-2xl font-bold text-blue-600 mt-2", children: formatCurrency(PRICING[yearLevel].standard.upfront) })] })] }) }) }), _jsx(Card, { className: `cursor-pointer transition-all ${tier === 'elite'
                                                                ? 'ring-2 ring-purple-500 bg-purple-50'
                                                                : 'hover:bg-gray-50'}`, onClick: () => setTier('elite'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "elite", id: "elite" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "elite", className: "text-lg font-semibold cursor-pointer", children: "Premium Elite" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "1-on-1 Zoom tutoring + all Standard features" }), _jsx("p", { className: "text-2xl font-bold text-purple-600 mt-2", children: formatCurrency(PRICING[yearLevel].elite.upfront) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [PRICING[yearLevel].sessions, " Zoom sessions (2\u00D7/week)"] })] })] }) }) })] }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Payment Method" }), _jsx(RadioGroup, { value: paymentMethod, onValueChange: (v) => setPaymentMethod(v), children: _jsxs("div", { className: "space-y-3", children: [_jsx(Card, { className: `cursor-pointer transition-all ${paymentMethod === 'upfront'
                                                                ? 'ring-2 ring-green-500 bg-green-50'
                                                                : 'hover:bg-gray-50'}`, onClick: () => setPaymentMethod('upfront'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: "upfront", className: "text-base font-semibold cursor-pointer flex items-center gap-2", children: [_jsx(CreditCard, { className: "h-4 w-4" }), "Pay in Full"] }), _jsx("span", { className: "text-2xl font-bold text-green-600", children: formatCurrency(pricing.upfront) })] }), breakdown.savings && (_jsxs("p", { className: "text-sm text-green-600 font-medium mt-1", children: ["Save ", formatCurrency(breakdown.savings), "!"] }))] })] }) }) }), _jsx(Card, { className: `cursor-pointer transition-all ${paymentMethod === 'payment-plan'
                                                                ? 'ring-2 ring-orange-500 bg-orange-50'
                                                                : 'hover:bg-gray-50'}`, onClick: () => setPaymentMethod('payment-plan'), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(RadioGroupItem, { value: "payment-plan", id: "payment-plan" }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Label, { htmlFor: "payment-plan", className: "text-base font-semibold cursor-pointer flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4" }), "Payment Plan"] }), _jsx("span", { className: "text-2xl font-bold text-orange-600", children: formatCurrency(breakdown.total) })] }), _jsxs("div", { className: "mt-2 space-y-1 text-sm text-gray-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Deposit:" }), " ", formatCurrency(breakdown.deposit), " (50%)"] }), _jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Then:" }), " ", breakdown.numberOfPayments, "\u00D7 monthly payments of", ' ', formatCurrency(breakdown.monthlyPayment)] })] })] })] }) }) })] }) })] }), _jsxs("div", { className: "space-y-4 pt-4 border-t", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Student Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentName", children: "Student Name *" }), _jsx(Input, { id: "studentName", value: studentName, onChange: (e) => setStudentName(e.target.value), placeholder: "Enter student's full name" }), errors.studentName && (_jsx("p", { className: "text-sm text-red-600", children: errors.studentName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "studentEmail", children: "Student Email *" }), _jsx(Input, { id: "studentEmail", type: "email", value: studentEmail, onChange: (e) => setStudentEmail(e.target.value), placeholder: "student@example.com" }), errors.studentEmail && (_jsx("p", { className: "text-sm text-red-600", children: errors.studentEmail }))] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Parent/Guardian Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentName", children: "Parent Name *" }), _jsx(Input, { id: "parentName", value: parentName, onChange: (e) => setParentName(e.target.value), placeholder: "Enter parent's full name" }), errors.parentName && (_jsx("p", { className: "text-sm text-red-600", children: errors.parentName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "parentEmail", children: "Parent Email *" }), _jsx(Input, { id: "parentEmail", type: "email", value: parentEmail, onChange: (e) => setParentEmail(e.target.value), placeholder: "parent@example.com" }), errors.parentEmail && (_jsx("p", { className: "text-sm text-red-600", children: errors.parentEmail }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "Phone Number *" }), _jsx(Input, { id: "phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+61 4XX XXX XXX" }), errors.phone && _jsx("p", { className: "text-sm text-red-600", children: errors.phone })] })] }), errors.submit && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: errors.submit }) })), _jsx(Button, { type: "submit", size: "lg", className: "w-full", disabled: createCheckout.isPending, children: createCheckout.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Processing..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }), "Proceed to Payment - ", formatCurrency(paymentMethod === 'upfront' ? breakdown.total : breakdown.deposit)] })) }), _jsx("p", { className: "text-xs text-center text-gray-500", children: "Secure payment powered by Stripe. Your payment information is encrypted and never stored on our servers." })] }) })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsxs("p", { className: "text-gray-600", children: ["Questions? Call our Phone Tutor:", ' ', _jsx("a", { href: "tel:+61499989179", className: "font-semibold text-blue-600 hover:underline", children: "+61 499 989 179" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "(Will be replaced with 1800 number at launch)" })] })] }) }));
}
