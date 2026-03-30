import { trpc } from "@/lib/trpc";
import { Loader2, Trophy, Star, Award, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ParentAchievementsProps {
  studentId: number;
  studentName: string;
}

export function ParentAchievements({ studentId, studentName }: ParentAchievementsProps) {
  const { data: achievements, isLoading } = trpc.parent.getChildAchievements.useQuery({ studentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "perfect_score":
        return <Star className="w-8 h-8 text-amber-500" />;
      case "streak":
        return <Zap className="w-8 h-8 text-blue-500" />;
      case "milestone":
        return <Trophy className="w-8 h-8 text-blue-500" />;
      case "question_master":
        return <Award className="w-8 h-8 text-green-500" />;
      default:
        return <Trophy className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-600 mt-1">{studentName}'s milestones and accomplishments</p>
      </div>

      {achievements && achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {getAchievementIcon(achievement.achievementType)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <p className="text-xs text-gray-500">
                    Earned {format(new Date(achievement.earnedAt), "PPP")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
              <p className="text-gray-600">
                Keep learning! Achievements will appear here as {studentName} progresses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
