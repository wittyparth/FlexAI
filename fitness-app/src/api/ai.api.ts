import apiClient from './client';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerateWorkoutInput {
    goal: string;
    duration: number; // minutes
    equipment: string[];
    experienceLevel: string;
    injuries?: string;
    preferences?: string;
}

export interface GeneratedExercise {
    exerciseId: string;
    exercise: {
        id: string;
        name: string;
        targetMuscle: string;
        equipment: string;
        gifUrl?: string; // For icon/preview
    };
    sets: number;
    reps: string; // e.g., "10-12" or "60s"
    rest: number; // seconds
    notes?: string;
}

export interface GeneratedWorkout {
    workoutName: string;
    description: string;
    warmup: GeneratedExercise[];
    main: GeneratedExercise[];
    cooldown: GeneratedExercise[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const aiApi = {
    /**
     * Generate a workout using AI
     */
    generateWorkout: async (input: GenerateWorkoutInput): Promise<GeneratedWorkout> => {
        const response = await apiClient.post<{ success: boolean; data: GeneratedWorkout }>(
            '/routines/generate',
            input
        );
        return response.data.data;
    },
};
