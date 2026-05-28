import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Link2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
export default function AdminChildParentLinking() {
    const [links, setLinks] = useState([]);
    const [parents, setParents] = useState([]);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [isLinking, setIsLinking] = useState(false);
    const [searchParent, setSearchParent] = useState("");
    const [searchChild, setSearchChild] = useState("");
    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch existing links
                const linksRes = await fetch("/api/admin/parent-child-links");
                if (linksRes.ok) {
                    const linksData = await linksRes.json();
                    setLinks(linksData);
                }
                // Fetch all users
                const usersRes = await fetch("/api/admin/users");
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    const parentUsers = usersData.filter((u) => u.role === "parent");
                    const childUsers = usersData.filter((u) => u.role === "student");
                    setParents(parentUsers);
                    setChildren(childUsers);
                }
            }
            catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load data");
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleCreateLink = async () => {
        if (!selectedParentId || !selectedChildId) {
            toast.error("Please select both a parent and a child");
            return;
        }
        try {
            setIsLinking(true);
            const response = await fetch("/api/admin/parent-child-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parentId: selectedParentId,
                    childId: selectedChildId,
                }),
            });
            if (response.ok) {
                const newLink = await response.json();
                setLinks([...links, newLink]);
                setSelectedParentId(null);
                setSelectedChildId(null);
                toast.success("Link created successfully!");
            }
            else {
                const error = await response.json();
                toast.error(error.message || "Failed to create link");
            }
        }
        catch (error) {
            console.error("Error creating link:", error);
            toast.error("Failed to create link");
        }
        finally {
            setIsLinking(false);
        }
    };
    const handleDeleteLink = async (linkId) => {
        try {
            const response = await fetch(`/api/admin/parent-child-links/${linkId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setLinks(links.filter((l) => l.id !== linkId));
                toast.success("Link deleted successfully!");
            }
            else {
                toast.error("Failed to delete link");
            }
        }
        catch (error) {
            console.error("Error deleting link:", error);
            toast.error("Failed to delete link");
        }
    };
    const filteredParents = parents.filter((p) => p.name.toLowerCase().includes(searchParent.toLowerCase()) ||
        p.email.toLowerCase().includes(searchParent.toLowerCase()));
    const filteredChildren = children.filter((c) => c.name.toLowerCase().includes(searchChild.toLowerCase()) ||
        c.email.toLowerCase().includes(searchChild.toLowerCase()));
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-700" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Child-Parent Linking" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Link student accounts to parent accounts for progress monitoring" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Link2, { className: "w-5 h-5 text-blue-700" }), "Create New Link"] }), _jsx(CardDescription, { children: "Select a parent and a student to create a new relationship" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Select Parent" }), _jsx(Input, { type: "text", placeholder: "Search parent...", value: searchParent, onChange: (e) => setSearchParent(e.target.value), className: "mb-2" }), _jsx("div", { className: "border rounded-lg max-h-48 overflow-y-auto", children: filteredParents.length > 0 ? (_jsx("div", { className: "space-y-1", children: filteredParents.map((parent) => (_jsxs("button", { onClick: () => setSelectedParentId(parent.id), className: `w-full text-left px-4 py-2 hover:bg-blue-50 transition ${selectedParentId === parent.id
                                                            ? "bg-blue-100 border-l-4 border-blue-700"
                                                            : ""}`, children: [_jsx("div", { className: "font-medium text-gray-900", children: parent.name }), _jsx("div", { className: "text-sm text-gray-600", children: parent.email })] }, parent.id))) })) : (_jsx("div", { className: "px-4 py-8 text-center text-gray-500", children: "No parents found" })) }), selectedParentId && (_jsxs("div", { className: "mt-2 flex items-center gap-2 text-green-700", children: [_jsx(Check, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm", children: [parents.find((p) => p.id === selectedParentId)?.name, " selected"] })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Select Student" }), _jsx(Input, { type: "text", placeholder: "Search student...", value: searchChild, onChange: (e) => setSearchChild(e.target.value), className: "mb-2" }), _jsx("div", { className: "border rounded-lg max-h-48 overflow-y-auto", children: filteredChildren.length > 0 ? (_jsx("div", { className: "space-y-1", children: filteredChildren.map((child) => (_jsxs("button", { onClick: () => setSelectedChildId(child.id), className: `w-full text-left px-4 py-2 hover:bg-blue-50 transition ${selectedChildId === child.id
                                                            ? "bg-blue-100 border-l-4 border-blue-700"
                                                            : ""}`, children: [_jsx("div", { className: "font-medium text-gray-900", children: child.name }), _jsx("div", { className: "text-sm text-gray-600", children: child.email })] }, child.id))) })) : (_jsx("div", { className: "px-4 py-8 text-center text-gray-500", children: "No students found" })) }), selectedChildId && (_jsxs("div", { className: "mt-2 flex items-center gap-2 text-green-700", children: [_jsx(Check, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm", children: [children.find((c) => c.id === selectedChildId)?.name, " selected"] })] }))] })] }), _jsx(Button, { onClick: handleCreateLink, disabled: !selectedParentId || !selectedChildId || isLinking, className: "w-full bg-blue-700 hover:bg-blue-800", children: isLinking ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Creating Link..."] })) : (_jsxs(_Fragment, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Link"] })) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Link2, { className: "w-5 h-5 text-blue-700" }), "Existing Links (", links.length, ")"] }), _jsx(CardDescription, { children: "All active parent-student relationships" })] }), _jsx(CardContent, { children: links.length > 0 ? (_jsx("div", { className: "space-y-3", children: links.map((link) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: link.parentName }), _jsx("p", { className: "text-sm text-gray-600", children: link.parentEmail })] }), _jsx("span", { className: "text-gray-400", children: "\u2192" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: link.childName }), _jsx("p", { className: "text-sm text-gray-600", children: link.childEmail })] })] }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Created: ", new Date(link.createdAt).toLocaleDateString()] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteLink(link.id), className: "text-red-600 hover:text-red-700 hover:bg-red-50", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, link.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500", children: "No links created yet" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Create your first parent-student link above" })] })) })] })] }));
}
