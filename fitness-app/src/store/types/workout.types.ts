/**
 * Workout Session FSM Types
 *
 * Discriminated union states prevent impossible combinations like
 * "workout is idle but has an activeWorkoutId".
 */

// ─── Session Phase Machine ────────────────────────────────────────────────────

/**
 *  idle         → no active workout
 *  starting     → API call in flight to create workout
 *  active       → workout in progress (normal editing state)
 *  completing   → API call in flight to submit completion
 *  completed    → brief success state, then reset to idle
 *  cancelling   → API call in flight to cancel
 */
export type WorkoutSessionPhase =
  | { phase: 'idle' }
  | { phase: 'starting'; name: string; routineId?: number }
  | { phase: 'active'; workoutId: number; name: string; startTime: string }
  | { phase: 'completing'; workoutId: number; name: string }
  | { phase: 'completed'; workoutId: number; summary: WorkoutSummaryData }
  | { phase: 'cancelling'; workoutId: number }
  | { phase: 'error'; error: string; previousPhase: 'starting' | 'active' | 'completing' };

export interface WorkoutSummaryData {
  workoutId: number;
  workoutName: string;
  elapsedSeconds: number;
  totalVolume: number;
  totalSetsCompleted: number;
  muscleSets: Record<string, number>;
  personalRecords: PersonalRecord[];
}

export interface PersonalRecord {
  exerciseName: string;
  metric: 'weight' | 'reps' | 'volume';
  value: number;
  previous: number;
}

// ─── Normalized Exercise & Set State ─────────────────────────────────────────

export type SetStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface NormalizedSet {
  id: string; // temp_xxx before sync, real id after
  workoutExerciseId: number;
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
  weight?: number;
  reps?: number;
  rpe?: number;
  rir?: number;
  status: SetStatus;
  tempId?: string; // keep temp id for reconciliation
}

export interface NormalizedExercise {
  id: number; // workoutExerciseId
  exerciseId: number;
  exerciseName: string;
  order: number;
  notes?: string;
  restSeconds?: number;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeight?: number;
  /** Primary muscle group string (e.g. 'chest') */
  primaryMuscle?: string;
  /** Secondary muscle groups for the muscle highlighter */
  secondaryMuscles?: string[];
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────

export type RestTimerState =
  | { active: false }
  | { active: true; paused: false; endTimeMs: number; durationSeconds: number }
  | { active: true; paused: true; remainingSeconds: number; durationSeconds: number };

// ─── Timer Prefs ─────────────────────────────────────────────────────────────

export interface TimerPreferences {
  autoStart: boolean;
  defaultSeconds: number;
}
