/**
 * aiStore.ts — AI Generation FSM
 *
 * Covers three generation flows:
 *  - Single workout generation
 *  - Routine plan generation
 *  - Weekly template generation
 *
 * Design: Each flow is an independent FSM slice. They don't share state
 * so a user can be viewing a workout preview while a routine is generating.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  AIWorkoutPhase,
  AIRoutinePhase,
  AITemplatePhase,
  AIWorkoutResult,
  AIRoutineResult,
  AITemplateResult,
} from './types/ai.types';

// ─── State ────────────────────────────────────────────────────────────────────

interface AIStoreState {
  workoutGen:  AIWorkoutPhase;
  routineGen:  AIRoutinePhase;
  templateGen: AITemplatePhase;
}

interface AIStoreActions {
  // ── Workout Generation ────────────────────────────────────────────────────
  configureWorkoutGen:  (opts?: { prompt?: string; goal?: string; durationMins?: number }) => void;
  startWorkoutGen:      (prompt: string) => string;           // returns requestId
  workoutGenSuccess:    (requestId: string, result: AIWorkoutResult) => void;
  workoutGenFailed:     (error: string, canRetry?: boolean) => void;
  applyWorkoutResult:   (result: AIWorkoutResult, apiSave: (r: AIWorkoutResult) => Promise<number>) => Promise<void>;
  resetWorkoutGen:      () => void;

  // ── Routine Generation ────────────────────────────────────────────────────
  configureRoutineGen:  (opts?: { prompt?: string; weeksCount?: number; daysPerWeek?: number }) => void;
  startRoutineGen:      (prompt: string) => string;
  routineGenSuccess:    (requestId: string, result: AIRoutineResult) => void;
  routineGenFailed:     (error: string, canRetry?: boolean) => void;
  applyRoutineResult:   (result: AIRoutineResult, apiSave: (r: AIRoutineResult) => Promise<number>) => Promise<void>;
  resetRoutineGen:      () => void;

  // ── Template Generation ───────────────────────────────────────────────────
  configureTemplateGen: (opts?: { prompt?: string }) => void;
  startTemplateGen:     (prompt: string) => string;
  templateGenSuccess:   (requestId: string, result: AITemplateResult) => void;
  templateGenFailed:    (error: string, canRetry?: boolean) => void;
  applyTemplateResult:  (result: AITemplateResult, apiSave: (r: AITemplateResult) => Promise<string>) => Promise<void>;
  resetTemplateGen:     () => void;
}

type AIStore = AIStoreState & AIStoreActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genRequestId = () => `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAIStore = create<AIStore>()(
  immer((set) => ({
    workoutGen:  { phase: 'idle' },
    routineGen:  { phase: 'idle' },
    templateGen: { phase: 'idle' },

    // ── Workout Generation ────────────────────────────────────────────────

    configureWorkoutGen: (opts) =>
      set((s) => {
        s.workoutGen = { phase: 'configuring', ...opts };
      }),

    startWorkoutGen: (prompt) => {
      const requestId = genRequestId();
      set((s) => { s.workoutGen = { phase: 'generating', prompt, requestId }; });
      return requestId;
    },

    workoutGenSuccess: (requestId, result) =>
      set((s) => {
        if (s.workoutGen.phase === 'generating' && s.workoutGen.requestId === requestId) {
          s.workoutGen = { phase: 'preview', requestId, result };
        }
      }),

    workoutGenFailed: (error, canRetry = true) =>
      set((s) => { s.workoutGen = { phase: 'error', error, canRetry }; }),

    applyWorkoutResult: async (result, apiSave) => {
      set((s) => { s.workoutGen = { phase: 'applying', result }; });
      try {
        const workoutId = await apiSave(result);
        set((s) => { s.workoutGen = { phase: 'done', workoutId, name: result.name }; });
      } catch (err: any) {
        set((s) => { s.workoutGen = { phase: 'error', error: err?.message ?? 'Failed to save', canRetry: true }; });
        throw err;
      }
    },

    resetWorkoutGen: () =>
      set((s) => { s.workoutGen = { phase: 'idle' }; }),

    // ── Routine Generation ────────────────────────────────────────────────

    configureRoutineGen: (opts) =>
      set((s) => { s.routineGen = { phase: 'configuring', ...opts }; }),

    startRoutineGen: (prompt) => {
      const requestId = genRequestId();
      set((s) => { s.routineGen = { phase: 'generating', prompt, requestId }; });
      return requestId;
    },

    routineGenSuccess: (requestId, result) =>
      set((s) => {
        if (s.routineGen.phase === 'generating' && s.routineGen.requestId === requestId) {
          s.routineGen = { phase: 'preview', requestId, result };
        }
      }),

    routineGenFailed: (error, canRetry = true) =>
      set((s) => { s.routineGen = { phase: 'error', error, canRetry }; }),

    applyRoutineResult: async (result, apiSave) => {
      set((s) => { s.routineGen = { phase: 'applying', result }; });
      try {
        const routineId = await apiSave(result);
        set((s) => { s.routineGen = { phase: 'done', routineId, name: result.name }; });
      } catch (err: any) {
        set((s) => { s.routineGen = { phase: 'error', error: err?.message ?? 'Failed to save', canRetry: true }; });
        throw err;
      }
    },

    resetRoutineGen: () =>
      set((s) => { s.routineGen = { phase: 'idle' }; }),

    // ── Template Generation ───────────────────────────────────────────────

    configureTemplateGen: (opts) =>
      set((s) => { s.templateGen = { phase: 'configuring', ...opts }; }),

    startTemplateGen: (prompt) => {
      const requestId = genRequestId();
      set((s) => { s.templateGen = { phase: 'generating', prompt, requestId }; });
      return requestId;
    },

    templateGenSuccess: (requestId, result) =>
      set((s) => {
        if (s.templateGen.phase === 'generating' && s.templateGen.requestId === requestId) {
          s.templateGen = { phase: 'preview', requestId, result };
        }
      }),

    templateGenFailed: (error, canRetry = true) =>
      set((s) => { s.templateGen = { phase: 'error', error, canRetry }; }),

    applyTemplateResult: async (result, apiSave) => {
      set((s) => { s.templateGen = { phase: 'applying', result }; });
      try {
        const templateId = await apiSave(result);
        set((s) => { s.templateGen = { phase: 'done', templateId, name: result.name }; });
      } catch (err: any) {
        set((s) => { s.templateGen = { phase: 'error', error: err?.message ?? 'Failed to save', canRetry: true }; });
        throw err;
      }
    },

    resetTemplateGen: () =>
      set((s) => { s.templateGen = { phase: 'idle' }; }),
  })),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

type S = AIStore;

// Workout gen
export const selectWorkoutGen        = (s: S) => s.workoutGen;
export const selectWorkoutGenPhase   = (s: S) => s.workoutGen.phase;
export const selectWorkoutGenResult  = (s: S) =>
  s.workoutGen.phase === 'preview' ? s.workoutGen.result : null;
export const selectWorkoutGenError   = (s: S) =>
  s.workoutGen.phase === 'error'   ? s.workoutGen.error  : null;
export const selectIsGeneratingWorkout = (s: S) => s.workoutGen.phase === 'generating';

// Routine gen
export const selectRoutineGen        = (s: S) => s.routineGen;
export const selectRoutineGenPhase   = (s: S) => s.routineGen.phase;
export const selectRoutineGenResult  = (s: S) =>
  s.routineGen.phase === 'preview' ? s.routineGen.result : null;
export const selectIsGeneratingRoutine = (s: S) => s.routineGen.phase === 'generating';

// Template gen
export const selectTemplateGen       = (s: S) => s.templateGen;
export const selectTemplateGenPhase  = (s: S) => s.templateGen.phase;
export const selectTemplateGenResult = (s: S) =>
  s.templateGen.phase === 'preview' ? s.templateGen.result : null;
export const selectIsGeneratingTemplate = (s: S) => s.templateGen.phase === 'generating';

// Any generation in flight?
export const selectAnyGenerating = (s: S) =>
  s.workoutGen.phase === 'generating' ||
  s.routineGen.phase === 'generating'  ||
  s.templateGen.phase === 'generating';
