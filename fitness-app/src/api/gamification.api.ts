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
        const response = await apiClient.get<{ data: GamificationStats }>('/gamification/stats');
        return response.data.data;
    },

    /**
     * Get user's streak data
     */
    getStreakData: async (): Promise<StreakData> => {
        const response = await apiClient.get<{ data: StreakData }>('/gamification/streak');
        return response.data.data;
    },

    /**
     * Get user's achievements
     */
    getAchievements: async (): Promise<Achievement[]> => {
        const response = await apiClient.get<{ data: Achievement[] }>('/gamification/achievements');
        return response.data.data;
    },

    /**
     * Get recent XP gains
     */
    getRecentXpGains: async (limit = 10): Promise<XPGain[]> => {
        const response = await apiClient.get<{ data: XPGain[] }>('/gamification/xp-history', {
            params: { limit },
        });
        return response.data.data;
    },
};
