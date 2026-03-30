import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, BookOpen, Target } from "lucide-react";

export function ParentInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">5QHackMath Methodology</h1>
        <p className="text-gray-600 mt-1">Understanding the learning approach</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-700" />
            What is 5QHackMath?
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-gray-700">
            5QHackMath is an innovative mathematics learning methodology that emphasizes deep understanding 
            through a structured three-level approach: Easy, Medium, and Challenging. Students must achieve 
            at least 8 out of 10 correct answers to progress to the next level, ensuring mastery before advancement.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-700" />
            The 8/10 Rule
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            The 8/10 progression rule ensures students have truly mastered each concept before moving forward:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Students must score 8 or more out of 10 questions to unlock the next level</li>
            <li>Solution videos are always available for learning, but watched solutions don't count toward the score</li>
            <li>The denominator stays at 10, maintaining consistent standards</li>
            <li>This approach builds confidence and prevents knowledge gaps</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-700" />
            Three-Level System
          </CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Level 1: Easy</h4>
              <p className="text-gray-700">
                Foundation-building questions that introduce core concepts. Students develop basic understanding 
                and confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Level 2: Medium</h4>
              <p className="text-gray-700">
                Intermediate questions that apply concepts in varied contexts. Students strengthen their 
                problem-solving skills.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-amber-600 mb-2">Level 3: Challenging</h4>
              <p className="text-gray-700">
                Advanced questions requiring critical thinking and concept integration. Students demonstrate 
                mastery and analytical ability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent's Role</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p className="text-gray-700 mb-4">As a parent, you can support your child's learning by:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Monitoring progress through this dashboard</li>
            <li>Celebrating achievements and perfect scores</li>
            <li>Encouraging consistent practice</li>
            <li>Communicating with teachers about concerns</li>
            <li>Using the override feature sparingly when necessary</li>
            <li>Attending scheduled Zoom sessions with your child</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
