import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi, UserProfile } from '../../api/social.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const socialKeys = {
    all: ['social'] as const,
    followers: (userId: string) => [...socialKeys.all, 'followers', userId] as const,
    following: (userId: string) => [...socialKeys.all, 'following', userId] as const,
    search: (query: string) => [...socialKeys.all, 'search', query] as const,
    profile: (userId: string) => [...socialKeys.all, 'profile', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch followers of a user
 */
export const useFollowers = (userId: string, params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: socialKeys.followers(userId),
        queryFn: () => socialApi.getFollowers(userId, params),
        enabled: !!userId,
    });
};

/**
 * Hook to fetch users that a user is following
 */
export const useFollowing = (userId: string, params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: socialKeys.following(userId),
        queryFn: () => socialApi.getFollowing(userId, params),
        enabled: !!userId,
    });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (query: string, enabled = true) => {
    return useQuery({
        queryKey: socialKeys.search(query),
        queryFn: () => socialApi.searchUsers(query),
        enabled: enabled && query.length >= 2,
    });
};

/**
 * Hook to fetch user profile
 */
export const useUserProfile = (userId: string) => {
    return useQuery({
        queryKey: socialKeys.profile(userId),
        queryFn: () => socialApi.getUserProfile(userId),
        enabled: !!userId,
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to follow a user
 */
export const useFollowUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => socialApi.followUser(userId),
        onSuccess: (_, userId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: socialKeys.followers(userId) });
            queryClient.invalidateQueries({ queryKey: socialKeys.all });
        },
    });
};

/**
 * Hook to unfollow a user
 */
export const useUnfollowUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => socialApi.unfollowUser(userId),
        onSuccess: (_, userId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: socialKeys.followers(userId) });
            queryClient.invalidateQueries({ queryKey: socialKeys.all });
        },
    });
};
