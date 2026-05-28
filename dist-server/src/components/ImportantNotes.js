import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lightbulb, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
export function ImportantNotes() {
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const { data: notes, isLoading } = trpc.notes.list.useQuery({ category: selectedCategory });
    const getCategoryIcon = (category) => {
        switch (category) {
            case "methodology":
                return _jsx(BookOpen, { className: "w-5 h-5" });
            case "study_tips":
                return _jsx(Lightbulb, { className: "w-5 h-5" });
            case "quick_reference":
                return _jsx(FileText, { className: "w-5 h-5" });
            default:
                return _jsx(FileText, { className: "w-5 h-5" });
        }
    };
    const getCategoryTitle = (category) => {
        switch (category) {
            case "methodology":
                return "5QHackMath Methodology";
            case "study_tips":
                return "Study Tips & Strategies";
            case "quick_reference":
                return "Quick Reference";
            default:
                return category;
        }
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case "methodology":
                return "bg-blue-500";
            case "study_tips":
                return "bg-green-500";
            case "quick_reference":
                return "bg-purple-500";
            default:
                return "bg-gray-500";
        }
    };
    const handleDownload = (fileUrl, title) => {
        if (!fileUrl) {
            toast.error("No file available for download");
            return;
        }
        window.open(fileUrl, "_blank");
        toast.success(`Downloading ${title}`);
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }) }));
    }
    const methodologyNotes = notes?.filter(n => n.category === "methodology") || [];
    const studyTipsNotes = notes?.filter(n => n.category === "study_tips") || [];
    const quickRefNotes = notes?.filter(n => n.category === "quick_reference") || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Important Notes" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Essential resources to help you succeed" })] }) }), _jsxs(Tabs, { defaultValue: "all", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "all", onClick: () => setSelectedCategory(undefined), children: "All Notes" }), _jsxs(TabsTrigger, { value: "methodology", onClick: () => setSelectedCategory("methodology"), children: [_jsx(BookOpen, { className: "w-4 h-4 mr-2" }), "Methodology"] }), _jsxs(TabsTrigger, { value: "study_tips", onClick: () => setSelectedCategory("study_tips"), children: [_jsx(Lightbulb, { className: "w-4 h-4 mr-2" }), "Study Tips"] }), _jsxs(TabsTrigger, { value: "quick_reference", onClick: () => setSelectedCategory("quick_reference"), children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Quick Reference"] })] }), _jsxs(TabsContent, { value: "all", className: "space-y-6 mt-6", children: [methodologyNotes.length > 0 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-lg ${getCategoryColor("methodology")} flex items-center justify-center text-white`, children: getCategoryIcon("methodology") }), "5QHackMath Methodology"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: methodologyNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-3", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) })] })), studyTipsNotes.length > 0 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-lg ${getCategoryColor("study_tips")} flex items-center justify-center text-white`, children: getCategoryIcon("study_tips") }), "Study Tips & Strategies"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: studyTipsNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-3", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) })] })), quickRefNotes.length > 0 && (_jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-lg ${getCategoryColor("quick_reference")} flex items-center justify-center text-white`, children: getCategoryIcon("quick_reference") }), "Quick Reference"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: quickRefNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-3", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) })] })), notes?.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No notes available yet. Check back soon!" })] }) }))] }), _jsxs(TabsContent, { value: "methodology", className: "mt-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: methodologyNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) }), methodologyNotes.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(BookOpen, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No methodology notes available yet." })] }) }))] }), _jsxs(TabsContent, { value: "study_tips", className: "mt-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: studyTipsNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) }), studyTipsNotes.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Lightbulb, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No study tips available yet." })] }) }))] }), _jsxs(TabsContent, { value: "quick_reference", className: "mt-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: quickRefNotes.map((note) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: note.title }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 text-sm mb-4", children: note.content }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "View"] }), note.fileUrl && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleDownload(note.fileUrl, note.title), children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] }))] })] })] }, note.id))) }), quickRefNotes.length === 0 && (_jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No quick reference materials available yet." })] }) }))] })] })] }));
}
