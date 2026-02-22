/**
 * Workout & Routine Creation Flow Types
 *
 * Covers:
 *  - Creating a routine from scratch
 *  - Editing an existing routine
 *  - Using an AI-generated routine
 *  - Creating a template
 */

// ─── Routine Creation ─────────────────────────────────────────────────────────

export type RoutineCreationPhase =
  | { phase: 'idle' }
  | { phase: 'draft'; draftId: string; mode: 'create' | 'edit'; routineId?: number }
  | { phase: 'saving'; draftId: string }
  | { phase: 'saved'; routineId: number; name: string }
  | { phase: 'error'; error: string; draftId: string };

export interface ExerciseDraft {
  id: string; // temp_xxx
  exerciseId: number;
  exerciseName: string;
  sets: SetDraft[];
  notes?: string;
  restSeconds?: number;
  order: number;
}

export interface SetDraft {
  id: string;
  setType: 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
  targetReps?: number;
  targetWeight?: number;
  rpe?: number;
  duration?: number;
}

export interface RoutineDraft {
  draftId: string;
  name: string;
  description?: string;
  exercises: ExerciseDraft[];
  tags?: string[];
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Template Creation ────────────────────────────────────────────────────────

export type TemplateCreationPhase =
  | { phase: 'idle' }
  | { phase: 'draft'; draftId: string; mode: 'create' | 'edit'; templateId?: string }
  | { phase: 'saving'; draftId: string }
  | { phase: 'saved'; templateId: string; name: string }
  | { phase: 'error'; error: string; draftId: string };

export interface TemplateDayDraft {
  dayId: number; // 1-7
  isRestDay: boolean;
  name?: string; // e.g. "Push Day"
  exercises: ExerciseDraft[];
}

export interface TemplateDraft {
  draftId: string;
  name: string;
  description?: string;
  durationWeeks: number;
  days: TemplateDayDraft[];
  tags?: string[];
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}
