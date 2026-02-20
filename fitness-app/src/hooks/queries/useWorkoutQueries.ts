import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../../api/workout.api';
import { CreateWorkoutInput, UpdateWorkoutInput, LogExerciseInput } from '../../types/backend.types';

import { MOCK_WORKOUT_HISTORY } from '../../data/workoutMockData';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useWorkouts = (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['workouts', params],
        // MOCK IMPLEMENTATION
        queryFn: async () => {
             await delay(500);
             return { data: MOCK_WORKOUT_HISTORY, total: MOCK_WORKOUT_HISTORY.length };
        }
        // queryFn: () => workoutApi.getWorkouts(params),
    });
};

export const useWorkout = (id: number) => {
    return useQuery({
        queryKey: ['workout', id],
        // MOCK IMPLEMENTATION
        queryFn: async () => {
             await delay(300);
             const workout = MOCK_WORKOUT_HISTORY.find(w => w.id === Number(id));
             if (!workout) throw new Error('Workout not found');
             return { data: workout };
        },
        // queryFn: () => workoutApi.getWorkoutById(id),
        enabled: !!id,
    });
};

export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWorkoutInput) => workoutApi.createWorkout(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] }); // Stats might change
        },
    });
};

export const useUpdateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateWorkoutInput }) => workoutApi.updateWorkout(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['workout', id] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useDeleteWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => workoutApi.deleteWorkout(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });
};

export const useLogSet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workoutId, data }: { workoutId: number; data: LogExerciseInput }) => 
            workoutApi.logExercise(workoutId, data),
        onSuccess: (_, { workoutId }) => {
            queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
        },
    });
};
