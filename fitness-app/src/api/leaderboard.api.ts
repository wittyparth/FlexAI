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
    /**
     * Get leaderboard rankings
     */
    getRankings: async (params?: {
        period?: LeaderboardPeriod;
        metric?: LeaderboardMetric;
        page?: number;
        limit?: number;
    }): Promise<RankingsResponse> => {
        const response = await apiClient.get<{ success: boolean; data: RankingsResponse }>(
            '/leaderboard/rankings',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get available challenges
     */
    getChallenges: async (params?: {
        status?: 'active' | 'upcoming' | 'completed';
        page?: number;
        limit?: number;
    }): Promise<ChallengesResponse> => {
        const response = await apiClient.get<{ success: boolean; data: ChallengesResponse }>(
            '/leaderboard/challenges',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get a specific challenge by ID
     */
    getChallengeById: async (challengeId: string): Promise<Challenge> => {
        const response = await apiClient.get<{ success: boolean; data: Challenge }>(
            `/leaderboard/challenges/${challengeId}`
        );
        return response.data.data;
    },

    /**
     * Join a challenge
     */
    joinChallenge: async (challengeId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(
            `/leaderboard/challenges/${challengeId}/join`
        );
        return response.data;
    },

    /**
     * Leave a challenge
     */
    leaveChallenge: async (challengeId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(
            `/leaderboard/challenges/${challengeId}/join`
        );
        return response.data;
    },
};
