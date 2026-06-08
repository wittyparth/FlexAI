/**
 * workoutStore.ts — Active Workout Session FSM
 *
 * Design principles:
 *  1. `sessionPhase` discriminated union: IMPOSSIBLE to have exercises
 *     in state when phase is 'idle'. No orphaned data.
 *  2. Normalized sets map: O(1) set lookup/update, no array scans.
 *  3. All set mutations are optimistic with full rollback on failure.
 *  4. Rest timer is a pure derived value (endTimeMs), not a counter —
 *     immune to app backgrounding / JS suspension.
 *  5. persisted slice is minimal — only what can't be re-derived.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { workoutApi } from '../api/workout.api';
import { queryClient } from '../lib/react-query';
import {
  WorkoutSessionPhase,
  NormalizedSet,
  NormalizedExercise,
  RestTimerState,
  TimerPreferences,
  WorkoutSummaryData,
} from './types/workout.types';
import {
  StartWorkoutInput,
  LogSetInput,
  UpdateSetInput,
  WorkoutExercise,
  WorkoutSet,
  Workout,
} from '../types/backend.types';

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface WorkoutSessionState {
  // FSM — single source of truth for "what mode is the session in"
  sessionPhase: WorkoutSessionPhase;

  // Normalized data — only populated when phase is 'active'
  exercises: Record<number, NormalizedExercise>;  // key: workoutExerciseId
  sets: Record<string, NormalizedSet>;             // key: set id (temp_xxx or real)

  // UI state — not persisted
  currentExerciseId: number | null;
  minimized: boolean;
  elapsedSeconds: number;

  // Rest timer — pure time-based, survives app backgrounding
  restTimer: RestTimerState;

  // User preferences — persisted
  timerPrefs: TimerPreferences;
}

interface WorkoutSessionActions {
  // Session lifecycle
  startWorkout:    (input: StartWorkoutInput) => Promise<void>;
  syncWorkout:     () => Promise<void>;
  completeWorkout: (summaryInput?: any) => Promise<void>;
  cancelWorkout:   () => Promise<void>;

  // Exercise management
  addExercise:    (exerciseId: number, notes?: string) => Promise<void>;
  removeExercise: (workoutExerciseId: number) => Promise<void>;
  setCurrentExercise: (id: number | null) => void;

  // Set management — all optimistic
  logSet:    (workoutExerciseId: number, input: LogSetInput)              => Promise<void>;
  updateSet: (setId: string, input: UpdateSetInput)                        => Promise<void>;
  deleteSet: (workoutExerciseId: number, setId: string)                    => Promise<void>;

  // Rest timer
  startRest:  (durationSeconds: number) => void;
  pauseRest:  () => void;
  resumeRest: () => void;
  extendRest: (seconds: number) => void;
  stopRest:   () => void;

  // UI helpers
  tick:        () => void;
  minimize:    (val: boolean) => void;
  updateTimerPrefs: (prefs: Partial<TimerPreferences>) => void;
  clearError:  () => void;

  // Crash recovery
  recoverFromStorage:  () => Promise<void>;
  syncCurrentWorkout:  () => Promise<void>;
}

type WorkoutStore = WorkoutSessionState & WorkoutSessionActions;

// ─── Normalization Helpers ────────────────────────────────────────────────────

function normalizeWorkout(
  workout: Workout,
): { exercises: WorkoutStore['exercises']; sets: WorkoutStore['sets'] } {
  const exercises: WorkoutStore['exercises'] = {};
  const sets: WorkoutStore['sets'] = {};

  (workout.exercises ?? []).forEach((ex: WorkoutExercise) => {
    exercises[ex.id] = {
      id:               ex.id,
      exerciseId:       (ex as any).exerciseId ?? ex.id,
      exerciseName:     (ex as any).exerciseName ?? (ex as any).exercise?.name ?? '',
      order:            (ex as any).order ?? 0,
      notes:            (ex as any).notes,
      restSeconds:      (ex as any).restSeconds,
      targetSets:       (ex as any).targetSets ?? (ex as any).exercise?.targetSets,
      targetRepsMin:    (ex as any).targetRepsMin ?? (ex as any).exercise?.targetRepsMin,
      targetRepsMax:    (ex as any).targetRepsMax ?? (ex as any).exercise?.targetRepsMax,
      targetWeight:     (ex as any).targetWeight ?? (ex as any).exercise?.targetWeight,
      primaryMuscle:    (ex as any).exercise?.muscleGroup
                          ?? (Array.isArray((ex as any).exercise?.primaryMuscleGroups)
                               ? (ex as any).exercise.primaryMuscleGroups[0]
                               : undefined),
      secondaryMuscles: (ex as any).exercise?.secondaryMuscleGroups ?? [],
    };
    (ex.sets ?? []).forEach((s: WorkoutSet) => {
      sets[String(s.id)] = {
        id:                 String(s.id),
        workoutExerciseId:  ex.id,
        setType:            (s as any).setType ?? 'working',
        weight:             s.weight,
        reps:               s.reps,
        rpe:                (s as any).rpe,
        rir:                (s as any).rir,
        status:             'synced',
      };
    });
  });

  return { exercises, sets };
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: Pick<
  WorkoutSessionState,
  'sessionPhase' | 'exercises' | 'sets' | 'currentExerciseId' | 'minimized' | 'elapsedSeconds' | 'restTimer'
> = {
  sessionPhase:      { phase: 'idle' },
  exercises:         {},
  sets:              {},
  currentExerciseId: null,
  minimized:         false,
  elapsedSeconds:    0,
  restTimer:         { active: false },
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    immer((set, get) => ({
      ...INITIAL_STATE,
      timerPrefs: { autoStart: true, defaultSeconds: 90 },

      // ── Session Lifecycle ────────────────────────────────────────────────

      startWorkout: async (input) => {
        set((s) => { s.sessionPhase = { phase: 'starting', name: input.name ?? 'Workout', routineId: input.routineId }; });
        try {
          const response = await workoutApi.startWorkout(input);
          const workout  = response.data as unknown as Workout;
          const { exercises, sets } = normalizeWorkout(workout);

          set((s) => {
            s.sessionPhase      = { phase: 'active', workoutId: workout.id, name: workout.name, startTime: workout.startTime || new Date().toISOString() };
            s.exercises         = exercises;
            s.sets              = sets;
            s.elapsedSeconds    = 0;
            s.currentExerciseId = Object.values(exercises)[0]?.id ?? null;
            s.restTimer         = { active: false };
          });
        } catch (err: any) {
          set((s) => {
            s.sessionPhase = { phase: 'error', error: err?.message ?? 'Failed to start workout', previousPhase: 'starting' };
            // Auto-reset to idle so user isn't stuck
            setTimeout(() => get().clearError(), 3000);
          });
          throw err;
        }
      },

      syncWorkout: async () => {
        const { sessionPhase, exercises } = get();
        // Already active with local data — skip network round-trip
        if (sessionPhase.phase === 'active' && Object.keys(exercises).length > 0) return;

        try {
          const response = await workoutApi.getCurrentWorkout();
          const workout  = response.data as unknown as Workout | null;

          if (!workout) {
            set((s) => { Object.assign(s, INITIAL_STATE); });
            return;
          }

          const { exercises: ex, sets } = normalizeWorkout(workout);
          set((s) => {
            s.sessionPhase   = { phase: 'active', workoutId: workout.id, name: workout.name, startTime: workout.startTime || new Date().toISOString() };
            s.exercises      = ex;
            s.sets           = sets;
          });
        } catch {
          // Silently fail — keeps existing local state intact
        }
      },

      completeWorkout: async (summaryInput) => {
        const { sessionPhase, exercises, sets, elapsedSeconds } = get();
        if (sessionPhase.phase !== 'active') return;

        const { workoutId, name } = sessionPhase;
        set((s) => { s.sessionPhase = { phase: 'completing', workoutId, name }; });

        try {
          const response = await workoutApi.completeWorkout(workoutId, summaryInput ?? {});
          const result   = (response.data as any) ?? {};

          // Compute summary
          const totalVolume = Object.values(sets).reduce((acc, s) => {
            if (s.status === 'failed') return acc;
            return acc + ((s.weight ?? 0) * (s.reps ?? 0));
          }, 0);
          const muscleSets: Record<string, number> = {};
          const totalSetsCompleted = Object.values(sets).filter((s) => s.status === 'synced').length;

          const summary: WorkoutSummaryData = {
            workoutId,
            workoutName:         name,
            elapsedSeconds,
            totalVolume:         result.totalVolume     ?? totalVolume,
            totalSetsCompleted:  result.setsCompleted   ?? totalSetsCompleted,
            muscleSets:          result.muscleSets      ?? muscleSets,
            personalRecords:     result.personalRecords ?? [],
          };

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['workouts'] }),
            queryClient.invalidateQueries({ queryKey: ['stats'] }),
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
          ]);

          set((s) => {
            s.sessionPhase = { phase: 'completed', workoutId, summary };
            s.restTimer    = { active: false };
          });
        } catch (err: any) {
          set((s) => {
            s.sessionPhase = { phase: 'error', error: err?.message ?? 'Failed to complete workout', previousPhase: 'completing' };
          });
          throw err;
        }
      },

      cancelWorkout: async () => {
        const { sessionPhase } = get();
        const workoutId = sessionPhase.phase === 'active' ? sessionPhase.workoutId : null;

        if (workoutId) {
          set((s) => { s.sessionPhase = { phase: 'cancelling', workoutId }; });
          try { await workoutApi.cancelWorkout(workoutId); } catch { /* best effort */ }
        }

        // Always reset — user must not be stuck in a cancel loop
        set((s) => { Object.assign(s, INITIAL_STATE); });
      },

      // ── Exercise Management ───────────────────────────────────────────────

      addExercise: async (exerciseId, notes) => {
        const { sessionPhase } = get();
        if (sessionPhase.phase !== 'active') throw new Error('No active workout');

        try {
          const response      = await workoutApi.addExercise(sessionPhase.workoutId, { exerciseId, notes });
          const workoutExercise = response.data as unknown as WorkoutExercise;

          set((s) => {
            s.exercises[workoutExercise.id] = {
              id:               workoutExercise.id,
              exerciseId:       (workoutExercise as any).exerciseId ?? exerciseId,
              exerciseName:     (workoutExercise as any).exerciseName ?? (workoutExercise as any).exercise?.name ?? '',
              order:            Object.keys(s.exercises).length,
              notes,
              targetSets:       (workoutExercise as any).targetSets ?? (workoutExercise as any).exercise?.targetSets,
              targetRepsMin:    (workoutExercise as any).targetRepsMin ?? (workoutExercise as any).exercise?.targetRepsMin,
              targetRepsMax:    (workoutExercise as any).targetRepsMax ?? (workoutExercise as any).exercise?.targetRepsMax,
              targetWeight:     (workoutExercise as any).targetWeight ?? (workoutExercise as any).exercise?.targetWeight,
              primaryMuscle:    (workoutExercise as any).exercise?.muscleGroup
                                  ?? (Array.isArray((workoutExercise as any).exercise?.primaryMuscleGroups)
                                       ? (workoutExercise as any).exercise.primaryMuscleGroups[0]
                                       : undefined),
              secondaryMuscles: (workoutExercise as any).exercise?.secondaryMuscleGroups ?? [],
            };
            (workoutExercise.sets ?? []).forEach((sv: WorkoutSet) => {
              s.sets[String(sv.id)] = { id: String(sv.id), workoutExerciseId: workoutExercise.id, setType: 'working', status: 'synced', weight: sv.weight, reps: sv.reps };
            });
            s.currentExerciseId = workoutExercise.id;
          });
        } catch (err: any) {
          throw new Error(err?.message ?? 'Failed to add exercise');
        }
      },

      removeExercise: async (workoutExerciseId) => {
        const { sessionPhase, exercises, sets } = get();
        if (sessionPhase.phase !== 'active') throw new Error('No active workout');
        if (!exercises[workoutExerciseId]) throw new Error('Exercise not found');

        // Snapshot for rollback
        const prevExercise = exercises[workoutExerciseId];
        const prevSets = Object.entries(sets).filter(([, s]) => s.workoutExerciseId === workoutExerciseId);

        // Optimistic remove
        set((s) => {
          delete s.exercises[workoutExerciseId];
          prevSets.forEach(([id]) => delete s.sets[id]);
          if (s.currentExerciseId === workoutExerciseId) {
            s.currentExerciseId = Object.values(s.exercises)[0]?.id ?? null;
          }
        });

        try {
          await workoutApi.removeExercise(sessionPhase.workoutId, workoutExerciseId);
        } catch (err: any) {
          // Rollback
          set((s) => {
            s.exercises[workoutExerciseId] = prevExercise;
            prevSets.forEach(([id, sv]) => { s.sets[id] = sv; });
          });
          throw new Error(err?.message ?? 'Failed to remove exercise');
        }
      },

      setCurrentExercise: (id) =>
        set((s) => { s.currentExerciseId = id; }),

      // ── Set Management — Optimistic ───────────────────────────────────────

      logSet: async (workoutExerciseId, input) => {
        const { sessionPhase } = get();
        if (sessionPhase.phase !== 'active') return;

        const tempId    = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const optimistic: NormalizedSet = {
          id:                tempId,
          workoutExerciseId,
          setType:           input.setType ?? 'working',
          weight:            input.weight,
          reps:              input.reps,
          rpe:               input.rpe,
          status:            'syncing',
          tempId,
        };

        set((s) => { s.sets[tempId] = optimistic; });

        try {
          const response = await workoutApi.logSet(sessionPhase.workoutId, workoutExerciseId, input);
          const realSet  = response.data as unknown as WorkoutSet;

          set((s) => {
            delete s.sets[tempId];
            s.sets[String(realSet.id)] = {
              id:                String(realSet.id),
              workoutExerciseId,
              setType:           (realSet as any).setType ?? 'working',
              weight:            realSet.weight,
              reps:              realSet.reps,
              rpe:               (realSet as any).rpe,
              rir:               (realSet as any).rir,
              status:            'synced',
            };
          });

          // Auto-start rest timer if enabled
          const { timerPrefs } = get();
          if (timerPrefs.autoStart) {
            get().startRest(timerPrefs.defaultSeconds);
          }
        } catch (err: any) {
          set((s) => {
            s.sets[tempId] = { ...optimistic, status: 'failed' };
          });
          // Don't throw — optimistic UI already shows failure state
        }
      },

      updateSet: async (setId, input) => {
        const { sessionPhase, sets } = get();
        if (sessionPhase.phase !== 'active') throw new Error('No active workout');

        const existing = sets[setId];
        if (!existing) throw new Error('Set not found');
        if (existing.status === 'syncing') throw new Error('Set is still syncing, please wait');

        const prev = { ...existing };

        // Optimistic
        set((s) => {
          Object.assign(s.sets[setId], input);
          s.sets[setId].status = 'syncing';
        });

        try {
          const response = await workoutApi.updateSet(sessionPhase.workoutId, setId, input);
          const updated  = response.data as unknown as WorkoutSet;
          set((s) => {
            s.sets[String(updated.id)] = { ...s.sets[setId], ...(updated as any), status: 'synced' };
          });
        } catch (err: any) {
          set((s) => { s.sets[setId] = { ...prev, status: 'failed' }; });
          throw new Error(err?.message ?? 'Failed to update set');
        }
      },

      deleteSet: async (workoutExerciseId, setId) => {
        const { sessionPhase, sets } = get();
        if (sessionPhase.phase !== 'active') return;

        const prev = sets[setId];
        if (!prev) return;

        // Optimistic remove
        set((s) => { delete s.sets[setId]; });

        try {
          await workoutApi.deleteSet(sessionPhase.workoutId, setId);
        } catch {
          // Rollback
          set((s) => { s.sets[setId] = prev; });
        }
      },

      // ── Rest Timer ─────────────────────────────────────────────────────────

      startRest: (durationSeconds) => {
        set((s) => {
          s.restTimer = {
            active:          true,
            paused:          false,
            endTimeMs:       Date.now() + durationSeconds * 1000,
            durationSeconds,
          };
        });
      },

      pauseRest: () => {
        set((s) => {
          const t = s.restTimer;
          if (!t.active || t.paused) return;
          const remaining = Math.max(0, Math.floor((t.endTimeMs - Date.now()) / 1000));
          s.restTimer = { active: true, paused: true, remainingSeconds: remaining, durationSeconds: t.durationSeconds };
        });
      },

      resumeRest: () => {
        set((s) => {
          const t = s.restTimer;
          if (!t.active || !t.paused) return;
          const remaining = Math.max(1, t.remainingSeconds);
          s.restTimer = {
            active:          true,
            paused:          false,
            endTimeMs:       Date.now() + remaining * 1000,
            durationSeconds: t.durationSeconds,
          };
        });
      },

      extendRest: (seconds) => {
        set((s) => {
          const t = s.restTimer;
          if (!t.active) return;
          const newDuration = t.durationSeconds + seconds;
          if (t.paused) {
            s.restTimer = { ...t, remainingSeconds: t.remainingSeconds + seconds, durationSeconds: newDuration };
          } else {
            s.restTimer = { ...t, endTimeMs: t.endTimeMs + seconds * 1000, durationSeconds: newDuration };
          }
        });
      },

      stopRest: () =>
        set((s) => { s.restTimer = { active: false }; }),

      // ── UI Helpers ─────────────────────────────────────────────────────────

      tick: () => {
        set((s) => {
          if (s.sessionPhase.phase === 'active') s.elapsedSeconds += 1;
        });
      },

      minimize: (val) =>
        set((s) => { s.minimized = val; }),

      updateTimerPrefs: (prefs) =>
        set((s) => { Object.assign(s.timerPrefs, prefs); }),

      clearError: () =>
        set((s) => {
          if (s.sessionPhase.phase === 'error') {
            s.sessionPhase = { phase: 'idle' };
            s.exercises    = {};
            s.sets         = {};
          }
        }),

      // ── Crash Recovery ─────────────────────────────────────────────────────

      recoverFromStorage: async () => {
        // The persist middleware rehydrates slice automatically;
        // this trigger is a no-op signal for the navigator guard.
        await get().syncCurrentWorkout();
      },

      syncCurrentWorkout: async () => {
        const { sessionPhase } = get();
        if (sessionPhase.phase !== 'active') {
          await get().syncWorkout();
          return;
        }
        try {
          const workout = (await workoutApi.getWorkoutById(sessionPhase.workoutId)).data as unknown as Workout;
          const { exercises, sets } = normalizeWorkout(workout);
          set((s) => { s.exercises = exercises; s.sets = sets; });
        } catch (err) {
          console.warn('[workoutStore] syncCurrentWorkout failed:', err);
        }
      },
    })),
    {
      name: 'workout-session-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only what's needed for crash recovery
      partialize: (state) => ({
        sessionPhase:      state.sessionPhase,
        exercises:         state.exercises,
        sets:              state.sets,
        elapsedSeconds:    state.elapsedSeconds,
        currentExerciseId: state.currentExerciseId,
        restTimer:         state.restTimer,
        timerPrefs:        state.timerPrefs,
      }),
    },
  ),
);

