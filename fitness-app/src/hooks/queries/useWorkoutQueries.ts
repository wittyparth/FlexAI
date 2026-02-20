import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../../api/workout.api';
import {
    GetWorkoutsQuery,
    LogSetInput,
    StartWorkoutInput,
    UpdateWorkoutInput,
} from '../../types/backend.types';

export const useWorkouts = (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['workouts', params],
        queryFn: async () => {
            const response = await workoutApi.getWorkouts(params as GetWorkoutsQuery);
            return {
                data: response.data?.workouts ?? [],
                pagination: response.data?.pagination,
            };
        },
    });
};

export const useWorkout = (id: number) => {
    return useQuery({
        queryKey: ['workout', id],
        queryFn: async () => {
            const response = await workoutApi.getWorkoutById(id);
            return { data: response.data };
        },
        enabled: !!id,
    });
};

export const useCreateWorkout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StartWorkoutInput) => workoutApi.startWorkout(data),
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
        mutationFn: ({ workoutId, exerciseId, data }: { workoutId: number; exerciseId: number; data: LogSetInput }) => 
            workoutApi.logSet(workoutId, exerciseId, data),
        onSuccess: (_, { workoutId }) => {
            queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
        },
    });
};
