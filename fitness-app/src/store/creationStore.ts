/**
 * creationStore.ts — Routine & Template Creation FSM
 *
 * Design principles:
 *  1. Drafts survive navigation — user can leave and come back.
 *  2. `phase` discriminated union: if phase='idle', no draft data exists.
 *  3. Exercises use a stable temp ID so they can be reordered safely.
 *  4. Server saves are async but drafts are local-first.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RoutineCreationPhase,
  TemplateDraft,
  RoutineDraft,
  ExerciseDraft,
  SetDraft,
  TemplateDayDraft,
  TemplateCreationPhase,
} from './types/creation.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() { return `d_${Date.now()}_${Math.random().toString(36).slice(2)}`; }

function defaultSetDraft(): SetDraft {
  return { id: genId(), setType: 'working', targetReps: 10 };
}

function defaultExerciseDraft(exerciseId: number, exerciseName: string, order: number): ExerciseDraft {
  return {
    id: genId(),
    exerciseId,
    exerciseName,
    order,
    sets: [defaultSetDraft(), defaultSetDraft(), defaultSetDraft()],
  };
}

function defaultTemplateDays(): TemplateDayDraft[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayId:     i + 1,
    isRestDay: true,
    exercises: [],
  }));
}

// ─── State ────────────────────────────────────────────────────────────────────

interface CreationStoreState {
  // Routine
  routinePhase: RoutineCreationPhase;
  routineDraft: RoutineDraft | null;

  // Template
  templatePhase: TemplateCreationPhase;
  templateDraft: TemplateDraft | null;
}

interface CreationStoreActions {
  // ── Routine actions ────────────────────────────────────────────────────────
  startRoutine:     (opts?: { routineId?: number; existingData?: Partial<RoutineDraft> }) => string;
  saveRoutineDraft: (updates: Partial<Pick<RoutineDraft, 'name' | 'description' | 'tags' | 'isPublic'>>) => void;
  addExerciseToRoutine:    (exerciseId: number, exerciseName: string) => void;
  removeExerciseFromRoutine: (draftExerciseId: string) => void;
  reorderRoutineExercises: (orderedIds: string[]) => void;
  addSetToExercise:        (draftExerciseId: string) => void;
  removeSetFromExercise:   (draftExerciseId: string, setId: string) => void;
  updateSetInExercise:     (draftExerciseId: string, setId: string, updates: Partial<SetDraft>) => void;
  updateExerciseNotes:     (draftExerciseId: string, notes: string) => void;
  saveRoutine:       (apiSave: (draft: RoutineDraft) => Promise<number>) => Promise<void>;
  discardRoutine:    () => void;
  resetRoutineAfterNav: () => void;

  // ── Template actions ───────────────────────────────────────────────────────
  startTemplate:    (opts?: { templateId?: string; existingData?: Partial<TemplateDraft> }) => string;
  saveTemplateDraft: (updates: Partial<Pick<TemplateDraft, 'name' | 'description' | 'durationWeeks' | 'tags' | 'isPublic'>>) => void;
  setDayRestStatus: (dayId: number, isRestDay: boolean) => void;
  setDayName:       (dayId: number, name: string) => void;
  addExerciseToDay: (dayId: number, exerciseId: number, exerciseName: string) => void;
  removeExerciseFromDay: (dayId: number, draftExerciseId: string) => void;
  reorderDayExercises: (dayId: number, orderedIds: string[]) => void;
  addSetToDayExercise: (dayId: number, draftExerciseId: string) => void;
  removeSetFromDayExercise: (dayId: number, draftExerciseId: string, setId: string) => void;
  updateSetInDayExercise: (dayId: number, draftExerciseId: string, setId: string, updates: Partial<SetDraft>) => void;
  saveTemplate:     (apiSave: (draft: TemplateDraft) => Promise<string>) => Promise<void>;
  discardTemplate:  () => void;
  resetTemplateAfterNav: () => void;
}

type CreationStore = CreationStoreState & CreationStoreActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCreationStore = create<CreationStore>()(
  persist(
    immer((set, get) => ({
      routinePhase:  { phase: 'idle' },
      routineDraft:  null,
      templatePhase: { phase: 'idle' },
      templateDraft: null,

      // ── Routine ────────────────────────────────────────────────────────────

      startRoutine: (opts) => {
        const draftId = genId();
        const mode    = opts?.routineId ? 'edit' : 'create';
        const draft: RoutineDraft = {
          draftId,
          name:      opts?.existingData?.name      ?? '',
          exercises: opts?.existingData?.exercises ?? [],
          tags:      opts?.existingData?.tags      ?? [],
          isPublic:  opts?.existingData?.isPublic  ?? false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...opts?.existingData,
        };
        set((s) => {
          s.routinePhase = { phase: 'draft', draftId, mode, routineId: opts?.routineId };
          s.routineDraft = draft;
        });
        return draftId;
      },

      saveRoutineDraft: (updates) =>
        set((s) => {
          if (!s.routineDraft) return;
          Object.assign(s.routineDraft, updates);
          s.routineDraft.updatedAt = Date.now();
        }),

      addExerciseToRoutine: (exerciseId, exerciseName) =>
        set((s) => {
          if (!s.routineDraft) return;
          const order = s.routineDraft.exercises.length;
          s.routineDraft.exercises.push(defaultExerciseDraft(exerciseId, exerciseName, order));
          s.routineDraft.updatedAt = Date.now();
        }),

      removeExerciseFromRoutine: (draftExerciseId) =>
        set((s) => {
          if (!s.routineDraft) return;
          s.routineDraft.exercises = s.routineDraft.exercises
            .filter((e) => e.id !== draftExerciseId)
            .map((e, i) => ({ ...e, order: i }));
          s.routineDraft.updatedAt = Date.now();
        }),

      reorderRoutineExercises: (orderedIds) =>
        set((s) => {
          if (!s.routineDraft) return;
          const map = new Map(s.routineDraft.exercises.map((e) => [e.id, e]));
          s.routineDraft.exercises = orderedIds
            .map((id, i) => map.get(id) && { ...map.get(id)!, order: i })
            .filter(Boolean) as ExerciseDraft[];
          s.routineDraft.updatedAt = Date.now();
        }),

      addSetToExercise: (draftExerciseId) =>
        set((s) => {
          if (!s.routineDraft) return;
          const ex = s.routineDraft.exercises.find((e) => e.id === draftExerciseId);
          if (ex) { ex.sets.push(defaultSetDraft()); }
          s.routineDraft.updatedAt = Date.now();
        }),

      removeSetFromExercise: (draftExerciseId, setId) =>
        set((s) => {
          if (!s.routineDraft) return;
          const ex = s.routineDraft.exercises.find((e) => e.id === draftExerciseId);
          if (ex) { ex.sets = ex.sets.filter((sv) => sv.id !== setId); }
          s.routineDraft.updatedAt = Date.now();
        }),

      updateSetInExercise: (draftExerciseId, setId, updates) =>
        set((s) => {
          if (!s.routineDraft) return;
          const ex = s.routineDraft.exercises.find((e) => e.id === draftExerciseId);
          const sv = ex?.sets.find((sv) => sv.id === setId);
          if (sv) { Object.assign(sv, updates); }
          s.routineDraft.updatedAt = Date.now();
        }),

      updateExerciseNotes: (draftExerciseId, notes) =>
        set((s) => {
          if (!s.routineDraft) return;
          const ex = s.routineDraft.exercises.find((e) => e.id === draftExerciseId);
          if (ex) { ex.notes = notes; }
          s.routineDraft.updatedAt = Date.now();
        }),

      saveRoutine: async (apiSave) => {
        const { routineDraft, routinePhase } = get();
        if (!routineDraft || routinePhase.phase !== 'draft') return;

        const { draftId } = routinePhase;
        set((s) => { s.routinePhase = { phase: 'saving', draftId }; });

        try {
          const routineId = await apiSave(routineDraft);
          set((s) => {
            s.routinePhase = { phase: 'saved', routineId, name: routineDraft.name };
            s.routineDraft = null;
          });
        } catch (err: any) {
          set((s) => {
            s.routinePhase = { phase: 'error', error: err?.message ?? 'Save failed', draftId };
          });
          throw err;
        }
      },

      discardRoutine: () =>
        set((s) => {
          s.routinePhase = { phase: 'idle' };
          s.routineDraft = null;
        }),

      resetRoutineAfterNav: () =>
        set((s) => {
          if (s.routinePhase.phase === 'saved') {
            s.routinePhase = { phase: 'idle' };
          }
        }),

      // ── Template ───────────────────────────────────────────────────────────

      startTemplate: (opts) => {
        const draftId = genId();
        const mode    = opts?.templateId ? 'edit' : 'create';
        const draft: TemplateDraft = {
          draftId,
          name:          opts?.existingData?.name          ?? '',
          durationWeeks: opts?.existingData?.durationWeeks ?? 4,
          days:          opts?.existingData?.days          ?? defaultTemplateDays(),
          tags:          opts?.existingData?.tags          ?? [],
          isPublic:      opts?.existingData?.isPublic      ?? false,
          createdAt:     Date.now(),
          updatedAt:     Date.now(),
          ...opts?.existingData,
        };
        set((s) => {
          s.templatePhase = { phase: 'draft', draftId, mode, templateId: opts?.templateId };
          s.templateDraft = draft;
        });
        return draftId;
      },

      saveTemplateDraft: (updates) =>
        set((s) => {
          if (!s.templateDraft) return;
          Object.assign(s.templateDraft, updates);
          s.templateDraft.updatedAt = Date.now();
        }),

      setDayRestStatus: (dayId, isRestDay) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          if (day) { day.isRestDay = isRestDay; if (isRestDay) day.exercises = []; }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      setDayName: (dayId, name) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          if (day) { day.name = name; }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      addExerciseToDay: (dayId, exerciseId, exerciseName) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          if (day) {
            day.isRestDay = false;
            day.exercises.push(defaultExerciseDraft(exerciseId, exerciseName, day.exercises.length));
          }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      removeExerciseFromDay: (dayId, draftExerciseId) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          if (day) {
            day.exercises = day.exercises
              .filter((e) => e.id !== draftExerciseId)
              .map((e, i) => ({ ...e, order: i }));
          }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      reorderDayExercises: (dayId, orderedIds) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          if (day) {
            const map = new Map(day.exercises.map((e) => [e.id, e]));
            day.exercises = orderedIds
              .map((id, i) => map.get(id) && { ...map.get(id)!, order: i })
              .filter(Boolean) as ExerciseDraft[];
          }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      addSetToDayExercise: (dayId, draftExerciseId) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          const ex  = day?.exercises.find((e) => e.id === draftExerciseId);
          if (ex) { ex.sets.push(defaultSetDraft()); }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      removeSetFromDayExercise: (dayId, draftExerciseId, setId) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          const ex  = day?.exercises.find((e) => e.id === draftExerciseId);
          if (ex) { ex.sets = ex.sets.filter((sv) => sv.id !== setId); }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      updateSetInDayExercise: (dayId, draftExerciseId, setId, updates) =>
        set((s) => {
          const day = s.templateDraft?.days.find((d) => d.dayId === dayId);
          const ex  = day?.exercises.find((e) => e.id === draftExerciseId);
          const sv  = ex?.sets.find((sv) => sv.id === setId);
          if (sv) { Object.assign(sv, updates); }
          if (s.templateDraft) s.templateDraft.updatedAt = Date.now();
        }),

      saveTemplate: async (apiSave) => {
        const { templateDraft, templatePhase } = get();
        if (!templateDraft || templatePhase.phase !== 'draft') return;

        const { draftId } = templatePhase;
        set((s) => { s.templatePhase = { phase: 'saving', draftId }; });

        try {
          const templateId = await apiSave(templateDraft);
          set((s) => {
            s.templatePhase = { phase: 'saved', templateId, name: templateDraft.name };
            s.templateDraft = null;
          });
        } catch (err: any) {
          set((s) => {
            s.templatePhase = { phase: 'error', error: err?.message ?? 'Save failed', draftId };
          });
          throw err;
        }
      },

      discardTemplate: () =>
        set((s) => {
          s.templatePhase = { phase: 'idle' };
          s.templateDraft = null;
        }),

      resetTemplateAfterNav: () =>
        set((s) => {
          if (s.templatePhase.phase === 'saved') {
            s.templatePhase = { phase: 'idle' };
          }
        }),
    })),
    {
      name: 'creation-drafts-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectRoutinePhase   = (s: CreationStore) => s.routinePhase;
export const selectRoutineDraft   = (s: CreationStore) => s.routineDraft;
export const selectIsEditingRoutine = (s: CreationStore) => s.routinePhase.phase === 'draft';
export const selectIsSavingRoutine  = (s: CreationStore) => s.routinePhase.phase === 'saving';

export const selectTemplatePhase  = (s: CreationStore) => s.templatePhase;
export const selectTemplateDraft  = (s: CreationStore) => s.templateDraft;
export const selectIsEditingTemplate = (s: CreationStore) => s.templatePhase.phase === 'draft';
export const selectIsSavingTemplate  = (s: CreationStore) => s.templatePhase.phase === 'saving';

// Derived — exercises in current routine draft
export const selectRoutineExercises = (s: CreationStore) => s.routineDraft?.exercises ?? [];

// For legacy compat
export const useTemplateStore = useCreationStore;
