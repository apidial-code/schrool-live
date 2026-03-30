import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Link2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ParentChildLink {
  id: number;
  parentId: number;
  childId: number;
  parentName: string;
  childName: string;
  parentEmail: string;
  childEmail: string;
  createdAt: string;
}

export default function AdminChildParentLinking() {
  const [links, setLinks] = useState<ParentChildLink[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [children, setChildren] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
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
          const parentUsers = usersData.filter((u: User) => u.role === "parent");
          const childUsers = usersData.filter((u: User) => u.role === "student");
          setParents(parentUsers);
          setChildren(childUsers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
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
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create link");
      }
    } catch (error) {
      console.error("Error creating link:", error);
      toast.error("Failed to create link");
    } finally {
      setIsLinking(false);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    try {
      const response = await fetch(`/api/admin/parent-child-links/${linkId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLinks(links.filter((l) => l.id !== linkId));
        toast.success("Link deleted successfully!");
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const filteredParents = parents.filter((p) =>
    p.name.toLowerCase().includes(searchParent.toLowerCase()) ||
    p.email.toLowerCase().includes(searchParent.toLowerCase())
  );

  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(searchChild.toLowerCase()) ||
    c.email.toLowerCase().includes(searchChild.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Child-Parent Linking</h2>
        <p className="text-gray-600 mt-1">
          Link student accounts to parent accounts for progress monitoring
        </p>
      </div>

      {/* Create New Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-700" />
            Create New Link
          </CardTitle>
          <CardDescription>
            Select a parent and a student to create a new relationship
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Parent
              </label>
              <Input
                type="text"
                placeholder="Search parent..."
                value={searchParent}
                onChange={(e) => setSearchParent(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredParents.length > 0 ? (
                  <div className="space-y-1">
                    {filteredParents.map((parent) => (
                      <button
                        key={parent.id}
                        onClick={() => setSelectedParentId(parent.id)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition ${
                          selectedParentId === parent.id
                            ? "bg-blue-100 border-l-4 border-blue-700"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-gray-900">{parent.name}</div>
                        <div className="text-sm text-gray-600">{parent.email}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No parents found
                  </div>
                )}
              </div>
              {selectedParentId && (
                <div className="mt-2 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">
                    {parents.find((p) => p.id === selectedParentId)?.name} selected
                  </span>
                </div>
              )}
            </div>

            {/* Child Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Student
              </label>
              <Input
                type="text"
                placeholder="Search student..."
                value={searchChild}
                onChange={(e) => setSearchChild(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredChildren.length > 0 ? (
                  <div className="space-y-1">
                    {filteredChildren.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedChildId(child.id)}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition ${
                          selectedChildId === child.id
                            ? "bg-blue-100 border-l-4 border-blue-700"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-gray-900">{child.name}</div>
                        <div className="text-sm text-gray-600">{child.email}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No students found
                  </div>
                )}
              </div>
              {selectedChildId && (
                <div className="mt-2 flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">
                    {children.find((c) => c.id === selectedChildId)?.name} selected
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleCreateLink}
            disabled={!selectedParentId || !selectedChildId || isLinking}
            className="w-full bg-blue-700 hover:bg-blue-800"
          >
            {isLinking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Link...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-700" />
            Existing Links ({links.length})
          </CardTitle>
          <CardDescription>
            All active parent-student relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{link.parentName}</p>
                        <p className="text-sm text-gray-600">{link.parentEmail}</p>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div>
                        <p className="font-medium text-gray-900">{link.childName}</p>
                        <p className="text-sm text-gray-600">{link.childEmail}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No links created yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first parent-student link above
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
