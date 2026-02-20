import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineApi } from '../../api/routine.api';
import { CreateRoutineInput, UpdateRoutineInput, AddExerciseToRoutineInput } from '../../types/backend.types';

export const useRoutines = (params?: { page?: number; limit?: number; search?: string; isTemplate?: boolean }) => {
    return useQuery({
        queryKey: ['routines', params],
        queryFn: () => routineApi.getRoutines(params),
    });
};

export const useRoutine = (id: number) => {
    return useQuery({
        queryKey: ['routine', id],
        queryFn: () => routineApi.getRoutineById(id),
        enabled: !!id,
    });
};

export const usePublicRoutines = (params?: { page?: number; limit?: number; search?: string; goal?: string }) => {
    return useQuery({
        queryKey: ['publicRoutines', params],
        queryFn: () => routineApi.getPublicRoutines(params),
    });
};

export const useCreateRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateRoutineInput) => routineApi.createRoutine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
        },
    });
};

export const useUpdateRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRoutineInput }) => routineApi.updateRoutine(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            queryClient.invalidateQueries({ queryKey: ['routine', id] });
        },
    });
};

export const useDeleteRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => routineApi.deleteRoutine(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
        },
    });
};

export const useDuplicateRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: number; name?: string }) => routineApi.duplicateRoutine(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
        },
    });
};

export const useAddExerciseToRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ routineId, data }: { routineId: number; data: AddExerciseToRoutineInput }) => 
            routineApi.addExercise(routineId, data),
        onSuccess: (_, { routineId }) => {
            queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
        },
    });
};

export const useRemoveExerciseFromRoutine = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ routineId, exerciseId }: { routineId: number; exerciseId: number }) => 
            routineApi.removeExercise(routineId, exerciseId),
        onSuccess: (_, { routineId }) => {
            queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
        },
    });
};
