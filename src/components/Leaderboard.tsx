import { Trophy, Medal, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  rank: number;
  lessonsCompleted: number;
  averageScore: number;
  badgesEarned: number;
  certificatesEarned: number;
  user: {
    name: string;
  };
}

interface LeaderboardProps {
  topStudents: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  isLoading: boolean;
}

export function Leaderboard({ topStudents, userRank, isLoading }: LeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top students by lessons completed and average score</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Students */}
        <div className="space-y-2">
          {topStudents.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.rank <= 3
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 flex justify-center">{getMedalIcon(entry.rank)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{entry.user.name}</h3>
                  <p className="text-xs text-gray-600">
                    {entry.lessonsCompleted} lessons • {entry.averageScore.toFixed(1)}% avg
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {entry.badgesEarned} badges
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* User's Rank */}
        {userRank && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Rank</h3>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Rank #{userRank.rank}</h3>
                  <p className="text-sm text-gray-600">
                    {userRank.lessonsCompleted} lessons completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{userRank.averageScore.toFixed(1)}%</div>
                <p className="text-xs text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
