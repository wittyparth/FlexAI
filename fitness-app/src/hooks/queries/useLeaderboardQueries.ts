import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaderboardApi, LeaderboardPeriod, LeaderboardMetric, Challenge } from '../../api/leaderboard.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const leaderboardKeys = {
    all: ['leaderboard'] as const,
    rankings: (period?: LeaderboardPeriod, metric?: LeaderboardMetric) =>
        [...leaderboardKeys.all, 'rankings', period, metric] as const,
    challenges: (status?: string) => [...leaderboardKeys.all, 'challenges', status] as const,
    challenge: (id: string) => [...leaderboardKeys.all, 'challenge', id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch leaderboard rankings
 */
export const useRankings = (params?: {
    period?: LeaderboardPeriod;
    metric?: LeaderboardMetric;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: leaderboardKeys.rankings(params?.period, params?.metric),
        queryFn: () => leaderboardApi.getRankings(params),
    });
};

/**
 * Hook to fetch challenges
 */
export const useChallenges = (params?: {
    status?: 'active' | 'upcoming' | 'completed';
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: leaderboardKeys.challenges(params?.status),
        queryFn: () => leaderboardApi.getChallenges(params),
    });
};

/**
 * Hook to fetch a specific challenge
 */
export const useChallengeDetail = (challengeId: string) => {
    return useQuery({
        queryKey: leaderboardKeys.challenge(challengeId),
        queryFn: () => leaderboardApi.getChallengeById(challengeId),
        enabled: !!challengeId,
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to join a challenge
 */
export const useJoinChallenge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (challengeId: string) => leaderboardApi.joinChallenge(challengeId),
        onSuccess: (_, challengeId) => {
            // Invalidate challenges to refresh join status
            queryClient.invalidateQueries({ queryKey: leaderboardKeys.challenges() });
            queryClient.invalidateQueries({ queryKey: leaderboardKeys.challenge(challengeId) });
        },
    });
};

/**
 * Hook to leave a challenge
 */
export const useLeaveChallenge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (challengeId: string) => leaderboardApi.leaveChallenge(challengeId),
        onSuccess: (_, challengeId) => {
            queryClient.invalidateQueries({ queryKey: leaderboardKeys.challenges() });
            queryClient.invalidateQueries({ queryKey: leaderboardKeys.challenge(challengeId) });
        },
    });
};
