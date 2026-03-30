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

  const yearColors: Record<string, string> = {
    "Year 4": "bg-purple-100 text-purple-700",
    "Year 5": "bg-blue-100 text-blue-700",
    "Year 6": "bg-green-100 text-green-700",
    "Year 7": "bg-orange-100 text-orange-700",
    "Year 8": "bg-red-100 text-red-700",
    "Year 9": "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Teaching Resources</h3>
        <p className="text-gray-600 mt-1">Additional worksheets and materials for your students</p>
      </div>

      {/* Resource Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${yearColors[resource.year]}`}>
                      {resource.year}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{resource.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{resource.fileCount}</span>
                <span>{resource.type}</span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Resource Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Supplementary Material:</strong> Use these worksheets as additional practice for students who need extra help</p>
          <p>• <strong>Homework Assignments:</strong> Assign relevant worksheets as homework to reinforce lesson concepts</p>
          <p>• <strong>Assessment Preparation:</strong> Help students prepare for tests with targeted practice problems</p>
          <p>• <strong>Differentiation:</strong> Provide easier or more challenging problems based on student ability</p>
          <p>• <strong>Parent Resources:</strong> Share worksheets with parents for home practice</p>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Video tutorials and teaching guides</p>
            <p>• Interactive online exercises</p>
            <p>• Assessment templates and rubrics</p>
            <p>• Parent communication templates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
