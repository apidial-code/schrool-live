import { Card, CardContent } from "@/components/ui/card";
import { Award, Trophy, Zap, Target, Star, TrendingUp } from "lucide-react";

export default function StudentBadges() {
  // Realistic demo data matching actual student progress (1 lesson completed)
  const earnedBadges: Array<{id: number; name: string; icon: string; color: string; description: string; tier?: string; category?: string; type?: string; milestone?: string; earnedAt?: Date}> = [
    // No badges earned yet - student just started
  ];

  const progress = {
    lessonsCompleted: 1, // Student completed Lesson 1 only
    perfectScores: 1, // Got 10/10 on Challenging level
    currentStreak: 3, // 3 days in a row
    longestStreak: 3,
  };

  // Cumulative badge thresholds across all years (Year 5/6: 23, Year 7: 36, Year 8: 32, Year 9: 28 = 119 total)
  const upcomingBadges = [
    { type: "lesson_completion_10", tier: "bronze", category: "completion", milestone: 10, progress: 1, required: 10 },
    { type: "perfect_score_3", tier: "bronze", category: "perfection", milestone: 3, progress: 1, required: 3 },
    { type: "streak_7_day", tier: "bronze", category: "streak", milestone: 7, progress: 3, required: 7 },
  ];

  const getTierColor = (tier: string) => {
    if (tier === "platinum") return "from-purple-500 to-pink-500";
    if (tier === "gold") return "from-yellow-400 to-yellow-600";
    if (tier === "silver") return "from-gray-300 to-gray-500";
    if (tier === "bronze") return "from-orange-400 to-orange-600";
    return "from-gray-200 to-gray-400";
  };

  const getCategoryIcon = (category: string) => {
    if (category === "completion") return <Target className="w-6 h-6" />;
    if (category === "perfection") return <Star className="w-6 h-6" />;
    if (category === "streak") return <Zap className="w-6 h-6" />;
    return <Award className="w-6 h-6" />;
  };

  const getCategoryName = (category: string) => {
    if (category === "completion") return "Lesson Completion";
    if (category === "perfection") return "Perfect Scores";
    if (category === "streak") return "Learning Streak";
    return "Achievement";
  };

  const getBadgeDescription = (type: string, milestone: number) => {
    if (type.includes("lesson_completion")) return `Completed ${milestone} lessons`;
    if (type.includes("perfect_score")) return `Achieved ${milestone} perfect scores`;
    if (type.includes("streak")) return `${milestone}-day learning streak`;
    return `Milestone: ${milestone}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Achievements</h2>
        <p className="text-gray-600 mt-1">Badges and milestones you've earned</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{progress.lessonsCompleted}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perfect Scores</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{progress.perfectScores}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{progress.currentStreak}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{earnedBadges.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Earned Badges</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Congratulations on these achievements!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(badge.tier ?? '')} opacity-10`} />
                <CardContent className="pt-6 relative">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getTierColor(badge.tier ?? '')} flex items-center justify-center text-white shadow-lg`}>
                      {getCategoryIcon(badge.category ?? '')}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{badge.tier ?? ''}</p>
                      <p className="font-semibold text-gray-900 mt-1">{getCategoryName(badge.category ?? '')}</p>
                      <p className="text-sm text-gray-600 mt-1">{getBadgeDescription(badge.type ?? '', Number(badge.milestone ?? 0))}</p>
                      <p className="text-xs text-gray-500 mt-2">Earned {badge.earnedAt ? (badge.earnedAt instanceof Date ? badge.earnedAt.toLocaleDateString() : String(badge.earnedAt)) : ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">Earned Badges</h3>
          </div>
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No badges earned yet</p>
                <p className="text-sm text-gray-500 mt-2">Keep learning to unlock your first badge!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Next Badges to Unlock */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Next Badges to Unlock</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Keep learning to earn these achievements!</p>

        <div className="space-y-4">
          {upcomingBadges.map((badge, index) => {
            const progressPercent = (badge.progress / badge.required) * 100;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getTierColor(badge.tier ?? '')} flex items-center justify-center text-white flex-shrink-0`}>
                      {getCategoryIcon(badge.category ?? '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{getCategoryName(badge.category ?? '')}</p>
                          <p className="text-sm text-gray-600">{getBadgeDescription(badge.type ?? '', Number(badge.milestone ?? 0))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{badge.progress} / {badge.required}</p>
                          <p className="text-xs text-gray-500 uppercase">{badge.tier ?? ''}</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getTierColor(badge.tier ?? '')} transition-all duration-300`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Badge Tier Explanation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Badge Tiers (Cumulative Across All Years)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Badges are earned cumulatively as you progress through Year 5/6, 7, 8, and 9 courses (119 total lessons).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Lesson Completion</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
                      <span>Bronze: 10 lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-500" />
                      <span>Silver: 25 lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
                      <span>Gold: 50 lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span>Platinum: 100 lessons</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Perfect Scores</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
                      <span>Bronze: 3 perfect scores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-500" />
                      <span>Silver: 10 perfect scores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
                      <span>Gold: 25 perfect scores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span>Platinum: 50 perfect scores</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Learning Streak</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
                      <span>Bronze: 7-day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-500" />
                      <span>Silver: 14-day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
                      <span>Gold: 30-day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span>Platinum: 60-day streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
