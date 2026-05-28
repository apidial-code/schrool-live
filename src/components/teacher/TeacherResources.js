import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Download, FileText } from "lucide-react";
export default function TeacherResources() {
    const resources = [
        {
            id: 1,
            title: "Year 4 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 4 students",
            type: "Worksheets",
            year: "Year 4",
            fileCount: "Multiple PDFs",
        },
        {
            id: 2,
            title: "Year 5 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 5 students",
            type: "Worksheets",
            year: "Year 5",
            fileCount: "Multiple PDFs",
        },
        {
            id: 3,
            title: "Year 6 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 6 students",
            type: "Worksheets",
            year: "Year 6",
            fileCount: "Multiple PDFs",
        },
        {
            id: 4,
            title: "Year 7 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 7 students",
            type: "Worksheets",
            year: "Year 7",
            fileCount: "Multiple PDFs",
        },
        {
            id: 5,
            title: "Year 8 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 8 students",
            type: "Worksheets",
            year: "Year 8",
            fileCount: "Multiple PDFs",
        },
        {
            id: 6,
            title: "Year 9 Mathematics Worksheets",
            description: "Additional exercises and practice problems for Year 9 students",
            type: "Worksheets",
            year: "Year 9",
            fileCount: "Multiple PDFs",
        },
    ];
    const yearColors = {
        "Year 4": "bg-purple-100 text-purple-700",
        "Year 5": "bg-blue-100 text-blue-700",
        "Year 6": "bg-green-100 text-green-700",
        "Year 7": "bg-orange-100 text-orange-700",
        "Year 8": "bg-red-100 text-red-700",
        "Year 9": "bg-indigo-100 text-indigo-700",
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Teaching Resources" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Additional worksheets and materials for your students" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: resources.map((resource) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0", children: _jsx(FileText, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: resource.title }), _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${yearColors[resource.year]}`, children: resource.year })] })] }) }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: resource.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsx("span", { children: resource.fileCount }), _jsx("span", { children: resource.type })] }), _jsxs(Button, { className: "w-full bg-blue-600 hover:bg-blue-700", size: "sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] })] })] }, resource.id))) }), _jsxs(Card, { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-blue-900 flex items-center gap-2", children: [_jsx(FolderOpen, { className: "w-5 h-5" }), "Resource Usage Guidelines"] }) }), _jsxs(CardContent, { className: "space-y-2 text-sm text-blue-800", children: [_jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Supplementary Material:" }), " Use these worksheets as additional practice for students who need extra help"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Homework Assignments:" }), " Assign relevant worksheets as homework to reinforce lesson concepts"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Assessment Preparation:" }), " Help students prepare for tests with targeted practice problems"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Differentiation:" }), " Provide easier or more challenging problems based on student ability"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Parent Resources:" }), " Share worksheets with parents for home practice"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Coming Soon" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [_jsx("p", { children: "\u2022 Video tutorials and teaching guides" }), _jsx("p", { children: "\u2022 Interactive online exercises" }), _jsx("p", { children: "\u2022 Assessment templates and rubrics" }), _jsx("p", { children: "\u2022 Parent communication templates" })] }) })] })] }));
}
