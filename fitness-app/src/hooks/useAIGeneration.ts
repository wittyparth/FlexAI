/**
 * useAIGeneration — Hook for AI generation flows
 *
 * Wraps the aiStore FSM with request/response lifecycle management.
 * Handles SSE streaming, timeout, and cancellation.
 *
 * Usage:
 *   const { generate, phase, result, error } = useAIGeneration('workout');
 */

import { useCallback, useRef } from 'react';
import { useAIStore } from '../store/aiStore';
import type {
  AIWorkoutResult,
  AIRoutineResult,
  AITemplateResult,
} from '../store/types/ai.types';

type FlowType = 'workout' | 'routine' | 'template';

// ─── Workout Flow ─────────────────────────────────────────────────────────────

export function useWorkoutAIGeneration() {
  const abortRef = useRef<AbortController | null>(null);

  const phase  = useAIStore((s) => s.workoutGen.phase);
  const result = useAIStore((s) => s.workoutGen.phase === 'preview' ? s.workoutGen.result : null);
  const error  = useAIStore((s) => s.workoutGen.phase === 'error' ? s.workoutGen.error : null);

  const {
    configureWorkoutGen,
    startWorkoutGen,
    workoutGenSuccess,
    workoutGenFailed,
    applyWorkoutResult,
    resetWorkoutGen,
  } = useAIStore.getState();

  const generate = useCallback(
    async (prompt: string, apiFn: (prompt: string, signal: AbortSignal) => Promise<AIWorkoutResult>) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = startWorkoutGen(prompt);

      try {
        const result = await apiFn(prompt, controller.signal);
        if (!controller.signal.aborted) {
          workoutGenSuccess(requestId, result);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          workoutGenFailed(err?.message ?? 'Generation failed', true);
        }
      }
    },
    [startWorkoutGen, workoutGenSuccess, workoutGenFailed],
  );

  const apply = useCallback(
    async (apiSave: (r: AIWorkoutResult) => Promise<number>) => {
      const current = useAIStore.getState().workoutGen;
      if (current.phase !== 'preview') return;
      await applyWorkoutResult(current.result, apiSave);
    },
    [applyWorkoutResult],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    resetWorkoutGen();
  }, [resetWorkoutGen]);

  return { phase, result, error, generate, apply, cancel, configure: configureWorkoutGen };
}

// ─── Routine Flow ─────────────────────────────────────────────────────────────

export function useRoutineAIGeneration() {
  const abortRef = useRef<AbortController | null>(null);

  const phase  = useAIStore((s) => s.routineGen.phase);
  const result = useAIStore((s) => s.routineGen.phase === 'preview' ? s.routineGen.result : null);
  const error  = useAIStore((s) => s.routineGen.phase === 'error' ? s.routineGen.error : null);

  const {
    configureRoutineGen,
    startRoutineGen,
    routineGenSuccess,
    routineGenFailed,
    applyRoutineResult,
    resetRoutineGen,
  } = useAIStore.getState();

  const generate = useCallback(
    async (prompt: string, apiFn: (prompt: string, signal: AbortSignal) => Promise<AIRoutineResult>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = startRoutineGen(prompt);

      try {
        const result = await apiFn(prompt, controller.signal);
        if (!controller.signal.aborted) {
          routineGenSuccess(requestId, result);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          routineGenFailed(err?.message ?? 'Generation failed', true);
        }
      }
    },
    [startRoutineGen, routineGenSuccess, routineGenFailed],
  );

  const apply = useCallback(
    async (apiSave: (r: AIRoutineResult) => Promise<number>) => {
      const current = useAIStore.getState().routineGen;
      if (current.phase !== 'preview') return;
      await applyRoutineResult(current.result, apiSave);
    },
    [applyRoutineResult],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    resetRoutineGen();
  }, [resetRoutineGen]);

  return { phase, result, error, generate, apply, cancel, configure: configureRoutineGen };
}

// ─── Template Flow ────────────────────────────────────────────────────────────

export function useTemplateAIGeneration() {
  const abortRef = useRef<AbortController | null>(null);

  const phase  = useAIStore((s) => s.templateGen.phase);
  const result = useAIStore((s) => s.templateGen.phase === 'preview' ? s.templateGen.result : null);
  const error  = useAIStore((s) => s.templateGen.phase === 'error' ? s.templateGen.error : null);

  const {
    configureTemplateGen,
    startTemplateGen,
    templateGenSuccess,
    templateGenFailed,
    applyTemplateResult,
    resetTemplateGen,
  } = useAIStore.getState();

  const generate = useCallback(
    async (prompt: string, apiFn: (prompt: string, signal: AbortSignal) => Promise<AITemplateResult>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = startTemplateGen(prompt);

      try {
        const result = await apiFn(prompt, controller.signal);
        if (!controller.signal.aborted) {
          templateGenSuccess(requestId, result);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          templateGenFailed(err?.message ?? 'Generation failed', true);
        }
      }
    },
    [startTemplateGen, templateGenSuccess, templateGenFailed],
  );

  const apply = useCallback(
    async (apiSave: (r: AITemplateResult) => Promise<string>) => {
      const current = useAIStore.getState().templateGen;
      if (current.phase !== 'preview') return;
      await applyTemplateResult(current.result, apiSave);
    },
    [applyTemplateResult],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    resetTemplateGen();
  }, [resetTemplateGen]);

  return { phase, result, error, generate, apply, cancel, configure: configureTemplateGen };
}
