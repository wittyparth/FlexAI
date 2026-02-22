/**
 * AI Flow Types
 *
 * Covers all AI generation flows:
 *  - Generate a single workout
 *  - Generate a routine plan
 *  - Generate a weekly template
 */

// ─── AI Workout Generation ────────────────────────────────────────────────────

/**
 *  idle        → ready
 *  configuring → user filling in prompt params
 *  generating  → API streaming in progress
 *  preview     → showing AI result for user review
 *  applying    → saving AI result to db
 *  done        → result saved, navigate to it
 *  error       → something went wrong
 */
export type AIWorkoutPhase =
  | { phase: 'idle' }
  | { phase: 'configuring'; prompt?: string; goal?: string; durationMins?: number }
  | { phase: 'generating'; prompt: string; requestId: string }
  | { phase: 'preview'; requestId: string; result: AIWorkoutResult }
  | { phase: 'applying'; result: AIWorkoutResult }
  | { phase: 'done'; workoutId: number; name: string }
  | { phase: 'error'; error: string; canRetry: boolean };

export type AIRoutinePhase =
  | { phase: 'idle' }
  | { phase: 'configuring'; prompt?: string; weeksCount?: number; daysPerWeek?: number }
  | { phase: 'generating'; prompt: string; requestId: string }
  | { phase: 'preview'; requestId: string; result: AIRoutineResult }
  | { phase: 'applying'; result: AIRoutineResult }
  | { phase: 'done'; routineId: number; name: string }
  | { phase: 'error'; error: string; canRetry: boolean };

export type AITemplatePhase =
  | { phase: 'idle' }
  | { phase: 'configuring'; prompt?: string }
  | { phase: 'generating'; prompt: string; requestId: string }
  | { phase: 'preview'; requestId: string; result: AITemplateResult }
  | { phase: 'applying'; result: AITemplateResult }
  | { phase: 'done'; templateId: string; name: string }
  | { phase: 'error'; error: string; canRetry: boolean };

// ─── AI Result Shapes ─────────────────────────────────────────────────────────

export interface AIExercise {
  exerciseId?: number;
  exerciseName: string;
  sets: number;
  reps: string; // "8-12" or "AMRAP"
  rest: string; // "90s"
  notes?: string;
}

export interface AIWorkoutResult {
  name: string;
  description?: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  exercises: AIExercise[];
  rawResponse?: string;
}

export interface AIRoutineDay {
  dayName: string;
  focus: string;
  exercises: AIExercise[];
  isRestDay: boolean;
}

export interface AIRoutineResult {
  name: string;
  description?: string;
  weeks: number;
  daysPerWeek: number;
  weekSchedule: AIRoutineDay[];
  rawResponse?: string;
}

export interface AITemplateResult {
  name: string;
  description?: string;
  durationWeeks: number;
  days: Array<{
    dayId: number;
    isRestDay: boolean;
    focus?: string;
    exercises: AIExercise[];
  }>;
  rawResponse?: string;
}
