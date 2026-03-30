import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lightbulb, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ImportantNotes() {
  const [selectedCategory, setSelectedCategory] = useState<"methodology" | "study_tips" | "quick_reference" | undefined>(undefined);

  const { data: notes, isLoading } = trpc.notes.list.useQuery({ category: selectedCategory });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "methodology":
        return <BookOpen className="w-5 h-5" />;
      case "study_tips":
        return <Lightbulb className="w-5 h-5" />;
      case "quick_reference":
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
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

  const getCategoryColor = (category: string) => {
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

  const handleDownload = (fileUrl: string | null, title: string) => {
    if (!fileUrl) {
      toast.error("No file available for download");
      return;
    }
    window.open(fileUrl, "_blank");
    toast.success(`Downloading ${title}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const methodologyNotes = notes?.filter(n => n.category === "methodology") || [];
  const studyTipsNotes = notes?.filter(n => n.category === "study_tips") || [];
  const quickRefNotes = notes?.filter(n => n.category === "quick_reference") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Important Notes</h2>
          <p className="text-gray-600 mt-1">Essential resources to help you succeed</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" onClick={() => setSelectedCategory(undefined)}>
            All Notes
          </TabsTrigger>
          <TabsTrigger value="methodology" onClick={() => setSelectedCategory("methodology")}>
            <BookOpen className="w-4 h-4 mr-2" />
            Methodology
          </TabsTrigger>
          <TabsTrigger value="study_tips" onClick={() => setSelectedCategory("study_tips")}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Study Tips
          </TabsTrigger>
          <TabsTrigger value="quick_reference" onClick={() => setSelectedCategory("quick_reference")}>
            <FileText className="w-4 h-4 mr-2" />
            Quick Reference
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Methodology Section */}
          {methodologyNotes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${getCategoryColor("methodology")} flex items-center justify-center text-white`}>
                  {getCategoryIcon("methodology")}
                </div>
                5QHackMath Methodology
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methodologyNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {note.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(note.fileUrl, note.title)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Study Tips Section */}
          {studyTipsNotes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${getCategoryColor("study_tips")} flex items-center justify-center text-white`}>
                  {getCategoryIcon("study_tips")}
                </div>
                Study Tips & Strategies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyTipsNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {note.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(note.fileUrl, note.title)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Reference Section */}
          {quickRefNotes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${getCategoryColor("quick_reference")} flex items-center justify-center text-white`}>
                  {getCategoryIcon("quick_reference")}
                </div>
                Quick Reference
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickRefNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {note.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(note.fileUrl, note.title)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {notes?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notes available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="methodology" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methodologyNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{note.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {note.fileUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(note.fileUrl, note.title)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {methodologyNotes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No methodology notes available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="study_tips" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyTipsNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{note.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {note.fileUrl && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => handleDownload(note.fileUrl, note.title)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {studyTipsNotes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No study tips available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quick_reference" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickRefNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{note.content}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {note.fileUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(note.fileUrl, note.title)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {quickRefNotes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No quick reference materials available yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
