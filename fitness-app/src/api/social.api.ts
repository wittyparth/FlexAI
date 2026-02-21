import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
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

const buildUsername = (user: Partial<UserProfile> & { id?: string | number; firstName?: string; lastName?: string }) => {
    const fromName = `${user.firstName ?? ''}${user.lastName ?? ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    if (fromName.length >= 3) return fromName;
    return `user${String(user.id ?? '')}`;
};

const normalizeUserProfile = (raw: any): UserProfile => ({
    id: String(raw?.id ?? ''),
    firstName: raw?.firstName || 'User',
    lastName: raw?.lastName || '',
    username: raw?.username || buildUsername(raw),
    avatarUrl: raw?.avatarUrl,
    bio: raw?.bio,
    level: raw?.level ? Number(raw.level) : 1,
    xp: raw?.xp ? Number(raw.xp) : 0,
    followersCount: raw?.followersCount ? Number(raw.followersCount) : 0,
    followingCount: raw?.followingCount ? Number(raw.followingCount) : 0,
    workoutsCount: raw?.workoutsCount ? Number(raw.workoutsCount) : 0,
    isFollowing: typeof raw?.isFollowing === 'boolean' ? raw.isFollowing : undefined,
});

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
            followers: any[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(
            '/social/followers',
            { params }
        );

        const users = await Promise.all(
            response.data.followers.map(async (user) => {
                const normalized = normalizeUserProfile(user);
                const status = await socialApi.getFollowStatus(normalized.id).catch(() => ({ isFollowing: false }));
                return { ...normalized, isFollowing: status.isFollowing };
            })
        );

        return {
            users,
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
            following: any[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(
            '/social/following',
            { params }
        );
        return {
            users: response.data.following.map((user) => ({ ...normalizeUserProfile(user), isFollowing: true })),
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
     * Get if current user follows target user
     */
    getFollowStatus: async (userId: string): Promise<{ isFollowing: boolean }> => {
        const response = await apiClient.get<{ success: boolean; isFollowing: boolean }>(`/social/follow-status/${userId}`);
        return { isFollowing: Boolean(response.data.isFollowing) };
    },

    /**
     * Get user profile by ID
     */
    getUserProfile: async (userId: string): Promise<UserProfile> => {
        const requestedUserId = String(userId);

        const response = await apiClient.get<{ success: boolean; data: any }>('/users/me');
        const me = normalizeUserProfile(response.data.data);

        if (me.id === requestedUserId) return me;

        const [followersResponse, followingResponse] = await Promise.all([
            socialApi.getFollowers(me.id, { page: 1, limit: 100 }),
            socialApi.getFollowing(me.id, { page: 1, limit: 100 }),
        ]);

        const discovered =
            followersResponse.users.find((user) => user.id === requestedUserId) ??
            followingResponse.users.find((user) => user.id === requestedUserId);

        if (!discovered) {
            const status = await socialApi.getFollowStatus(requestedUserId).catch(() => ({ isFollowing: false }));
            return {
                id: requestedUserId,
                firstName: 'User',
                lastName: '',
                username: `user${requestedUserId}`,
                isFollowing: status.isFollowing,
                level: 1,
                xp: 0,
                followersCount: 0,
                followingCount: 0,
                workoutsCount: 0,
            };
        }

        const status = await socialApi.getFollowStatus(requestedUserId).catch(() => ({ isFollowing: false }));
        return { ...discovered, isFollowing: status.isFollowing };
    },
};
