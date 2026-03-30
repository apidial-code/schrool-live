import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";

export default function TeacherLeaderboard() {
  // Mock data for demonstration
  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", sessions: 156, rating: 4.9, badge: "gold", bonus: 500 },
    { rank: 2, name: "Michael Chen", sessions: 142, rating: 4.8, badge: "silver", bonus: 300 },
    { rank: 3, name: "Emma Williams", sessions: 138, rating: 4.8, badge: "bronze", bonus: 200 },
    { rank: 4, name: "David Martinez", sessions: 125, rating: 4.7, badge: null, bonus: 0 },
    { rank: 5, name: "Lisa Anderson", sessions: 118, rating: 4.7, badge: null, bonus: 0 },
  ];

  const myAchievements = [
    { type: "100_sessions", tier: "gold", earnedAt: "2025-12-15", description: "Delivered 100+ sessions" },
    { type: "perfect_rating", tier: "platinum", earnedAt: "2025-11-20", description: "Achieved 5.0 rating for 3 months" },
    { type: "monthly_top_performer", tier: "gold", earnedAt: "2025-10-31", description: "Top performer in October 2025" },
  ];

  const getBadgeIcon = (badge: string | null, size: string = "w-8 h-8") => {
    if (badge === "gold") return <Trophy className={`${size} text-yellow-500`} />;
    if (badge === "silver") return <Medal className={`${size} text-gray-400`} />;
    if (badge === "bronze") return <Award className={`${size} text-orange-600`} />;
    return null;
  };

  const getTierColor = (tier: string) => {
    if (tier === "platinum") return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (tier === "gold") return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (tier === "silver") return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (tier === "bronze") return "bg-gradient-to-r from-orange-400 to-orange-600";
    return "bg-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Leaderboard</h2>
        <p className="text-gray-600 mt-1">Monthly rankings and achievements</p>
      </div>

      {/* My Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            My Achievements
          </CardTitle>
          <CardDescription>Badges and milestones you've earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myAchievements.map((achievement, index) => (
              <div
                key={index}
                className={`${getTierColor(achievement.tier)} rounded-lg p-4 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase">{achievement.tier}</span>
                  {getBadgeIcon(achievement.tier === "platinum" ? "gold" : achievement.tier, "w-6 h-6")}
                </div>
                <p className="font-bold text-lg mb-1">{achievement.description}</p>
                <p className="text-sm opacity-90">Earned {new Date(achievement.earnedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                January 2026 Leaderboard
              </CardTitle>
              <CardDescription>Top performers ranked by sessions delivered and student ratings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((teacher) => (
              <div
                key={teacher.rank}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  teacher.rank <= 3 ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                    teacher.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                    teacher.rank === 2 ? "bg-gray-300 text-gray-700" :
                    teacher.rank === 3 ? "bg-orange-400 text-orange-900" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {teacher.rank}
                  </div>

                  {/* Badge */}
                  {teacher.badge && (
                    <div className="hidden md:block">
                      {getBadgeIcon(teacher.badge)}
                    </div>
                  )}

                  {/* Teacher Info */}
                  <div>
                    <p className="font-bold text-gray-900">{teacher.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{teacher.sessions} sessions</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {teacher.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bonus */}
                {teacher.bonus > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Performance Bonus</p>
                    <p className="font-bold text-green-600 text-lg">${teacher.bonus}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bonus Structure Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Monthly Performance Bonuses</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span><strong>1st Place:</strong> $500 bonus</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-gray-400" />
                <span><strong>2nd Place:</strong> $300 bonus</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                <span><strong>3rd Place:</strong> $200 bonus</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Milestones</CardTitle>
          <CardDescription>Unlock badges by reaching these milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Session Milestones</h4>
              <ul className="space-y-1 text-sm text-orange-800">
                <li>• 50 sessions → Bronze Badge</li>
                <li>• 100 sessions → Silver Badge</li>
                <li>• 200 sessions → Gold Badge</li>
                <li>• 500 sessions → Platinum Badge</li>
              </ul>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Rating Milestones</h4>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• 4.5+ rating (1 month) → Bronze Badge</li>
                <li>• 4.7+ rating (3 months) → Silver Badge</li>
                <li>• 4.8+ rating (6 months) → Gold Badge</li>
                <li>• 5.0 rating (3 months) → Platinum Badge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
