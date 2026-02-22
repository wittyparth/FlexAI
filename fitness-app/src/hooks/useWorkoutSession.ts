/**
 * useWorkoutSession — Unified hook for the active workout UI
 *
 * Provides all data + actions for WorkoutScreen / ActiveWorkoutScreen.
 * Manages local UI state (inputs, expanded cards) separately from global
 * state (sets, exercises in Zustand) to prevent spurious re-renders.
 *
 * Local: weightInput, repsInput, rpe, setType, editingSetId
 * Global: exercises, sets, timer, elapsedSeconds
 */

import { useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  useWorkoutStore,
  selectSessionPhase,
  selectExercises,
  selectSets,
  selectCurrentExerciseId,
  selectRestTimer,
  selectElapsedSeconds,
  selectTimerPrefs,
  selectIsActive,
} from '../store/workoutStore';

// ─── Local UI State (useReducer) ─────────────────────────────────────────────

export type SetType = 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';
const SET_TYPE_CYCLE: SetType[] = ['working', 'warmup', 'drop', 'failure', 'amrap'];

interface UIState {
  weightInput:        string;
  repsInput:          string;
  rpeInput:           number | null;
  setType:            SetType;
  editingSetId:       string | null;
  expandedExerciseId: number | null;
}

type UIAction =
  | { type: 'SET_WEIGHT';    value: string }
  | { type: 'SET_REPS';      value: string }
  | { type: 'SET_RPE';       value: number | null }
  | { type: 'CYCLE_SET_TYPE' }
  | { type: 'SET_SET_TYPE';  value: SetType }
  | { type: 'EDIT_SET';      setId: string; weight: string; reps: string; rpe: number | null; setType: SetType }
  | { type: 'CLEAR_EDIT' }
  | { type: 'LOG_SUCCESS';   weight: string; reps: string }
  | { type: 'EXPAND';        exerciseId: number | null }
  | { type: 'CHANGE_EXERCISE'; exerciseId: number; prefillWeight?: string; prefillReps?: string };

