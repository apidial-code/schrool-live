import { Trophy, Award, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Badge {
  id: number;
  badgeName: string;
  badgeIcon: string | null;
  description: string | null;
  earnedAt: string;
}

interface AchievementBadgesProps {
  badges: Badge[];
  isLoading: boolean;
}

export function AchievementBadges({ badges, isLoading }: AchievementBadgesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            My Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading badges...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          My Achievements
        </CardTitle>
        <CardDescription>{badges.length} badges earned</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Complete lessons to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 hover:shadow-md transition-shadow"
                title={badge.description || badge.badgeName}
              >
                <div className="w-12 h-12 rounded-full bg-yellow-600 text-white flex items-center justify-center mb-2">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-center text-gray-900">{badge.badgeName}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
