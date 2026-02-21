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
    unlocked?: boolean;
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

type Envelope<T> = { success?: boolean; data?: T };
type StatsPayload = {
    xp?: number;
    level?: number;
    currentStreak?: number;
    longestStreak?: number;
    lastWorkoutDate?: string | null;
    nextLevelXp?: number;
    levelProgress?: number;
};

const unwrapPayload = <T>(payload: T | Envelope<T>): T => {
    if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
        return ((payload as Envelope<T>).data ?? (payload as T));
    }
    return payload as T;
};

const toIsoDate = (date: Date) => date.toISOString().split('T')[0];

const buildStreakSeries = (currentStreak: number) => {
    const days = 35;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthlyData: { date: string; intensity: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const ageFromToday = i;
        const intensity = ageFromToday < currentStreak ? 1 : 0;
        monthlyData.push({
            date: toIsoDate(date),
            intensity,
        });
    }

    const weeklyData = monthlyData.slice(-7).map((day) => day.intensity);
    return { weeklyData, monthlyData };
};

export const gamificationApi = {
    /**
     * Get user's gamification stats (XP, level, achievements)
     */
    getStats: async (): Promise<GamificationStats> => {
        const response = await apiClient.get<StatsPayload | Envelope<StatsPayload>>('/gamification/stats');
        const stats = unwrapPayload<StatsPayload>(response.data);

        const xp = Number(stats?.xp ?? 0);
        const level = Math.max(1, Number(stats?.level ?? 1));
        const currentLevelBaseXp = Math.pow(Math.max(level - 1, 0), 2) * 100;
        const defaultNextLevelXp = Math.pow(level, 2) * 100;
        const nextLevelXp = Math.max(defaultNextLevelXp, Number(stats?.nextLevelXp ?? defaultNextLevelXp));
        const currentLevelXp = Math.max(0, xp - currentLevelBaseXp);
        const levelProgressRaw = Number(stats?.levelProgress ?? 0);
        const levelProgress = levelProgressRaw > 1 ? levelProgressRaw / 100 : levelProgressRaw;

        return {
            xp,
            level,
            levelProgress: Math.max(0, Math.min(1, levelProgress)),
            currentLevelXp,
            nextLevelXp,
            title: `Level ${level}`,
            nextTitle: `Level ${level + 1}`,
            achievements: [],
            recentXpGains: [],
            currentStreak: Number(stats?.currentStreak ?? 0),
            longestStreak: Number(stats?.longestStreak ?? 0),
            lastWorkoutDate: stats?.lastWorkoutDate ?? null,
        };
    },

    /**
     * Get user's streak data
     */
    getStreakData: async (): Promise<StreakData> => {
        const stats = await gamificationApi.getStats();
        const series = buildStreakSeries(stats.currentStreak ?? 0);
        return {
            currentStreak: stats.currentStreak ?? 0,
            longestStreak: stats.longestStreak ?? 0,
            lastWorkoutDate: stats.lastWorkoutDate ?? null,
            weeklyData: series.weeklyData,
            monthlyData: series.monthlyData,
        };
    },

    /**
     * Get user's achievements
     */
    getAchievements: async (): Promise<Achievement[]> => {
        const response = await apiClient.get<any[] | Envelope<any[]>>('/gamification/achievements');
        const payload = unwrapPayload<any[]>(response.data) ?? [];

        return payload.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon || item.iconUrl || '',
            unlocked: Boolean(item.unlocked || item.unlockedAt),
            unlockedAt: item.unlockedAt ?? null,
            progress: item.unlocked || item.unlockedAt ? 100 : item.progress,
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