const initialUI: UIState = {
  weightInput:        '',
  repsInput:          '',
  rpeInput:           null,
  setType:            'working',
  editingSetId:       null,
  expandedExerciseId: null,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_WEIGHT':
      return { ...state, weightInput: action.value };
    case 'SET_REPS':
      return { ...state, repsInput: action.value };
    case 'SET_RPE':
      return { ...state, rpeInput: action.value };
    case 'CYCLE_SET_TYPE': {
      const next = (SET_TYPE_CYCLE.indexOf(state.setType) + 1) % SET_TYPE_CYCLE.length;
      return { ...state, setType: SET_TYPE_CYCLE[next] };
    }
    case 'SET_SET_TYPE':
      return { ...state, setType: action.value };
    case 'EDIT_SET':
      return {
        ...state,
        editingSetId: action.setId,
        weightInput:  action.weight,
        repsInput:    action.reps,
        rpeInput:     action.rpe,
        setType:      action.setType,
      };
    case 'CLEAR_EDIT':
      return { ...state, editingSetId: null };
    case 'LOG_SUCCESS':
      return {
        ...state,
        editingSetId: null,
        // Keep weight/reps prefilled for next set (common UX pattern)
        weightInput:  action.weight,
        repsInput:    action.reps,
      };
    case 'EXPAND':
      return { ...state, expandedExerciseId: action.exerciseId };
    case 'CHANGE_EXERCISE':
      return {
        ...state,
        expandedExerciseId: action.exerciseId,
        weightInput:        action.prefillWeight ?? '',
        repsInput:          action.prefillReps   ?? '',
        rpeInput:           null,
        setType:            'working',
        editingSetId:       null,
      };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkoutSession() {
  const [ui, dispatch] = useReducer(uiReducer, initialUI);

  // Global store — only subscribe to what changes frequently
  const isActive         = useWorkoutStore(selectIsActive);
  const sessionPhase     = useWorkoutStore(selectSessionPhase);
  const exercises        = useWorkoutStore(selectExercises);
  const sets             = useWorkoutStore(selectSets);
  const currentExerciseId = useWorkoutStore(selectCurrentExerciseId);
  const restTimer        = useWorkoutStore(selectRestTimer);
  const elapsedSeconds   = useWorkoutStore(selectElapsedSeconds);
  const timerPrefs       = useWorkoutStore(selectTimerPrefs);

  const { logSet, updateSet, deleteSet, startRest, stopRest, addExercise, removeExercise, setCurrentExercise } =
    useWorkoutStore.getState();

  // ── Derived ──────────────────────────────────────────────────────────────

  const currentExercise = useMemo(
    () => (currentExerciseId != null ? exercises[currentExerciseId] : null),
    [currentExerciseId, exercises],
  );

  const currentExerciseSets = useMemo(
    () =>
      currentExerciseId != null
        ? Object.values(sets).filter((s) => s.workoutExerciseId === currentExerciseId)
        : [],
    [currentExerciseId, sets],
  );

  const exerciseList = useMemo(
    () => Object.values(exercises).sort((a, b) => a.order - b.order),
    [exercises],
  );

  // Rest timer — remaining seconds (computed from endTimeMs, not a counter)
  const restRemainingSeconds = useMemo(() => {
    if (!restTimer.active) return 0;
    if (restTimer.paused) return restTimer.remainingSeconds;
    return Math.max(0, Math.ceil((restTimer.endTimeMs - Date.now()) / 1000));
  }, [restTimer]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleLogSet = useCallback(async () => {
    if (!currentExerciseId) return;
    const weight = parseFloat(ui.weightInput);
    const reps   = parseInt(ui.repsInput, 10);
    if (isNaN(weight) || isNaN(reps) || reps <= 0) return;

    await logSet(currentExerciseId, {
      weight,
      reps,
      rpe:     ui.rpeInput ?? undefined,
      setType: ui.setType,
    });

    dispatch({ type: 'LOG_SUCCESS', weight: ui.weightInput, reps: ui.repsInput });
  }, [currentExerciseId, ui.weightInput, ui.repsInput, ui.rpeInput, ui.setType, logSet]);

  const handleUpdateSet = useCallback(async (setId: string) => {
    const weight = parseFloat(ui.weightInput);
    const reps   = parseInt(ui.repsInput, 10);
    if (isNaN(weight) || isNaN(reps)) return;

    await updateSet(setId, {
      weight,
      reps,
      rpe:     ui.rpeInput ?? undefined,
      setType: ui.setType,
    });

    dispatch({ type: 'CLEAR_EDIT' });
  }, [ui.weightInput, ui.repsInput, ui.rpeInput, ui.setType, updateSet]);

  const handleDeleteSet = useCallback((exerciseId: number, setId: string) => {
    deleteSet(exerciseId, setId);
  }, [deleteSet]);

  const handleStartEdit = useCallback((setId: string) => {
    const sv = sets[setId];
    if (!sv) return;
    dispatch({
      type:    'EDIT_SET',
      setId,
      weight:  sv.weight?.toString() ?? '',
      reps:    sv.reps?.toString()   ?? '',
      rpe:     sv.rpe ?? null,
      setType: sv.setType as SetType,
    });
  }, [sets]);

  const handleChangeExercise = useCallback((exerciseId: number) => {
    setCurrentExercise(exerciseId);
    // Prefill from last set of that exercise
    const exSets = Object.values(sets)
      .filter((s) => s.workoutExerciseId === exerciseId)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const last = exSets[exSets.length - 1];
    dispatch({
      type:           'CHANGE_EXERCISE',
      exerciseId,
      prefillWeight:  last?.weight?.toString(),
      prefillReps:    last?.reps?.toString(),
    });
  }, [setCurrentExercise, sets]);

  const handleAddExercise = useCallback(async (exerciseId: number, notes?: string) => {
    await addExercise(exerciseId, notes);
  }, [addExercise]);

  const handleRemoveExercise = useCallback(async (workoutExerciseId: number) => {
    await removeExercise(workoutExerciseId);
  }, [removeExercise]);

  const handleStartRest = useCallback((seconds?: number) => {
    startRest(seconds ?? timerPrefs.defaultSeconds);
  }, [startRest, timerPrefs.defaultSeconds]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // Session
    isActive,
    sessionPhase,
    elapsedSeconds,

    // Exercises & Sets
    exerciseList,
    exercises,
    sets,
    currentExercise,
    currentExerciseId,
    currentExerciseSets,

    // Rest timer
    restTimer,
    restRemainingSeconds,
    isResting: restTimer.active,

    // Local UI state
    ui,
    dispatch,

    // Actions
    handleLogSet,
    handleUpdateSet,
    handleDeleteSet,
    handleStartEdit,
    handleChangeExercise,
    handleAddExercise,
    handleRemoveExercise,
    handleStartRest,
    stopRest,
  };
}
