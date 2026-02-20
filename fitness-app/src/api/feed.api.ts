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

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const feedApi = {
    /**
     * Get global public feed
     */
    getGlobalFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get<{ success: boolean; posts: FeedPost[]; nextCursor?: number }>('/feed', { params });
        return {
            posts: response.data.posts,
            nextCursor: response.data.nextCursor,
            hasMore: response.data.nextCursor !== undefined,
        };
    },

    /**
     * Get personalized feed (from followed users)
     */
    getMyFeed: async (params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        const response = await apiClient.get<{ success: boolean; posts: FeedPost[]; nextCursor?: number }>('/feed/following', { params });
        return {
            posts: response.data.posts,
            nextCursor: response.data.nextCursor,
            hasMore: response.data.nextCursor !== undefined,
        };
    },

    /**
     * Create a new post
     */
    createPost: async (data: CreatePostInput): Promise<FeedPost> => {
        const response = await apiClient.post<{ success: boolean; [key: string]: any }>('/feed/posts', data);
        const { success: _success, ...post } = response.data;
        return post as FeedPost;
    },

    /**
     * Toggle like on a post
     */
    toggleLike: async (postId: string): Promise<{ liked: boolean; likesCount?: number }> => {
        const response = await apiClient.post<{ success: boolean; liked: boolean; likesCount?: number }>(
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
        const response = await apiClient.post<{ success: boolean; [key: string]: any }>(
            `/feed/posts/${postId}/comments`,
            { content }
        );
        const { success: _success, ...comment } = response.data;
        return comment as FeedComment;
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
    getUserPosts: async (_userId: string, params?: { cursor?: number; limit?: number }): Promise<FeedResponse> => {
        // User-specific feed endpoint is not exposed by backend yet.
        return feedApi.getMyFeed(params);
    },
};
