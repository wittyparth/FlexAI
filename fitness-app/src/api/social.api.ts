import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    level?: number;
    xp?: number;
    followersCount?: number;
    followingCount?: number;
    workoutsCount?: number;
    isFollowing?: boolean;
}

interface FollowListResponse {
    users: UserProfile[];
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

export const socialApi = {
    /**
     * Follow a user
     */
    followUser: async (userId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.post<{ success: boolean }>(`/social/follow/${userId}`);
        return response.data;
    },

    /**
     * Unfollow a user
     */
    unfollowUser: async (userId: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete<{ success: boolean }>(`/social/unfollow/${userId}`);
        return response.data;
    },

    /**
     * Get followers of a user
     */
    getFollowers: async (_userId: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const response = await apiClient.get<{
            success: boolean;
            followers: UserProfile[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(
            '/social/followers',
            { params }
        );
        return {
            users: response.data.followers,
            pagination: {
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.pages,
            },
        };
    },

    /**
     * Get users that a user is following
     */
    getFollowing: async (_userId: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const response = await apiClient.get<{
            success: boolean;
            following: UserProfile[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(
            '/social/following',
            { params }
        );
        return {
            users: response.data.following,
            pagination: {
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.pages,
            },
        };
    },

    /**
     * Search users by username or name
     */
    searchUsers: async (_query: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        // Backend search endpoint is not available yet.
        // Return an empty result to keep UI flows stable until backend support lands.
        return {
            users: [],
            pagination: {
                page: params?.page ?? 1,
                limit: params?.limit ?? 20,
                total: 0,
                totalPages: 0,
            },
        };
    },

    /**
     * Get user profile by ID
     */
    getUserProfile: async (_userId: string): Promise<UserProfile> => {
        // Backend currently exposes only /users/me for profile reads in this integration phase.
        const response = await apiClient.get<{ success: boolean; data: any }>('/users/me');
        const profile = response.data.data;
        return {
            id: String(profile.id),
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            avatarUrl: profile.avatarUrl,
            level: profile.level,
            xp: profile.xp,
            followersCount: 0,
            followingCount: 0,
            workoutsCount: 0,
        };
    },
};
