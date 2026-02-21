import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface FeedPost {
    id: string;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        username?: string;
        avatarUrl?: string;
    };
    content: string;
    imageUrl?: string;
    workoutId?: string;
    workout?: {
        id: string;
        name: string;
        duration?: number;
        totalVolume?: number;
        exerciseCount?: number;
    };
    visibility: 'public' | 'friends' | 'private';
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FeedComment {
    id: string;
    postId: string;
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        username?: string;
        avatarUrl?: string;
    };
    content: string;
    createdAt: string;
}

export interface CreatePostInput {
    content: string;
    imageUrl?: string;
    workoutId?: string;
    visibility?: 'public' | 'friends' | 'private';
}

interface FeedResponse {
    posts: FeedPost[];
    nextCursor?: number;
    hasMore: boolean;
}

const toId = (value: unknown): string => String(value ?? '');

const toNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toIsoString = (value: unknown): string => {
    if (typeof value === 'string' && value.length > 0) return value;
    if (value instanceof Date) return value.toISOString();
    return new Date().toISOString();
};

const buildUsername = (rawUser: any): string => {
    if (rawUser?.username && typeof rawUser.username === 'string') return rawUser.username;
    const fromName = `${rawUser?.firstName ?? ''}${rawUser?.lastName ?? ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    if (fromName.length >= 3) return fromName;
    return `user${toId(rawUser?.id)}`;
};

const normalizeUser = (rawUser: any) => ({
    id: toId(rawUser?.id),
    firstName: rawUser?.firstName ?? 'User',
    lastName: rawUser?.lastName ?? '',
    username: buildUsername(rawUser),
    avatarUrl: rawUser?.avatarUrl,
});

const normalizeWorkout = (rawWorkout: any) => {
    if (!rawWorkout) return undefined;
    return {
        id: toId(rawWorkout.id),
        name: rawWorkout.name ?? 'Workout',
        duration: rawWorkout.duration != null ? toNumber(rawWorkout.duration) : undefined,
        totalVolume: rawWorkout.totalVolume != null ? toNumber(rawWorkout.totalVolume) : undefined,
        exerciseCount: Array.isArray(rawWorkout.exercises)
            ? rawWorkout.exercises.length
            : rawWorkout.exerciseCount != null
                ? toNumber(rawWorkout.exerciseCount)
                : undefined,
    };
};

const normalizePost = (rawPost: any): FeedPost => ({
    id: toId(rawPost?.id),
    userId: toId(rawPost?.userId ?? rawPost?.user?.id),
    user: normalizeUser(rawPost?.user),
    content: rawPost?.content ?? '',
    imageUrl: rawPost?.imageUrl ?? undefined,
    workoutId: rawPost?.workoutId != null ? toId(rawPost.workoutId) : undefined,
    workout: normalizeWorkout(rawPost?.workout),
    visibility: rawPost?.visibility ?? 'public',
    likesCount: toNumber(rawPost?.likesCount ?? rawPost?._count?.likes),
    commentsCount: toNumber(rawPost?.commentsCount ?? rawPost?._count?.comments),
    isLiked: typeof rawPost?.isLiked === 'boolean' ? rawPost.isLiked : undefined,
    createdAt: toIsoString(rawPost?.createdAt),
    updatedAt: toIsoString(rawPost?.updatedAt),
});

const normalizeComment = (rawComment: any): FeedComment => ({
    id: toId(rawComment?.id),
    postId: toId(rawComment?.postId),
    userId: toId(rawComment?.userId ?? rawComment?.user?.id),
    user: normalizeUser(rawComment?.user),
    content: rawComment?.content ?? '',
    createdAt: toIsoString(rawComment?.createdAt),
});

const extractEnvelope = <T>(payload: any): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) return payload.data as T;
    return payload as T;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const feedApi = {
    /**
     * Get global public feed
     */
    getGlobalFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get('/feed', { params });
        const payload = extractEnvelope<{ posts?: any[]; nextCursor?: number }>(response.data);
        const posts = Array.isArray(payload?.posts) ? payload.posts.map(normalizePost) : [];

        return {
            posts,
            nextCursor: payload?.nextCursor,
            hasMore: payload?.nextCursor !== undefined,
        };
    },

    /**
     * Get personalized feed (from followed users)
     */
    getMyFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get('/feed/following', { params });
        const payload = extractEnvelope<{ posts?: any[]; nextCursor?: number }>(response.data);
        const posts = Array.isArray(payload?.posts) ? payload.posts.map(normalizePost) : [];

        return {
            posts,
            nextCursor: payload?.nextCursor,
            hasMore: payload?.nextCursor !== undefined,
        };
    },

    /**
     * Create a new post
     */
    createPost: async (data: CreatePostInput): Promise<FeedPost> => {
        const response = await apiClient.post('/feed/posts', data);
        const payload = extractEnvelope<any>(response.data);

        if (payload && typeof payload === 'object' && 'id' in payload) {
            return normalizePost(payload);
        }

        const { success: _success, data: _ignored, ...post } = response.data ?? {};
        return normalizePost(post);
    },

    /**
     * Toggle like on a post
     */
    toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount?: number }> => {
        const response = await apiClient.post<{ success?: boolean; liked?: boolean; likesCount?: number; data?: any }>(
            `/feed/posts/${postId}/like`
        );
        const payload = extractEnvelope<any>(response.data);
        return {
            liked: Boolean(payload?.liked ?? response.data?.liked),
            likesCount: payload?.likesCount != null ? toNumber(payload.likesCount) : undefined,
        };
    },

    /**
     * Get comments for a post
     */
    getComments: async (postId: string, params?: { page?: number }): Promise<FeedComment[]> => {
        const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
            `/feed/posts/${postId}/comments`,
            { params }
        );
        const payload = extractEnvelope<any[]>(response.data);
        const comments = Array.isArray(payload)
            ? payload
            : Array.isArray(response.data?.data)
                ? response.data.data
                : [];
        return comments.map(normalizeComment);
    },

    /**
     * Add a comment to a post
     */
    addComment: async (postId: string, content: string): Promise<FeedComment> => {
        const response = await apiClient.post(
            `/feed/posts/${postId}/comments`,
            { content }
        );
        const payload = extractEnvelope<any>(response.data);
        if (payload && typeof payload === 'object' && 'id' in payload) {
            return normalizeComment(payload);
        }

        const { success: _success, data: _ignored, ...comment } = response.data ?? {};
        return normalizeComment(comment);
    },

    /**
     * Delete a comment
     */
    deleteComment: async (commentId: string): Promise<void> => {
        await apiClient.delete(`/feed/comments/${commentId}`);
    },

    /**
     * Get user posts
     */
    getUserPosts: async (userId: string, params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        // Backend does not expose /feed/users/:id yet.
        // Fallback to both accessible feeds and filter client-side.
        const [myFeed, globalFeed] = await Promise.all([
            feedApi.getMyFeed(params),
            feedApi.getGlobalFeed(params),
        ]);

        const dedupedById = new Map<string, FeedPost>();
        [...myFeed.posts, ...globalFeed.posts]
            .filter((post) => post.userId === String(userId))
            .forEach((post) => dedupedById.set(post.id, post));

        const posts = Array.from(dedupedById.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
            posts,
            nextCursor: myFeed.nextCursor ?? globalFeed.nextCursor,
            hasMore: myFeed.hasMore || globalFeed.hasMore,
        };
    },
};
