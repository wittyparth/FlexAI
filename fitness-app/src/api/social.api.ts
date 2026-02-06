import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
    id: string; // Changed from number to string
    firstName: string;
    lastName: string;
    username?: string;
    avatarUrl?: string;
    bio?: string;
    level?: number;
    xp?: number;
    followersCount: number;
    followingCount: number;
    workoutsCount: number;
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
        const response = await apiClient.delete<{ success: boolean }>(`/social/follow/${userId}`);
        return response.data;
    },

    /**
     * Get followers of a user
     */
    getFollowers: async (userId: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const response = await apiClient.get<{ success: boolean; data: FollowListResponse }>(
            `/social/${userId}/followers`,
            { params }
        );
        return response.data.data;
    },

    /**
     * Get users that a user is following
     */
    getFollowing: async (userId: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const response = await apiClient.get<{ success: boolean; data: FollowListResponse }>(
            `/social/${userId}/following`,
            { params }
        );
        return response.data.data;
    },

    /**
     * Search users by username or name
     */
    searchUsers: async (query: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const response = await apiClient.get<{ success: boolean; data: FollowListResponse }>(
            '/social/search',
            { params: { query, ...params } }
        );
        return response.data.data;
    },

    /**
     * Get user profile by ID
     */
    getUserProfile: async (userId: string): Promise<UserProfile> => {
        const response = await apiClient.get<{ success: boolean; data: UserProfile }>(`/social/profile/${userId}`);
        return response.data.data;
    },
};
