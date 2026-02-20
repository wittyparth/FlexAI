import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

import { Exercise } from '../types/backend.types';
export type { Exercise };

export interface ExerciseFilterOptions {
    muscleGroups: string[];
    equipment: string[];
    exerciseTypes: string[];
    trainingGoals: string[];
}

export interface ExerciseSearchParams {
    page?: number;
    limit?: number;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    exerciseType?: 'strength' | 'cardio' | 'flexibility' | 'stretching';
    exerciseClass?: 'compound' | 'isolation';
    trainingGoal?: string;
    isFeatured?: boolean;
    search?: string;
    sortBy?: 'name' | 'difficulty' | 'popularity' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

interface ExerciseListResponse {
    exercises: Exercise[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const exerciseApi = {
    /**
     * Get available filter options (muscle groups, equipment, etc.)
     */
    getFilterOptions: async (): Promise<ExerciseFilterOptions> => {
        const response = await apiClient.get<{ success: boolean; data: ExerciseFilterOptions }>(
            '/exercises/filters'
        );
        return response.data.data;
    },

    /**
     * Get featured exercises
     */
    getFeaturedExercises: async (): Promise<Exercise[]> => {
        const response = await apiClient.get<{ success: boolean; data: Exercise[] }>(
            '/exercises/featured'
        );
        return response.data.data;
    },

    /**
     * Search exercises with filters
     */
    searchExercises: async (params?: ExerciseSearchParams): Promise<ExerciseListResponse> => {
        const response = await apiClient.get<{ success: boolean; data: ExerciseListResponse }>(
            '/exercises',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get exercise by ID
     */
    getExerciseById: async (id: number): Promise<Exercise> => {
        const response = await apiClient.get<{ success: boolean; data: Exercise }>(
            `/exercises/${id}`
        );
        return response.data.data;
    },

    /**
     * Get exercise by slug
     */
    getExerciseBySlug: async (slug: string): Promise<Exercise> => {
        const response = await apiClient.get<{ success: boolean; data: Exercise }>(
            `/exercises/slug/${slug}`
        );
        return response.data.data;
    },

    /**
     * Create a custom exercise
     */
    createCustomExercise: async (data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.post<{ success: boolean; data: Exercise }>(
            '/exercises/custom',
            data
        );
        return response.data.data;
    },

    /**
     * Update a custom exercise
     */
    updateCustomExercise: async (id: number, data: Partial<Exercise>): Promise<Exercise> => {
        const response = await apiClient.patch<{ success: boolean; data: Exercise }>(
            `/exercises/custom/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Delete a custom exercise
     */
    deleteCustomExercise: async (id: number): Promise<void> => {
        await apiClient.delete(`/exercises/custom/${id}`);
    },
};
