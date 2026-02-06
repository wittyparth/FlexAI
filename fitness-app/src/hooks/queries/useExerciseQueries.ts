import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseApi, ExerciseSearchParams, Exercise } from '../../api/exercise.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const exerciseKeys = {
    all: ['exercises'] as const,
    list: (params?: ExerciseSearchParams) => [...exerciseKeys.all, 'list', params] as const,
    detail: (id: number) => [...exerciseKeys.all, 'detail', id] as const,
    slug: (slug: string) => [...exerciseKeys.all, 'slug', slug] as const,
    filters: () => [...exerciseKeys.all, 'filters'] as const,
    featured: () => [...exerciseKeys.all, 'featured'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch filter options (muscle groups, equipment, etc.)
 */
export const useExerciseFilters = () => {
    return useQuery({
        queryKey: exerciseKeys.filters(),
        queryFn: () => exerciseApi.getFilterOptions(),
        staleTime: 1000 * 60 * 60, // 1 hour - filter options rarely change
    });
};

/**
 * Hook to fetch featured exercises
 */
export const useFeaturedExercises = () => {
    return useQuery({
        queryKey: exerciseKeys.featured(),
        queryFn: () => exerciseApi.getFeaturedExercises(),
    });
};

/**
 * Hook to search exercises with filters
 */
export const useExerciseSearch = (params?: ExerciseSearchParams, enabled = true) => {
    return useQuery({
        queryKey: exerciseKeys.list(params),
        queryFn: () => exerciseApi.searchExercises(params),
        enabled,
    });
};

/**
 * Hook to fetch a single exercise by ID
 */
export const useExerciseDetail = (id: number) => {
    return useQuery({
        queryKey: exerciseKeys.detail(id),
        queryFn: () => exerciseApi.getExerciseById(id),
        enabled: !!id,
    });
};

/**
 * Hook to fetch a single exercise by slug
 */
export const useExerciseBySlug = (slug: string) => {
    return useQuery({
        queryKey: exerciseKeys.slug(slug),
        queryFn: () => exerciseApi.getExerciseBySlug(slug),
        enabled: !!slug,
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to create a custom exercise
 */
export const useCreateCustomExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<Exercise>) => exerciseApi.createCustomExercise(data),
        onSuccess: () => {
            // Invalidate exercise lists to include new custom exercise
            queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
        },
    });
};

/**
 * Hook to update a custom exercise
 */
export const useUpdateCustomExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Exercise> }) =>
            exerciseApi.updateCustomExercise(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
        },
    });
};

/**
 * Hook to delete a custom exercise
 */
export const useDeleteCustomExercise = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => exerciseApi.deleteCustomExercise(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
        },
    });
};
