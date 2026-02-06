import apiClient from './client';
import { 
    CreateRoutineInput, 
    UpdateRoutineInput, 
    AddExerciseToRoutineInput,
    Routine
} from '../types/backend.types';

// Wrapper type matching backend response structure
interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const routineApi = {
    // Queries
    // --------------------------------------------------------------------------
    
    /**
     * Get user's routines (My Plans)
     */
    getRoutines: async (params?: { page?: number; limit?: number; search?: string; isTemplate?: boolean }) => {
        const response = await apiClient.get<ApiResponse<{ routines: Routine[] }>>('/routines', { params });
        return response.data;
    },

    /**
     * Get a specific routine by ID
     */
    getRoutineById: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Routine>>(`/routines/${id}`);
        return response.data;
    },

    /**
     * Get public routines (Library/Discovery)
     */
    getPublicRoutines: async (params?: { page?: number; limit?: number; search?: string; goal?: string }) => {
        const response = await apiClient.get<ApiResponse<{ routines: Routine[] }>>('/routines/public', { params });
        return response.data;
    },

    // Commands
    // --------------------------------------------------------------------------

    /**
     * Create a new routine
     */
    createRoutine: async (data: CreateRoutineInput) => {
        const response = await apiClient.post<ApiResponse<Routine>>('/routines', data);
        return response.data;
    },

    /**
     * Update an existing routine
     */
    updateRoutine: async (id: number, data: UpdateRoutineInput) => {
        const response = await apiClient.patch<ApiResponse<Routine>>(`/routines/${id}`, data);
        return response.data;
    },

    /**
     * Delete a routine
     */
    deleteRoutine: async (id: number) => {
        const response = await apiClient.delete<ApiResponse<any>>(`/routines/${id}`);
        return response.data;
    },

    /**
     * Duplicate a routine (Save as my own)
     */
    duplicateRoutine: async (id: number, newName?: string) => {
        const response = await apiClient.post<ApiResponse<Routine>>(`/routines/${id}/duplicate`, { name: newName });
        return response.data;
    },

    /**
     * Add exercise to routine
     */
    addExercise: async (routineId: number, data: AddExerciseToRoutineInput) => {
        const response = await apiClient.post<ApiResponse<any>>(`/routines/${routineId}/exercises`, data);
        return response.data;
    },

    /**
     * Remove exercise from routine
     */
    removeExercise: async (routineId: number, exerciseId: number) => {
        const response = await apiClient.delete<ApiResponse<any>>(`/routines/${routineId}/exercises/${exerciseId}`);
        return response.data;
    }
};
