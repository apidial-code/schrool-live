import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
export function Year9EliteEnrollmentForm({ onSuccess, }) {
    const { toast } = useToast();
    const [paymentType, setPaymentType] = useState('upfront');
    const [formData, setFormData] = useState({
        studentName: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        agreeToTerms: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.currentTarget;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    const handleSubmit = async (e) => {
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
            const result = await createCheckoutMutation.mutateAsync({
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
        }
        catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create enrollment. Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "w-full max-w-2xl mx-auto p-6", children: _jsxs(Card, { className: "p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-2 text-[#4169E1]", children: "Year 9 Mathematics Excellence - Elite" }), _jsx("p", { className: "text-gray-600", children: "Premium tier with dedicated elite teacher and twice-weekly Zoom sessions" }), _jsx("div", { className: "mt-2 inline-block bg-[#4169E1] text-white px-3 py-1 rounded-full text-sm font-semibold", children: "Course Duration: 6 months (24 weeks)" })] }), _jsxs("div", { className: "mb-8 p-4 bg-[#EEF2FF] rounded-lg border border-[#4169E1]", children: [_jsx("h3", { className: "font-semibold mb-3 text-[#4169E1]", children: "What's Included:" }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Year 9 curriculum" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Dedicated elite teacher assignment" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Intense course duration: 24 weeks" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "48 one-to-one hourly Zoom sessions" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "2x weekly Zoom sessions (live tutoring)" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Personalized learning plan" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Parents' own dashboard for monitoring" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Parents' access to teacher via internal messages" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Parents' passive attendance encouraged" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Parents' limited participation if required" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Monthly assessments" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Achievement badges and trophies" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Scholarship for excellence" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Certificate of achievement" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Priority email support (24-hour response)" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Monthly progress reports" })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2 text-[#22C55E]", children: "\u2713" }), _jsx("span", { children: "Access to exclusive learning resources" })] })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Payment Options:" }), _jsx(RadioGroup, { value: paymentType, onValueChange: (value) => setPaymentType(value), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: `flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${paymentType === 'upfront' ? 'bg-[#EEF2FF] border-[#4169E1]' : 'border-gray-200'}`, children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront", className: "mt-1" }), _jsxs(Label, { htmlFor: "upfront", className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "font-semibold", children: "Full Payment" }), _jsx("div", { className: "text-sm text-gray-600", children: "Pay the full amount upfront" }), _jsx("div", { className: "text-lg font-bold text-[#4169E1] mt-1", children: "$7,897.00" })] })] }), _jsxs("div", { className: `flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer ${paymentType === 'payment_plan' ? 'bg-[#EEF2FF] border-[#4169E1]' : 'border-gray-200'}`, children: [_jsx(RadioGroupItem, { value: "payment_plan", id: "payment_plan", className: "mt-1" }), _jsxs(Label, { htmlFor: "payment_plan", className: "flex-1 cursor-pointer", children: [_jsx("div", { className: "font-semibold", children: "Payment Plan" }), _jsx("div", { className: "text-sm text-gray-600", children: "30% deposit now, then 3 equal monthly payments" }), _jsxs("div", { className: "text-sm text-gray-700 mt-1", children: [_jsx("div", { children: "Deposit: $2,504.10" }), _jsx("div", { children: "Monthly: $1,947.63 \u00D7 3 months" })] }), _jsx("div", { className: "text-lg font-bold text-[#4169E1] mt-1", children: "Total: $8,347.00" })] })] })] }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "studentName", className: "font-semibold", children: "Student Name *" }), _jsx(Input, { id: "studentName", name: "studentName", value: formData.studentName, onChange: handleInputChange, placeholder: "Enter student's full name", required: true, className: "mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentName", className: "font-semibold", children: "Parent/Guardian Name *" }), _jsx(Input, { id: "parentName", name: "parentName", value: formData.parentName, onChange: handleInputChange, placeholder: "Enter parent/guardian's full name", required: true, className: "mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentEmail", className: "font-semibold", children: "Parent/Guardian Email *" }), _jsx(Input, { id: "parentEmail", name: "parentEmail", type: "email", value: formData.parentEmail, onChange: handleInputChange, placeholder: "Enter email address", required: true, className: "mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "parentPhone", className: "font-semibold", children: "Parent/Guardian Phone *" }), _jsx(Input, { id: "parentPhone", name: "parentPhone", type: "tel", value: formData.parentPhone, onChange: handleInputChange, placeholder: "Enter phone number", required: true, className: "mt-1 focus:ring-[#4169E1] focus:border-[#4169E1]" })] }), _jsxs("div", { className: "flex items-start space-x-2 p-4 bg-gray-50 rounded-lg", children: [_jsx(Checkbox, { id: "agreeToTerms", name: "agreeToTerms", checked: formData.agreeToTerms, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked })), className: "mt-1" }), _jsxs(Label, { htmlFor: "agreeToTerms", className: "text-sm cursor-pointer", children: ["I agree to the", ' ', _jsx("a", { href: "/terms", className: "text-[#4169E1] hover:underline", target: "_blank", children: "Terms and Conditions" }), ' ', "and", ' ', _jsx("a", { href: "/privacy", className: "text-[#4169E1] hover:underline", target: "_blank", children: "Privacy Policy" })] })] }), _jsx(Button, { type: "submit", disabled: isLoading, className: "w-full bg-[#4169E1] hover:bg-[#3358C4] text-white font-semibold py-3 rounded-lg", children: isLoading ? 'Processing...' : 'Proceed to Payment' }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: "Your payment information is secure and encrypted" })] })] }) }));
}
