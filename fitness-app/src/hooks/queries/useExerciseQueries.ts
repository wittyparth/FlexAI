import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseApi, ExerciseSearchParams, Exercise } from '../../api/exercise.api';
import { MOCK_EXERCISES } from '../../data/mockExercises';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        queryFn: async () => {
            await delay(300);
            return {
                muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'],
                equipment: ['None', 'Barbell', 'Dumbbells', 'Kettlebell', 'Machine', 'Cable', 'Band'],
                exerciseTypes: ['strength', 'cardio', 'flexibility', 'stretching'],
                trainingGoals: ['Hypertrophy', 'Strength', 'Endurance', 'Flexibility']
            };
        },
        staleTime: 1000 * 60 * 60, // 1 hour - filter options rarely change
    });
};

/**
 * Hook to fetch featured exercises
 */
export const useFeaturedExercises = () => {
    return useQuery({
        queryKey: exerciseKeys.featured(),
        queryFn: async () => {
            await delay(400);
            return MOCK_EXERCISES.filter(ex => ex.isFeatured);
        },
    });
};

/**
 * Hook to search exercises with filters
 */
export const useExerciseSearch = (params?: ExerciseSearchParams, enabled = true) => {
    return useQuery({
        queryKey: exerciseKeys.list(params),
        queryFn: async () => {
            await delay(500);
            let filtered = [...MOCK_EXERCISES];

            if (params?.search) {
                const searchLower = params.search.toLowerCase();
                filtered = filtered.filter(ex => ex.name.toLowerCase().includes(searchLower));
            }
            if (params?.muscleGroup) {
                filtered = filtered.filter(ex => ex.muscleGroup === params.muscleGroup);
            }
            if (params?.equipment) {
                filtered = filtered.filter(ex => ex.equipment === params.equipment || ex.equipmentList?.includes(params.equipment!));
            }
            if (params?.difficulty) {
                filtered = filtered.filter(ex => ex.difficulty === params.difficulty);
            }
            if (params?.exerciseType) {
                filtered = filtered.filter(ex => ex.exerciseType === params.exerciseType);
            }
            if (params?.exerciseClass) {
                filtered = filtered.filter(ex => ex.exerciseClass === params.exerciseClass);
            }
            
            // Basic pagination
            const page = params?.page || 1;
            const limit = params?.limit || 20;
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);

            return {
                exercises: paginated,
                pagination: {
                    page,
                    limit,
                    total: filtered.length,
                    totalPages: Math.ceil(filtered.length / limit)
                }
            };
        },
        enabled,
    });
};

/**
 * Hook to fetch a single exercise by ID
 */
export const useExerciseDetail = (id: number) => {
    return useQuery({
        queryKey: exerciseKeys.detail(id),
        queryFn: async () => {
            await delay(300);
            const ex = MOCK_EXERCISES.find(e => e.id === id);
            if (!ex) throw new Error('Exercise not found');
            return ex;
        },
        enabled: !!id,
    });
};

/**
 * Hook to fetch a single exercise by slug
 */
export const useExerciseBySlug = (slug: string) => {
    return useQuery({
        queryKey: exerciseKeys.slug(slug),
        queryFn: async () => {
            await delay(300);
            const ex = MOCK_EXERCISES.find(e => e.slug === slug);
            if (!ex) throw new Error('Exercise not found');
            return ex;
        },
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
