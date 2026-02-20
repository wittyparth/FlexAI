import apiClient from './client';
import { 
  StartWorkoutInput, 
  AddExerciseToWorkoutInput, 
  LogSetInput, 
  UpdateSetInput, 
  CompleteWorkoutInput, 
  UpdateWorkoutInput,
  GetWorkoutsQuery
} from '../types/backend.types';

// Define response types wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const normalizeSet = (set: any) => ({
  ...set,
  id: String(set.id),
});

const normalizeWorkoutExercise = (exercise: any) => ({
  ...exercise,
  sets: Array.isArray(exercise?.sets) ? exercise.sets.map(normalizeSet) : [],
});

const normalizeWorkout = (workout: any) => ({
  ...workout,
  startTime: workout?.startTime ?? workout?.startedAt,
  endTime: workout?.endTime ?? workout?.completedAt,
  exercises: Array.isArray(workout?.exercises)
    ? workout.exercises.map(normalizeWorkoutExercise)
    : [],
});

export const workoutApi = {
  // Queries
  // --------------------------------------------------------------------------
  getWorkouts: async (params?: GetWorkoutsQuery) => {
    const response = await apiClient.get<ApiResponse<any>>('/workouts', { params });

    const payload = response.data.data;
    if (Array.isArray(payload?.workouts)) {
      return {
        ...response.data,
        data: {
          ...payload,
          workouts: payload.workouts.map(normalizeWorkout),
        },
      };
    }

    return response.data;
  },

  getWorkoutById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<any>>(`/workouts/${id}`);
    return {
      ...response.data,
      data: normalizeWorkout(response.data.data),
    };
  },

  getCurrentWorkout: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/workouts/current');
    return {
      ...response.data,
      data: response.data.data ? normalizeWorkout(response.data.data) : null,
    };
  },

  // Commands
  // --------------------------------------------------------------------------
  
  /**
   * Start a new workout session
   */
  startWorkout: async (data: StartWorkoutInput) => {
    const response = await apiClient.post<ApiResponse<any>>('/workouts', data);
    return {
      ...response.data,
      data: normalizeWorkout(response.data.data),
    };
  },

  /**
   * Update workout details (name, notes, etc)
   */
  updateWorkout: async (id: number, data: UpdateWorkoutInput) => {
    const response = await apiClient.patch<ApiResponse<any>>(`/workouts/${id}`, data);

    const payload = response.data.data;
    if (payload?.startedAt || payload?.startTime) {
      return {
        ...response.data,
        data: normalizeWorkout(payload),
      };
    }

    return response.data;
  },

  /**
   * Delete workout
   */
  deleteWorkout: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(`/workouts/${id}`);
    return response.data;
  },

  /**
   * Cancel a workout
   */
  cancelWorkout: async (id: number) => {
    const response = await apiClient.post<ApiResponse<any>>(`/workouts/${id}/cancel`);
    return {
      ...response.data,
      data: normalizeWorkout(response.data.data),
    };
  },

  /**
   * Complete a workout
   */
  completeWorkout: async (id: number, data: CompleteWorkoutInput) => {
    const response = await apiClient.post<ApiResponse<any>>(`/workouts/${id}/complete`, data);
    return {
      ...response.data,
      data: normalizeWorkout(response.data.data),
    };
  },

  /**
   * Add exercise to current workout
   */
  addExercise: async (workoutId: number, data: AddExerciseToWorkoutInput) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/workouts/${workoutId}/exercises`, 
      data
    );
    return {
      ...response.data,
      data: normalizeWorkoutExercise(response.data.data),
    };
  },

  /**
   * Remove exercise from workout
   */
  removeExercise: async (workoutId: number, exerciseId: number) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/workouts/${workoutId}/exercises/${exerciseId}`
    );
    return response.data;
  },

  /**
   * Log a set for an exercise
   */
  logSet: async (workoutId: number, exerciseId: number, data: LogSetInput) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/workouts/${workoutId}/exercises/${exerciseId}/sets`, 
      data
    );
    return {
      ...response.data,
      data: normalizeSet(response.data.data),
    };
  },

  /**
   * Update an existing set
   */
  updateSet: async (workoutId: number, setId: string, data: UpdateSetInput) => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/workouts/${workoutId}/sets/${setId}`, 
      data
    );
    return {
      ...response.data,
      data: normalizeSet(response.data.data),
    };
  },

  /**
   * Delete a set
   */
  deleteSet: async (workoutId: number, setId: string) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/workouts/${workoutId}/sets/${setId}`
    );
    return response.data;
  }
};
