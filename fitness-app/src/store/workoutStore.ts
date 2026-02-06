import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { workoutApi } from '../api/workout.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  StartWorkoutInput, 
  LogSetInput, 
  WorkoutExercise, 
  WorkoutSet,
  Workout 
} from '../types/backend.types';

// State Interfaces
// ----------------------------------------------------------------------------

interface WorkoutState {
  // Session State (Persisted)
  activeWorkoutId: number | null;
  workoutName: string | null;
  startTime: string | null; // ISO Date String
  status: 'idle' | 'in_progress' | 'paused';
  
  // Normalized Data (Persisted)
  exercises: Record<number, WorkoutExercise>; // Key: exerciseId
  sets: Record<string, WorkoutSet>; // Key: Set ID (string for temp IDs)
  
  // UI State (Not Persisted ideally, but useful for crash recovery)
  isLoading: boolean;
  error: string | null;
  minimized: boolean; // Player floating mode
  elapsedSeconds: number;
}

interface WorkoutActions {
  // Core Actions
  startWorkout: (input: StartWorkoutInput) => Promise<void>;
  resumeWorkout: () => Promise<void>; // Hydrate from API if needed
  cancelWorkout: () => Promise<void>;
  completeWorkout: (input: any) => Promise<void>;
  
  // Set Actions (Optimistic)
  logSet: (exerciseId: number, input: LogSetInput) => Promise<void>;
  deleteSet: (exerciseId: number, setIds: string) => Promise<void>;
  
  // Timer Actions
  tick: () => void;
  minimize: (minimized: boolean) => void;
  resetError: () => void;
}

// Initial State
// ----------------------------------------------------------------------------
const initialState: Omit<WorkoutState, 'exercises'|'sets'> & { exercises: any, sets: any } = {
  activeWorkoutId: null,
  workoutName: null,
  startTime: null,
  status: 'idle',
  exercises: {},
  sets: {},
  isLoading: false,
  error: null,
  minimized: false,
  elapsedSeconds: 0,
};

// Store Implementation
// ----------------------------------------------------------------------------
export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ACTIONS
      // ----------------------------------------------------------------------

      startWorkout: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const response = await workoutApi.startWorkout(input);
          const workout = response.data as unknown as Workout; // Cast pending strict API return type
          
          set((state) => {
            state.isLoading = false;
            state.activeWorkoutId = workout.id;
            state.workoutName = workout.name;
            state.startTime = new Date().toISOString();
            state.status = 'in_progress';
            state.exercises = {}; 
            state.sets = {};
            state.elapsedSeconds = 0;

            // Normalize Exercises and Sets
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    // Store exercise mapping
                    // We strip sets from the exercise object in the store to avoid duplication confusion,
                    // or keep it but rely on state.sets as Source of Truth.
                    // For now, we keep it simple: strict normalization.
                    const { sets, ...rest } = ex;
                    state.exercises[ex.id] = { ...rest, sets: [] } as WorkoutExercise;

                    // Store sets
                    if (sets) {
                        sets.forEach(s => {
                            state.sets[s.id] = s;
                        });
                    }
                });
            }
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Failed to start workout' });
        }
      },

      resumeWorkout: async () => {
        const { activeWorkoutId } = get();
        if (!activeWorkoutId) return;

        set({ isLoading: true });
        try {
          const response = await workoutApi.getWorkoutById(activeWorkoutId);
          const workout = response.data as unknown as Workout;
          
          set((state) => {
            state.isLoading = false;
            // Sync state
            if (workout.status === 'in_progress') {
                state.status = 'in_progress';
                state.workoutName = workout.name;
                // Re-normalize to ensure sync
                state.exercises = {};
                state.sets = {};
                workout.exercises.forEach(ex => {
                    const { sets, ...rest } = ex;
                    state.exercises[ex.id] = { ...rest, sets: [] } as WorkoutExercise;
                    sets.forEach(s => {
                        state.sets[s.id] = s;
                    });
                });
            } else {
                // If backend says fulfilled, clear local
                // Reset state to initial logic needs to be careful not to break persistence middleware?
                // Actually we just reset the fields.
                state.activeWorkoutId = null;
                state.status = 'idle';
            }
          });
        } catch (error: any) {
             if (error.status === 404) {
                 set(initialState);
             } else {
                 set({ isLoading: false, error: 'Could not sync workout' });
             }
        }
      },

      logSet: async (exerciseId: number, input: LogSetInput) => {
        const { activeWorkoutId } = get();
        if (!activeWorkoutId) {
            set({ error: 'No active workout' });
            return;
        }

        // 1. Generate Temp ID
        const tempId = `temp_${Date.now()}`;
        
        // 2. Optimistic Update
        set((state) => {
            const newSet: WorkoutSet = {
                id: tempId,
                workoutExerciseId: exerciseId, 
                setType: input.setType || 'working',
                weight: input.weight,
                reps: input.reps,
                rpe: input.rpe,
                rir: input.rir,
            };
            
            state.sets[tempId] = newSet;
        });

        // 3. API Call
        try {
            const reponse = await workoutApi.logSet(activeWorkoutId, exerciseId, input);
            const realSet = reponse.data as unknown as WorkoutSet;

            // 4. Reconcile (Swap Temp -> Real)
            set((state) => {
                delete state.sets[tempId];
                state.sets[realSet.id] = realSet;
            });
        } catch (error: any) {
            // 5. Rollback on Failure
            set((state) => {
                delete state.sets[tempId];
                state.error = `Failed to log set: ${error.message}`;
            });
        }
      },

      deleteSet: async (exerciseId, setId) => {
         // Optimistic Delete
         const previousSet = get().sets[setId];
         if (!previousSet) return;

         set((state) => {
             delete state.sets[setId];
         });

         const { activeWorkoutId } = get();
         if (!activeWorkoutId) return;

         try {
             await workoutApi.deleteSet(activeWorkoutId, setId);
         } catch (error: any) {
             // Rollback
             set((state) => {
                 state.sets[setId] = previousSet;
                 state.error = 'Failed to delete set';
             });
         }
      },

      cancelWorkout: async () => {
        const { activeWorkoutId } = get();
        if (!activeWorkoutId) return;

        set({ isLoading: true });
        try {
            await workoutApi.cancelWorkout(activeWorkoutId);
            set(initialState); // Reset all
        } catch (error: any) {
            set({ isLoading: false, error: 'Failed to cancel' });
        }
      },

      completeWorkout: async (input) => {
          const { activeWorkoutId } = get();
          if (!activeWorkoutId) return;
          
          set({ isLoading: true });
          try {
              await workoutApi.completeWorkout(activeWorkoutId, input);
              set(initialState);
          } catch (error: any) {
              set({ isLoading: false, error: 'Failed to complete' });
          }
      },

      // TIMER & UI
      // ----------------------------------------------------------------------
      tick: () => {
        set((state) => {
            if (state.status === 'in_progress') {
                state.elapsedSeconds += 1;
            }
        });
      },
      
      minimize: (val) => set({ minimized: val }),
      
      resetError: () => set({ error: null }),

    })),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
          activeWorkoutId: state.activeWorkoutId,
          workoutName: state.workoutName,
          startTime: state.startTime,
          status: state.status,
          exercises: state.exercises,
          sets: state.sets,
          elapsedSeconds: state.elapsedSeconds
      }),
    }
  )
);

