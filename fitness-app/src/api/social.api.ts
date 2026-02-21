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

const normalizeFollowPagination = (pagination: any) => ({
    page: Number(pagination?.page ?? 1),
    limit: Number(pagination?.limit ?? 20),
    total: Number(pagination?.total ?? 0),
    totalPages: Number(pagination?.pages ?? pagination?.totalPages ?? 0),
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
            pagination: normalizeFollowPagination(response.data.pagination),
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
            pagination: normalizeFollowPagination(response.data.pagination),
        };
    },

    /**
     * Search users by username or name
     */
    searchUsers: async (query: string, params?: { page?: number; limit?: number }): Promise<FollowListResponse> => {
        const normalizedQuery = query.trim().toLowerCase();
        const page = Math.max(1, Number(params?.page ?? 1));
        const limit = Math.max(1, Number(params?.limit ?? 20));

        if (!normalizedQuery) {
            return {
                users: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }

        // Backend currently has no dedicated user-search endpoint.
        // Aggregate discoverable users from available APIs.
        const [meResult, followersResult, followingResult, leaderboardResult, globalFeedResult] = await Promise.allSettled([
            apiClient.get<{ success: boolean; data: any }>('/users/me'),
            apiClient.get<{ success: boolean; followers: any[]; pagination: any }>('/social/followers', { params: { page: 1, limit: 100 } }),
            apiClient.get<{ success: boolean; following: any[]; pagination: any }>('/social/following', { params: { page: 1, limit: 100 } }),
            apiClient.get<{ success: boolean; data: Array<{ user?: any }> }>('/leaderboards/rankings/weekly', { params: { limit: 100 } }),
            apiClient.get<{ success: boolean; posts: Array<{ user?: any }> }>('/feed', { params: { limit: 60 } }),
        ]);

        const mePayload = meResult.status === 'fulfilled' ? meResult.value.data?.data : undefined;
        const followersPayload = followersResult.status === 'fulfilled' ? followersResult.value.data?.followers ?? [] : [];
        const followingPayload = followingResult.status === 'fulfilled' ? followingResult.value.data?.following ?? [] : [];
        const leaderboardPayload = leaderboardResult.status === 'fulfilled' ? leaderboardResult.value.data?.data ?? [] : [];
        const globalFeedPayload = globalFeedResult.status === 'fulfilled' ? globalFeedResult.value.data?.posts ?? [] : [];

        const me = normalizeUserProfile(mePayload);
        const followingUsers = followingPayload.map((u) => ({ ...normalizeUserProfile(u), isFollowing: true }));
        const followersUsers = followersPayload.map((u) => normalizeUserProfile(u));
        const leaderboardUsers = leaderboardPayload
            .map((entry) => normalizeUserProfile(entry?.user ?? {}))
            .filter((user) => user.id);
        const feedUsers = globalFeedPayload
            .map((post) => normalizeUserProfile(post?.user ?? {}))
            .filter((user) => user.id);

        const followingSet = new Set(followingUsers.map((u) => u.id));
        const candidates = [me, ...followingUsers, ...followersUsers, ...leaderboardUsers, ...feedUsers];
        const byId = new Map<string, UserProfile>();

        candidates.forEach((candidate) => {
            if (!candidate.id) return;
            const previous = byId.get(candidate.id);
            const isFollowing = followingSet.has(candidate.id);
            byId.set(candidate.id, {
                ...(previous ?? candidate),
                ...candidate,
                isFollowing,
            });
        });

        const filtered = Array.from(byId.values()).filter((user) => {
            const haystack = `${user.username} ${user.firstName} ${user.lastName}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });

        const start = (page - 1) * limit;
        const end = start + limit;
        const paged = filtered.slice(start, end);
        const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / limit);

        return {
            users: paged,
            pagination: {
                page,
                limit,
                total: filtered.length,
                totalPages,
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
