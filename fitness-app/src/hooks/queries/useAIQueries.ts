import { useMutation } from '@tanstack/react-query';
import { aiApi, GenerateWorkoutInput, GeneratedWorkout } from '../../api/ai.api';

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to generate a workout using AI
 * This is a mutation because it creates new data and isn't idempotent
 */
export const useGenerateWorkout = () => {
    return useMutation({
        mutationFn: (input: GenerateWorkoutInput) => aiApi.generateWorkout(input),
        // No cache invalidation needed - generated workouts are one-time results
    });
};

// Re-export types for convenience
export type { GenerateWorkoutInput, GeneratedWorkout } from '../../api/ai.api';
