import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { workoutApi } from '../api/workout.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  StartWorkoutInput, 
  LogSetInput, 
  UpdateSetInput,
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
  currentExerciseId: number | null; // Track active exercise for crash recovery
  
  // Normalized Data (Persisted)
  exercises: Record<number, WorkoutExercise>; // Key: exerciseId
  sets: Record<string, WorkoutSet>; // Key: Set ID (string for temp IDs)
  
  // Rest Timer (Global so floating pill can show it)
  isResting: boolean;
  restEndTime: string | null; // ISO Date String when rest finishes
  restDurationSeconds: number; // Original duration for display
  
  // User Preferences (Persisted)
  autoStartTimer: boolean;
  defaultTimerSeconds: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  minimized: boolean; // Player floating mode
  elapsedSeconds: number;
}

interface WorkoutActions {
  // Core Actions
  startWorkout: (input: StartWorkoutInput) => Promise<void>;
  syncCurrentWorkout: () => Promise<void>;
  resumeWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  completeWorkout: (input: any) => Promise<void>;
  addExercise: (exerciseId: number, notes?: string) => Promise<void>;
  removeExercise: (workoutExerciseId: number) => Promise<void>;
  
  // Set Actions (Optimistic)
  logSet: (exerciseId: number, input: LogSetInput) => Promise<void>;
  updateSet: (setId: string, input: UpdateSetInput) => Promise<void>;
  deleteSet: (exerciseId: number, setIds: string) => Promise<void>;
  
  // Exercise & Rest
  setCurrentExercise: (id: number) => void;
  startRest: (durationSeconds: number) => void;
  stopRest: () => void;
  
  // Timer & UI
  tick: () => void;
  minimize: (minimized: boolean) => void;
  updateTimerSettings: (autoStart: boolean, defaultDuration: number) => void;
  resetError: () => void;
}

