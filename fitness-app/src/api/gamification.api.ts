import apiClient from './client';

export interface GamificationStats {
    xp: number;
    level: number;
    levelProgress: number; // 0-1
    currentLevelXp: number;
    nextLevelXp: number;
    title: string;
    nextTitle: string;
    achievements: Achievement[];
    recentXpGains: XPGain[];
    currentStreak?: number;
    longestStreak?: number;
    lastWorkoutDate?: string | null;
}

export interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string | null;
    progress?: number; // 0-100 for locked achievements
}

export interface XPGain {
    id: number;
    amount: number;
    source: 'WORKOUT' | 'STREAK' | 'ACHIEVEMENT' | 'PR' | 'CHALLENGE';
    description: string;
    createdAt: string;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    weeklyData: number[]; // 7 days, 0 = no workout, 1+ = workout intensity
    monthlyData: { date: string; intensity: number }[];
}

export const gamificationApi = {
    /**
     * Get user's gamification stats (XP, level, achievements)
     */
    getStats: async (): Promise<GamificationStats> => {
        const response = await apiClient.get<{
            xp: number;
            level: number;
            currentStreak: number;
            longestStreak: number;
            lastWorkoutDate: string | null;
            nextLevelXp: number;
            levelProgress: number;
        }>('/gamification/stats');

        const stats = response.data;
        const currentLevelBaseXp = Math.pow(Math.max(stats.level - 1, 0), 2) * 100;
        const currentLevelXp = Math.max(0, stats.xp - currentLevelBaseXp);

        return {
            xp: stats.xp,
            level: stats.level,
            levelProgress: stats.levelProgress / 100,
            currentLevelXp,
            nextLevelXp: stats.nextLevelXp,
            title: `Level ${stats.level}`,
            nextTitle: `Level ${stats.level + 1}`,
            achievements: [],
            recentXpGains: [],
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            lastWorkoutDate: stats.lastWorkoutDate,
        };
    },

    /**
     * Get user's streak data
     */
    getStreakData: async (): Promise<StreakData> => {
        const stats = await gamificationApi.getStats();
        return {
            currentStreak: stats.currentStreak ?? 0,
            longestStreak: stats.longestStreak ?? 0,
            lastWorkoutDate: stats.lastWorkoutDate ?? null,
            weeklyData: [],
            monthlyData: [],
        };
    },

    /**
     * Get user's achievements
     */
    getAchievements: async (): Promise<Achievement[]> => {
        const response = await apiClient.get<any[]>('/gamification/achievements');
        return (response.data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.iconUrl || '',
            unlockedAt: item.unlockedAt,
            progress: item.unlocked ? 100 : undefined,
        }));
    },

    /**
     * Get recent XP gains
     */
    getRecentXpGains: async (_limit = 10): Promise<XPGain[]> => {
        // Backend XP history endpoint is not available yet.
        return [];
    },
};
