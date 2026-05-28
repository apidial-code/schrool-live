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
export declare function AchievementBadges({ badges, isLoading }: AchievementBadgesProps): import("react/jsx-runtime").JSX.Element;
export {};
