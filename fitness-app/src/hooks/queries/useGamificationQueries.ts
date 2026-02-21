import { useQuery } from '@tanstack/react-query';
import { Achievement, GamificationStats, StreakData, gamificationApi } from '../../api/gamification.api';

export const gamificationKeys = {
    all: ['gamification'] as const,
    stats: () => [...gamificationKeys.all, 'stats'] as const,
    streak: () => [...gamificationKeys.all, 'streak'] as const,
    achievements: () => [...gamificationKeys.all, 'achievements'] as const,
};

export function useGamificationStats() {
    return useQuery<GamificationStats>({
        queryKey: gamificationKeys.stats(),
        queryFn: gamificationApi.getStats,
        staleTime: 1000 * 60 * 5,
    });
}

export function useStreakData() {
    return useQuery<StreakData>({
        queryKey: gamificationKeys.streak(),
        queryFn: gamificationApi.getStreakData,
        staleTime: 1000 * 60 * 5,
    });
}

export function useAchievements() {
    return useQuery<Achievement[]>({
        queryKey: gamificationKeys.achievements(),
        queryFn: gamificationApi.getAchievements,
        staleTime: 1000 * 60 * 10,
    });
}
