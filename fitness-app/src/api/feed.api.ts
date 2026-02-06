import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface FeedPost {
    id: string; // Changed from number
    userId: string; // Changed from number
    user: {
        id: string; // Changed from number
        firstName: string;
        lastName: string;
        username?: string;
        avatarUrl?: string;
    };
    content: string;
    imageUrl?: string;
    workoutId?: string; // Changed from number
    workout?: {
        id: string; // Changed from number
        name: string;
        duration?: number;
        totalVolume?: number;
        exerciseCount?: number;
    };
    visibility: 'public' | 'followers' | 'private';
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FeedComment {
    id: string; // Changed from number
    postId: string; // Changed from number
    userId: string; // Changed from number
    user: {
        id: string; // Changed from number
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
    visibility?: 'public' | 'followers' | 'private';
}

interface FeedResponse {
    posts: FeedPost[];
    nextCursor?: number;
    hasMore: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const feedApi = {
    /**
     * Get global public feed
     */
    getGlobalFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get<{ success: boolean } & FeedResponse>('/feed/global', { params });
        return {
            posts: response.data.posts,
            nextCursor: response.data.nextCursor,
            hasMore: response.data.hasMore,
        };
    },

    /**
     * Get personalized feed (from followed users)
     */
    getMyFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get<{ success: boolean } & FeedResponse>('/feed', { params });
        return {
            posts: response.data.posts,
            nextCursor: response.data.nextCursor,
            hasMore: response.data.hasMore,
        };
    },

    /**
     * Create a new post
     */
    createPost: async (data: CreatePostInput): Promise<FeedPost> => {
        const response = await apiClient.post<{ success: boolean } & FeedPost>('/feed/posts', data);
        return response.data;
    },

    /**
     * Toggle like on a post
     */
    toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount: number }> => {
        const response = await apiClient.post<{ success: boolean; liked: boolean; likesCount: number }>(
            `/feed/posts/${postId}/like`
        );
        return { liked: response.data.liked, likesCount: response.data.likesCount };
    },

    /**
     * Get comments for a post
     */
    getComments: async (postId: string, params?: { page?: number }): Promise<FeedComment[]> => {
        const response = await apiClient.get<{ success: boolean; data: FeedComment[] }>(
            `/feed/posts/${postId}/comments`,
            { params }
        );
        return response.data.data;
    },

    /**
     * Add a comment to a post
     */
    addComment: async (postId: string, content: string): Promise<FeedComment> => {
        const response = await apiClient.post<{ success: boolean } & FeedComment>(
            `/feed/posts/${postId}/comments`,
            { content }
        );
        return response.data;
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
        const response = await apiClient.get<{ success: boolean } & FeedResponse>(`/feed/user/${userId}`, { params });
        return {
            posts: response.data.posts,
            nextCursor: response.data.nextCursor,
            hasMore: response.data.hasMore,
        };
    },
};