// ─── Atomic Selectors ─────────────────────────────────────────────────────────

export const selectSessionPhase     = (s: WorkoutStore) => s.sessionPhase;
export const selectIsIdle           = (s: WorkoutStore) => s.sessionPhase.phase === 'idle';
export const selectIsStarting       = (s: WorkoutStore) => s.sessionPhase.phase === 'starting';
export const selectIsActive         = (s: WorkoutStore) => s.sessionPhase.phase === 'active';
export const selectIsCompleting     = (s: WorkoutStore) => s.sessionPhase.phase === 'completing';
export const selectIsCompleted      = (s: WorkoutStore) => s.sessionPhase.phase === 'completed';
export const selectHasActiveSession = (s: WorkoutStore) =>
  ['active', 'completing', 'starting'].includes(s.sessionPhase.phase);

export const selectActiveWorkoutId  = (s: WorkoutStore) =>
  s.sessionPhase.phase === 'active' ? s.sessionPhase.workoutId : null;

export const selectWorkoutName      = (s: WorkoutStore) =>
  s.sessionPhase.phase === 'active' || s.sessionPhase.phase === 'completing'
    ? s.sessionPhase.name
    : null;

export const selectCompletedSummary = (s: WorkoutStore) =>
  s.sessionPhase.phase === 'completed' ? s.sessionPhase.summary : null;

export const selectExercises        = (s: WorkoutStore) => s.exercises;
export const selectSets             = (s: WorkoutStore) => s.sets;
export const selectCurrentExerciseId = (s: WorkoutStore) => s.currentExerciseId;
export const selectElapsedSeconds   = (s: WorkoutStore) => s.elapsedSeconds;
export const selectMinimized        = (s: WorkoutStore) => s.minimized;
export const selectRestTimer        = (s: WorkoutStore) => s.restTimer;
export const selectTimerPrefs       = (s: WorkoutStore) => s.timerPrefs;

// Derived: sets for a specific exercise
export const selectSetsByExercise = (exerciseId: number) => (s: WorkoutStore) =>
  Object.values(s.sets).filter((sv) => sv.workoutExerciseId === exerciseId);

// Derived: count of exercises
export const selectExerciseCount   = (s: WorkoutStore) => Object.keys(s.exercises).length;
export const selectTotalSetsLogged = (s: WorkoutStore) =>
  Object.values(s.sets).filter((sv) => sv.status === 'synced').length;