// Initial State
// ----------------------------------------------------------------------------
const initialState: Omit<WorkoutState, 'exercises'|'sets'> & { exercises: any, sets: any } = {
  activeWorkoutId: null,
  workoutName: null,
  startTime: null,
  status: 'idle',
  currentExerciseId: null,
  exercises: {},
  sets: {},
  isResting: false,
  restEndTime: null,
  restDurationSeconds: 0,
  autoStartTimer: true,
  defaultTimerSeconds: 90,
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
            state.startTime = workout.startTime || new Date().toISOString();
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
          const message = error.message || 'Failed to start workout';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      syncCurrentWorkout: async () => {
        const { activeWorkoutId, status } = get();
        if (activeWorkoutId && status === 'in_progress') {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await workoutApi.getCurrentWorkout();
          const currentWorkout = response.data as unknown as Workout | null;

          if (!currentWorkout) {
            set((state) => {
              state.isLoading = false;
            });
            return;
          }

          set((state) => {
            state.isLoading = false;
            state.activeWorkoutId = currentWorkout.id;
            state.workoutName = currentWorkout.name;
            state.startTime = currentWorkout.startTime || new Date().toISOString();
            state.status = currentWorkout.status === 'in_progress' ? 'in_progress' : 'idle';
            state.exercises = {};
            state.sets = {};

            if (Array.isArray(currentWorkout.exercises)) {
              currentWorkout.exercises.forEach((ex) => {
                const { sets, ...rest } = ex;
                state.exercises[ex.id] = { ...rest, sets: [] } as WorkoutExercise;

                if (Array.isArray(sets)) {
                  sets.forEach((setItem) => {
                    state.sets[setItem.id] = setItem;
                  });
                }
              });
            }
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Failed to sync current workout' });
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

      addExercise: async (exerciseId, notes) => {
        const { activeWorkoutId, status } = get();
        if (!activeWorkoutId || status !== 'in_progress') {
          const message = 'No active workout in progress';
          set({ error: message });
          throw new Error(message);
        }

        set({ isLoading: true, error: null });
        try {
          const response = await workoutApi.addExercise(activeWorkoutId, { exerciseId, notes });
          const workoutExercise = response.data as unknown as WorkoutExercise;

          set((state) => {
            state.isLoading = false;
            state.exercises[workoutExercise.id] = {
              ...workoutExercise,
              sets: Array.isArray(workoutExercise.sets) ? workoutExercise.sets : [],
            };

            if (Array.isArray(workoutExercise.sets)) {
              workoutExercise.sets.forEach((setItem) => {
                state.sets[setItem.id] = setItem;
              });
            }
          });
        } catch (error: any) {
          const message = error.message || 'Failed to add exercise';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      removeExercise: async (workoutExerciseId) => {
        const { activeWorkoutId, status, exercises } = get();
        if (!activeWorkoutId || status !== 'in_progress') {
          const message = 'No active workout in progress';
          set({ error: message });
          throw new Error(message);
        }
        if (!exercises[workoutExerciseId]) {
          const message = 'Exercise not found in workout';
          set({ error: message });
          throw new Error(message);
        }

        const previousExercise = exercises[workoutExerciseId];
        const previousSets = Object.entries(get().sets).filter(
          ([, setItem]) => setItem.workoutExerciseId === workoutExerciseId
        );

        // Optimistic remove
        set((state) => {
          delete state.exercises[workoutExerciseId];
          previousSets.forEach(([setId]) => {
            delete state.sets[setId];
          });
        });

        try {
          await workoutApi.removeExercise(activeWorkoutId, workoutExerciseId);
        } catch (error: any) {
          const message = error.message || 'Failed to remove exercise';

          // Rollback on failure
          set((state) => {
            state.error = message;
            state.exercises[workoutExerciseId] = previousExercise;
            previousSets.forEach(([setId, setItem]) => {
              state.sets[setId] = setItem;
            });
          });
          throw new Error(message);
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

      updateSet: async (setId, input) => {
        const { activeWorkoutId, sets } = get();
        if (!activeWorkoutId) {
          const message = 'No active workout';
          set({ error: message });
          throw new Error(message);
        }

        const existingSet = sets[setId];
        if (!existingSet) {
          const message = 'Set not found';
          set({ error: message });
          throw new Error(message);
        }

        if (setId.startsWith('temp_')) {
          const message = 'Set is still syncing. Please try again in a moment.';
          set({ error: message });
          throw new Error(message);
        }

        const previousSet = { ...existingSet };

        // Optimistic update
        set((state) => {
          state.sets[setId] = {
            ...state.sets[setId],
            ...input,
          };
        });

        try {
          const response = await workoutApi.updateSet(activeWorkoutId, setId, input);
          const updatedSet = response.data as unknown as WorkoutSet;

          set((state) => {
            state.sets[updatedSet.id] = updatedSet;
          });
        } catch (error: any) {
          const message = error.message || 'Failed to update set';
          set((state) => {
            state.sets[setId] = previousSet;
            state.error = message;
          });
          throw new Error(message);
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
        // Allow cancel even without active workout (safety)
        if (!activeWorkoutId) {
            set(initialState);
            return;
        }

        set({ isLoading: true });
        try {
            await workoutApi.cancelWorkout(activeWorkoutId);
            set(initialState);
        } catch (error: any) {
            // Still reset even on API failure so user isn't stuck
            set(initialState);
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

      // EXERCISE & REST
      // ----------------------------------------------------------------------
      setCurrentExercise: (id) => {
        set((state) => { state.currentExerciseId = id; });
      },

      startRest: (durationSeconds) => {
        const endTime = new Date(Date.now() + durationSeconds * 1000).toISOString();
        set((state) => {
          state.isResting = true;
          state.restEndTime = endTime;
          state.restDurationSeconds = durationSeconds;
        });
      },

      stopRest: () => {
        set((state) => {
          state.isResting = false;
          state.restEndTime = null;
          state.restDurationSeconds = 0;
        });
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

      updateTimerSettings: (autoStart, defaultDuration) => {
        set((state) => {
           state.autoStartTimer = autoStart;
           state.defaultTimerSeconds = defaultDuration;
        });
      },
      
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
          currentExerciseId: state.currentExerciseId,
          exercises: state.exercises,
          sets: state.sets,
          isResting: state.isResting,
          restEndTime: state.restEndTime,
          restDurationSeconds: state.restDurationSeconds,
          autoStartTimer: state.autoStartTimer,
          defaultTimerSeconds: state.defaultTimerSeconds,
          elapsedSeconds: state.elapsedSeconds
      }),
    }
  )
);

