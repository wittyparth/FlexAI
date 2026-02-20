/**
 * useActiveWorkout — Session-local UI state for the active workout screen.
 * 
 * Uses useReducer for atomic state transitions (log → rest → next exercise).
 * Global workout data (exercises, sets) lives in workoutStore (zustand).
 * This hook manages only ephemeral UI state: inputs, rest timer, expanded cards.
 */

import { useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { useShallow } from 'zustand/react/shallow';
import { WorkoutSet } from '../types/backend.types';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────

export type SetType = 'warmup' | 'working' | 'drop' | 'failure' | 'amrap';

interface ActiveWorkoutState {
  weightInput: string;
  repsInput: string;
  rpeInput: number | null;
  setType: SetType;
  editingSetId: string | null;
  expandedExerciseId: number | null;
  lastLoggedSet: { weight: number; reps: number; rpe?: number; setType: SetType } | null;
}

type Action =
  | { type: 'UPDATE_INPUT'; field: 'weightInput' | 'repsInput'; value: string }
  | { type: 'SET_RPE'; value: number | null }
  | { type: 'SET_SET_TYPE'; value: SetType }
  | { type: 'SET_EXPANDED_EXERCISE'; exerciseId: number }
  | { type: 'START_EDIT_SET'; setId: string; weight: string; reps: string; rpe: number | null; setType: SetType }
  | { type: 'CLEAR_EDIT_SET' }
  | { type: 'LOG_SET_SUCCESS'; weight: number; reps: number; rpe?: number; setType: SetType }
  | { type: 'CHANGE_EXERCISE'; exerciseId: number; prefillWeight?: string; prefillReps?: string; restSeconds?: number }
  | { type: 'EXPAND_EXERCISE'; exerciseId: number | null }
  | { type: 'RESET_INPUTS' };

const SET_TYPE_CYCLE: SetType[] = ['working', 'warmup', 'drop', 'failure', 'amrap'];

// ─────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────

function reducer(state: ActiveWorkoutState, action: Action): ActiveWorkoutState {
  switch (action.type) {
    case 'UPDATE_INPUT':
      return { ...state, [action.field]: action.value };

    case 'SET_RPE':
      return { ...state, rpeInput: action.value };

    case 'SET_SET_TYPE':
      return { ...state, setType: action.value };

    case 'SET_EXPANDED_EXERCISE':
      return { ...state, expandedExerciseId: action.exerciseId };

    case 'START_EDIT_SET':
      return {
        ...state,
        editingSetId: action.setId,
        weightInput: action.weight,
        repsInput: action.reps,
        rpeInput: action.rpe,
        setType: action.setType,
      };

    case 'CLEAR_EDIT_SET':
      return {
        ...state,
        editingSetId: null,
        repsInput: '',
        rpeInput: null,
        setType: 'working',
      };

    case 'LOG_SET_SUCCESS':
      return {
        ...state,
        editingSetId: null,
        // Keep weight for next set (same exercise), clear reps
        repsInput: '',
        rpeInput: null,
        setType: 'working',
        lastLoggedSet: {
          weight: action.weight,
          reps: action.reps,
          rpe: action.rpe,
          setType: action.setType,
        },
      };

    case 'CHANGE_EXERCISE':
      return {
        ...state,
        editingSetId: null,
        weightInput: action.prefillWeight || '',
        repsInput: action.prefillReps || '',
        rpeInput: null,
        setType: 'working',
        expandedExerciseId: action.exerciseId,
        lastLoggedSet: null,
      };

    case 'EXPAND_EXERCISE':
      return {
        ...state,
        editingSetId: null,
        expandedExerciseId: state.expandedExerciseId === action.exerciseId ? null : action.exerciseId,
      };

    case 'RESET_INPUTS':
      return {
        ...state,
        editingSetId: null,
        weightInput: '',
        repsInput: '',
        rpeInput: null,
        setType: 'working',
        lastLoggedSet: null,
      };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────

export function useActiveWorkout() {
  // ──── Store Connection ────
  const store = useWorkoutStore(useShallow(state => ({
    activeWorkoutId: state.activeWorkoutId,
    workoutName: state.workoutName,
    exercisesMap: state.exercises,
    setsMap: state.sets,
    elapsedSeconds: state.elapsedSeconds,
    isLoading: state.isLoading,
    status: state.status,
    currentExerciseId: state.currentExerciseId,
    isResting: state.isResting,
    restEndTime: state.restEndTime,
    restDurationSeconds: state.restDurationSeconds,
    autoStartTimer: state.autoStartTimer,
    defaultTimerSeconds: state.defaultTimerSeconds,
  })));

  const {
    logSet: storeLogSet,
    updateSet: storeUpdateSet,
    deleteSet: storeDeleteSet,
    addExercise: storeAddExercise,
    removeExercise: storeRemoveExercise,
    completeWorkout,
    cancelWorkout,
    tick,
    minimize,
    setCurrentExercise,
    startRest,
    stopRest,
  } = useWorkoutStore(useShallow(state => ({
    logSet: state.logSet,
    updateSet: state.updateSet,
    deleteSet: state.deleteSet,
    addExercise: state.addExercise,
    removeExercise: state.removeExercise,
    completeWorkout: state.completeWorkout,
    cancelWorkout: state.cancelWorkout,
    tick: state.tick,
    minimize: state.minimize,
    setCurrentExercise: state.setCurrentExercise,
    startRest: state.startRest,
    stopRest: state.stopRest,
  })));

  // ──── Derived Data ────
  const exercises = useMemo(() =>
    Object.values(store.exercisesMap).sort((a, b) => a.orderIndex - b.orderIndex),
    [store.exercisesMap]
  );

  const setsByExercise = useMemo(() => {
    const grouped: Record<number, WorkoutSet[]> = {};
    Object.values(store.setsMap).forEach(set => {
      if (!grouped[set.workoutExerciseId]) {
        grouped[set.workoutExerciseId] = [];
      }
      grouped[set.workoutExerciseId].push(set);
    });
    return grouped;
  }, [store.setsMap]);

  const totalSetsTarget = useMemo(() =>
    exercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0),
    [exercises]
  );

  const totalSetsCompleted = Object.values(store.setsMap).length;
  const totalVolume = useMemo(() =>
    Object.values(store.setsMap).reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0),
    [store.setsMap]
  );
  const progressPercent = totalSetsTarget > 0 ? (totalSetsCompleted / totalSetsTarget) * 100 : 0;

  // ──── Local State ────
  const firstExerciseId = exercises.length > 0 ? exercises[0].id : null;
  const initialExpandedId = store.currentExerciseId || firstExerciseId;

  const [state, dispatch] = useReducer(reducer, {
    weightInput: '',
    repsInput: '',
    rpeInput: null,
    setType: 'working' as SetType,
    editingSetId: null,
    expandedExerciseId: initialExpandedId,
    lastLoggedSet: null,
  });

  // ──── Timer Effect ────
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!store.activeWorkoutId) return;
    const interval = setInterval(() => tickRef.current(), 1000);
    return () => clearInterval(interval);
  }, [store.activeWorkoutId]);

  // ──── Rest Timer Remaining ────
  const restRemaining = useMemo(() => {
    if (!store.isResting || !store.restEndTime) return 0;
    const remaining = Math.max(0, Math.floor((new Date(store.restEndTime).getTime() - Date.now()) / 1000));
    return remaining;
  }, [store.isResting, store.restEndTime, store.elapsedSeconds]); // elapsedSeconds triggers re-calc each second

  // ──── Actions ────
  const handleLogSet = useCallback(async (exerciseId: number) => {
    const weight = parseFloat(state.weightInput) || 0;
    const reps = parseInt(state.repsInput) || 0;
    if (reps === 0) return { success: false, error: 'Missing reps' };

    try {
      if (state.editingSetId) {
        await storeUpdateSet(state.editingSetId, {
          weight,
          reps,
          rpe: state.rpeInput || undefined,
          setType: state.setType,
        });
        dispatch({ type: 'CLEAR_EDIT_SET' });
        return { success: true };
      }

      await storeLogSet(exerciseId, {
        weight,
        reps,
        rpe: state.rpeInput || undefined,
        setType: state.setType,
      });

      dispatch({ type: 'LOG_SET_SUCCESS', weight, reps, rpe: state.rpeInput || undefined, setType: state.setType });

      // Find exercise rest time
      const exercise = store.exercisesMap[exerciseId];
      const restDuration = exercise?.restSeconds || store.defaultTimerSeconds || 90;
      
      if (store.autoStartTimer) {
        startRest(restDuration);
      }

      // Auto-advance to next exercise if target sets reached
      const currentSets = (setsByExercise[exerciseId] || []).length + 1; // +1 for the set we just logged
      const targetSets = exercise?.targetSets || 3;
      if (currentSets >= targetSets) {
        const currentIndex = exercises.findIndex(e => e.id === exerciseId);
        if (currentIndex < exercises.length - 1) {
          const nextEx = exercises[currentIndex + 1];
          setCurrentExercise(nextEx.id);
          // Don't dispatch CHANGE_EXERCISE yet — let rest timer finish first
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to log set' };
    }
  }, [state.weightInput, state.repsInput, state.rpeInput, state.setType, state.editingSetId, storeLogSet, storeUpdateSet, store.exercisesMap, setsByExercise, exercises, startRest, setCurrentExercise]);

  const handleSkipRest = useCallback(() => {
    stopRest();
  }, [stopRest]);

  const handleExpandExercise = useCallback((exerciseId: number) => {
    dispatch({ type: 'EXPAND_EXERCISE', exerciseId });
    setCurrentExercise(exerciseId);

    // Pre-fill inputs for the newly expanded exercise
    const exercise = store.exercisesMap[exerciseId];
    const existingSets = setsByExercise[exerciseId] || [];
    let prefillWeight = '';
    let prefillReps = '';

    if (existingSets.length > 0) {
      const lastSet = existingSets[existingSets.length - 1];
      prefillWeight = lastSet.weight?.toString() || '';
      prefillReps = lastSet.reps?.toString() || '';
    } else if (exercise) {
      prefillWeight = exercise.targetWeight?.toString() || '';
    }

    dispatch({ type: 'UPDATE_INPUT', field: 'weightInput', value: prefillWeight });
    dispatch({ type: 'UPDATE_INPUT', field: 'repsInput', value: prefillReps });
  }, [store.exercisesMap, setsByExercise, setCurrentExercise]);

  const beginEditSet = useCallback((setId: string, setItem: WorkoutSet) => {
    const exerciseId = setItem.workoutExerciseId;
    setCurrentExercise(exerciseId);
    dispatch({ type: 'SET_EXPANDED_EXERCISE', exerciseId });
    dispatch({
      type: 'START_EDIT_SET',
      setId,
      weight: setItem.weight?.toString() || '',
      reps: setItem.reps?.toString() || '',
      rpe: setItem.rpe ?? null,
      setType: (setItem.setType as SetType) || 'working',
    });
  }, [setCurrentExercise]);

  const cycleSetType = useCallback(() => {
    const currentIndex = SET_TYPE_CYCLE.indexOf(state.setType);
    const nextType = SET_TYPE_CYCLE[(currentIndex + 1) % SET_TYPE_CYCLE.length];
    dispatch({ type: 'SET_SET_TYPE', value: nextType });
  }, [state.setType]);

  // ──── Helpers ────
  const formatTime = useCallback((secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const formatVolume = useCallback((v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return v.toString();
  }, []);

  return {
    // Store data
    activeWorkoutId: store.activeWorkoutId,
    workoutName: store.workoutName,
    elapsedSeconds: store.elapsedSeconds,
    isLoading: store.isLoading,
    status: store.status,
    isResting: store.isResting,
    restRemaining,
    restDurationSeconds: store.restDurationSeconds,

    // Derived
    exercises,
    setsByExercise,
    totalSetsTarget,
    totalSetsCompleted,
    totalVolume,
    progressPercent,

    // Local state
    ...state,

    // Dispatchers
    dispatch,
    handleLogSet,
    handleSkipRest,
    handleExpandExercise,
    beginEditSet,
    cycleSetType,

    // Store actions
    completeWorkout,
    cancelWorkout,
    addExercise: storeAddExercise,
    removeExercise: storeRemoveExercise,
    minimize,
    deleteSet: storeDeleteSet,
    stopRest,
    startRest,

    // Helpers
    formatTime,
    formatVolume,
  };
}
