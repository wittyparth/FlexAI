import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        username?: string;
        avatarUrl?: string;
    };
    score: number;
    metric: string;
    change?: number; // Position change since last period
}

export interface Challenge {
    id: string;
    name: string;
    description: string;
    type: 'volume' | 'streak' | 'workouts' | 'exercise' | 'custom';
    targetValue: number;
    currentValue?: number;
    startDate: string;
    endDate: string;
    participantsCount: number;
    isJoined?: boolean;
    isCompleted?: boolean;
    reward?: {
        xp: number;
        badge?: string;
    };
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';
export type LeaderboardMetric = 'volume' | 'workouts' | 'streak' | 'xp';

interface RankingsResponse {
    rankings: LeaderboardEntry[];
    userRank?: LeaderboardEntry;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ChallengesResponse {
    challenges: Challenge[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const leaderboardApi = {
    mapMetricToType(metric?: LeaderboardMetric): 'strength' | 'volume' | 'consistency' | 'weekly' {
        switch (metric) {
            case 'volume':
                return 'volume';
            case 'streak':
                return 'consistency';
            case 'workouts':
                return 'weekly';
            case 'xp':
            default:
                return 'strength';
        }
    },

    /**
     * Get leaderboard rankings
     */
    getRankings: async (params?: {
        period?: LeaderboardPeriod;
        metric?: LeaderboardMetric;
        page?: number;
        limit?: number;
    }): Promise<RankingsResponse> => {
        const type = leaderboardApi.mapMetricToType(params?.metric);
        const response = await apiClient.get<{ success: boolean; data: any[] }>(
            `/leaderboards/rankings/${type}`,
            { params: { limit: params?.limit } }
        );
        const rankings = (response.data.data || []).map((entry: any) => ({
            rank: entry.rank,
            userId: String(entry.user?.id ?? ''),
            user: {
                id: String(entry.user?.id ?? ''),
                firstName: entry.user?.firstName ?? 'Unknown',
                lastName: entry.user?.lastName ?? '',
                avatarUrl: entry.user?.avatarUrl,
            },
            score: entry.score ?? 0,
            metric: type,
        })) as LeaderboardEntry[];

        return {
            rankings,
            pagination: {
                page: 1,
                limit: params?.limit ?? rankings.length,
                total: rankings.length,
                totalPages: 1,
            },
        };
    },

    /**
     * Get available challenges
     */
    getChallenges: async (params?: {
        status?: 'active' | 'upcoming' | 'completed';
        page?: number;
        limit?: number;
    }): Promise<ChallengesResponse> => {
        const response = await apiClient.get<{ success: boolean; data: any[] }>(
            '/leaderboards/challenges'
        );
        const challenges = (response.data.data || []).map((challenge: any) => ({
            id: String(challenge.id),
            name: challenge.name,
            description: challenge.description,
            type: challenge.challengeType ?? 'custom',
            targetValue: challenge.targetValue ?? 0,
            startDate: challenge.startDate,
            endDate: challenge.endDate,
            participantsCount: challenge._count?.participants ?? 0,
        })) as Challenge[];

        return {
            challenges,
            pagination: {
                page: 1,
                limit: params?.limit ?? challenges.length,
                total: challenges.length,
                totalPages: 1,
            },
        };
    },

    /**
     * Get a specific challenge by ID
     */
    getChallengeById: async (challengeId: string): Promise<Challenge> => {
        const challenges = await leaderboardApi.getChallenges();
        const challenge = challenges.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            throw new Error('Challenge not found');
        }
        return challenge;
    },

    /**
     * Join a challenge
     */
    joinChallenge: async (challengeId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(
            `/leaderboards/challenges/${challengeId}/join`
        );
        return response.data;
    },

    /**
     * Leave a challenge
     */
    leaveChallenge: async (_challengeId: string): Promise<{ success: boolean }> => {
        // Leave challenge endpoint is not exposed by backend yet.
        throw new Error('Leave challenge is not supported by backend');
    },
};
