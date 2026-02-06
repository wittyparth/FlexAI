import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { feedApi, FeedPost, CreatePostInput, FeedComment } from '../../api/feed.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

// ============================================================================
// QUERY KEYS
// ============================================================================

export const feedKeys = {
    all: ['feed'] as const,
    global: () => [...feedKeys.all, 'global'] as const,
    myFeed: () => [...feedKeys.all, 'myFeed'] as const,
    comments: (postId: string) => [...feedKeys.all, 'comments', postId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch global feed with infinite scroll
 */
export const useGlobalFeed = () => {
    return useInfiniteQuery({
        queryKey: feedKeys.global(),
        queryFn: ({ pageParam }) => feedApi.getGlobalFeed({ cursor: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        initialPageParam: undefined as number | undefined,
    });
};

/**
 * Hook to fetch personalized feed with infinite scroll
 */
export const useMyFeed = () => {
    return useInfiniteQuery({
        queryKey: feedKeys.myFeed(),
        queryFn: ({ pageParam }) => feedApi.getMyFeed({ cursor: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        initialPageParam: undefined as number | undefined,
    });
};

/**
 * Hook to fetch user posts
 */
export const useUserPosts = (userId: string) => {
    return useInfiniteQuery({
        queryKey: [...feedKeys.all, 'user', userId],
        queryFn: ({ pageParam }) => feedApi.getUserPosts(userId, { cursor: pageParam, limit: 10 }),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
        initialPageParam: undefined as number | undefined,
        enabled: !!userId,
    });
};

/**
 * Hook to fetch comments for a post
 */
export const useComments = (postId: string) => {
    return useQuery({
        queryKey: feedKeys.comments(postId),
        queryFn: () => feedApi.getComments(postId),
        enabled: !!postId,
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostInput) => feedApi.createPost(data),
        onSuccess: () => {
            // Invalidate feeds to refetch
            queryClient.invalidateQueries({ queryKey: feedKeys.global() });
            queryClient.invalidateQueries({ queryKey: feedKeys.myFeed() });
        },
    });
};

/**
 * Hook to toggle like on a post
 */
export const useToggleLike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => feedApi.toggleLike(postId),
        onMutate: async (postId) => {
            // Optimistic update - could be implemented here
            // For now, we'll just let the mutation complete and refetch
        },
        onSuccess: () => {
            // Invalidate feeds to show updated like counts
            queryClient.invalidateQueries({ queryKey: feedKeys.global() });
            queryClient.invalidateQueries({ queryKey: feedKeys.myFeed() });
        },
    });
};

/**
 * Hook to add a comment to a post
 */
export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content }: { postId: string; content: string }) =>
            feedApi.addComment(postId, content),
        onSuccess: (_, { postId }) => {
            // Invalidate comments for this post
            queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
        },
    });
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
            feedApi.deleteComment(commentId),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
        },
    });
};
