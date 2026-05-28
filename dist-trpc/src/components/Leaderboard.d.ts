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
export declare function Leaderboard({ topStudents, userRank, isLoading }: LeaderboardProps): import("react/jsx-runtime").JSX.Element;
export {};
