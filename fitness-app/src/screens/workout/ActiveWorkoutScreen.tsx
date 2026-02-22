/**
 * ActiveWorkoutScreen — Redesigned with scrollable exercise list layout.
 * Industry-standard design (like Strong/Hevy): all exercises visible vertically
 * with inline set tables and collapsible cards.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { useShallow } from 'zustand/react/shallow';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { ExerciseCard } from '../../components/active-workout/ExerciseCard';
import { RestTimerOverlay } from '../../components/active-workout/RestTimerOverlay';
import { TimerSettingsModal } from '../../components/active-workout/TimerSettingsModal';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';
import { useWorkoutStore, selectActiveWorkoutId, selectWorkoutName, selectTimerPrefs } from '../../store/workoutStore';
import { useFlowGuard } from '../../hooks/useFlowGuard';

export function ActiveWorkoutScreen({ navigation, route }: any) {
  useFlowGuard('workout_active'); // redirect back if no active session
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const lastHandledSelectionKeyRef = useRef<string | null>(null);
  const workoutSyncAttemptRef = useRef<number | null>(null);

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [completeModalVisible, setCompleteModalVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [isMuscleMapCollapsed, setIsMuscleMapCollapsed] = React.useState(false);
  const [isSyncingWorkout, setIsSyncingWorkout] = React.useState(false);

  const {
    sessionPhase,
    elapsedSeconds,
    exerciseList: exercises,
    sets,
    restTimer,
    restRemainingSeconds,
    isResting,
    ui: { weightInput, repsInput, rpeInput, setType, editingSetId, expandedExerciseId },
    dispatch,
    handleLogSet,
    handleUpdateSet,
    handleDeleteSet,
    handleStartEdit: beginEditSet,
    handleChangeExercise: handleExpandExercise,
    handleAddExercise: addExercise,
    handleRemoveExercise: removeExercise,
    handleStartRest: handleStartManualRest,
    stopRest,
  } = useWorkoutSession();

  // ── Compatibility shims ────────────────────────────────────────────────────
  const activeWorkoutId   = useWorkoutStore(selectActiveWorkoutId);
  const workoutName       = useWorkoutStore(selectWorkoutName);
  const timerPrefs        = useWorkoutStore(selectTimerPrefs);

  const isLoading           = sessionPhase.phase === 'starting';
  const isRestPaused        = restTimer.active && restTimer.paused;
  const restRemaining       = restRemainingSeconds;
  const restDurationSeconds = restTimer.active ? (restTimer as any).durationSeconds : timerPrefs.defaultSeconds;
  const defaultTimerSeconds = timerPrefs.defaultSeconds;
  const lastLoggedSet: any  = null; // Not tracked separately; inputs stay prefilled

  // Build setsByExercise (Record<workoutExerciseId, Set[]>) for muscle highlighter
  const setsByExercise = useMemo(() => {
    const result: Record<number, any[]> = {};
    Object.values(sets).forEach((s) => {
      if (!result[s.workoutExerciseId]) result[s.workoutExerciseId] = [];
      result[s.workoutExerciseId].push(s);
    });
    return result;
  }, [sets]);

  // Stats
  const totalSetsTarget    = useMemo(() => exercises.reduce((sum, ex) => sum + (ex.targetSets ?? 3), 0), [exercises]);
  const totalSetsCompleted = useMemo(() => Object.values(sets).filter((s) => s.status !== 'pending').length, [sets]);
  const totalVolume        = useMemo(() => Object.values(sets).reduce((sum, s) => sum + ((s.weight ?? 0) * (s.reps ?? 0)), 0), [sets]);
  const progressPercent    = totalSetsTarget > 0 ? totalSetsCompleted / totalSetsTarget : 0;

  const { completeWorkout, cancelWorkout, pauseRest } = useWorkoutStore.getState();
  const deleteSet   = useCallback((exerciseId: number, setId: string) => handleDeleteSet(exerciseId, setId), [handleDeleteSet]);
  const extendRest  = useCallback((extra: number) => handleStartManualRest(restRemainingSeconds + extra), [handleStartManualRest, restRemainingSeconds]);
  const handleSkipRest  = stopRest;
  const handlePauseRest = pauseRest;
  const cycleSetType    = useCallback(() => dispatch({ type: 'CYCLE_SET_TYPE' }), [dispatch]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const formatVolume = useCallback((vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return String(Math.round(vol));
  }, []);

  useEffect(() => {
    const selectedExercise = route.params?.selectedExercise;
    const selectedExercises = Array.isArray(route.params?.selectedExercises)
      ? route.params.selectedExercises
      : (selectedExercise?.id ? [selectedExercise] : []);
    const selectionToken = route.params?.selectionToken;
    const selectionKey = selectionToken
      ? `token-${selectionToken}`
      : (selectedExercise?.id ? `legacy-${selectedExercise.id}` : null);

    if (!selectionKey || selectedExercises.length === 0) {
      return;
    }

    if (lastHandledSelectionKeyRef.current === selectionKey) {
      return;
    }

    lastHandledSelectionKeyRef.current = selectionKey;

    const applySelectedExercises = async () => {
      const existingExerciseIds = new Set(
        exercises.map((exerciseItem: any) => Number(exerciseItem.exerciseId))
      );
      const seenInBatch = new Set<number>();

      const queue = selectedExercises.filter((exerciseItem: any) => {
        const exerciseId = Number(exerciseItem?.id);
        if (!exerciseId || Number.isNaN(exerciseId)) return false;
        if (existingExerciseIds.has(exerciseId)) return false;
        if (seenInBatch.has(exerciseId)) return false;
        seenInBatch.add(exerciseId);
        return true;
      });

      const skippedCount = selectedExercises.length - queue.length;

      for (const exerciseItem of queue) {
        await addExercise(exerciseItem.id, exerciseItem.notes);
      }

      if (skippedCount > 0) {
        Alert.alert(
          'Some exercises were skipped',
          `${skippedCount} selected exercise(s) were already in this workout.`
        );
      }
    };

    applySelectedExercises()
      .catch((error: any) => {
        Alert.alert('Unable to add exercise', error?.message || 'Please try again.');
      })
      .finally(() => {
        navigation.setParams({
          selectedExercise: undefined,
          selectedExercises: undefined,
          selectionToken: undefined,
        });
      });
  }, [
    route.params?.selectedExercise,
    route.params?.selectedExercises,
    route.params?.selectionToken,
    addExercise,
    navigation,
    exercises,
  ]);

  // ─── Navigate away if no active workout ───
  useEffect(() => {
    if (!activeWorkoutId) {
      navigation.canGoBack() ? navigation.goBack() : navigation.navigate('WorkoutHub');
    }
  }, [activeWorkoutId, navigation]);

  // ─── Rest timer auto-skip ───
  useEffect(() => {
    if (isResting && restRemaining <= 0) {
      // Grace period: slight delay before auto-dismissing
      const timeout = setTimeout(() => {
        stopRest();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isResting, restRemaining, stopRest]);

  // If we have an active workout but no local exercises, force a one-time sync before rendering empty state.
  useEffect(() => {
    if (!activeWorkoutId) {
      workoutSyncAttemptRef.current = null;
      setIsSyncingWorkout(false);
      return;
    }

    if (exercises.length > 0) {
      workoutSyncAttemptRef.current = activeWorkoutId;
      setIsSyncingWorkout(false);
      return;
    }

    if (workoutSyncAttemptRef.current === activeWorkoutId) {
      return;
    }

    workoutSyncAttemptRef.current = activeWorkoutId;
    setIsSyncingWorkout(true);

    useWorkoutStore
      .getState()
      .syncCurrentWorkout()
      .finally(() => {
        setIsSyncingWorkout(false);
      });
  }, [activeWorkoutId, exercises.length]);

  // ─── Handlers ───
  const handleComplete = useCallback(() => {
    setCompleteModalVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setCancelModalVisible(true);
  }, []);

  const handleRemoveExercise = useCallback((exerciseId: number) => {
    Alert.alert(
      'Remove exercise?',
      'This will remove all logged sets for this exercise.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeExercise(exerciseId).catch((error: any) => {
              Alert.alert('Unable to remove exercise', error?.message || 'Please try again.');
            });
          },
        },
      ]
    );
  }, [removeExercise]);

  const handleMinimize = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ─── Computed ───
  const nextExerciseAfterRest = exercises.find((_, i) => {
    if (i === 0) return false;
    const prev = exercises[i - 1];
    return prev.id === expandedExerciseId;
  });

  const handleNextExercise = useCallback(() => {
    if (nextExerciseAfterRest?.id) {
      handleExpandExercise(nextExerciseAfterRest.id);
    }
    handleSkipRest();
  }, [nextExerciseAfterRest, handleExpandExercise, handleSkipRest]);

  const workoutMuscleSets = useMemo(() => {
    const distribution: Record<string, number> = {};

    exercises.forEach((exerciseItem) => {
      const primaryMuscle = exerciseItem.primaryMuscle;
      if (!primaryMuscle) return;

      // Only count sets that have been actually logged (status !== 'pending')
      const allSetsForExercise = setsByExercise[exerciseItem.id] || [];
      const completedSets = allSetsForExercise.filter((s: any) => s.status !== 'pending').length;

      // Skip exercise entirely if no sets have been completed yet
      if (completedSets === 0) return;

      distribution[primaryMuscle] = (distribution[primaryMuscle] ?? 0) + completedSets;

      const secondary = exerciseItem.secondaryMuscles ?? [];
      secondary.forEach((muscle: string) => {
        distribution[muscle] = (distribution[muscle] ?? 0) + completedSets * 0.45;
      });
    });

    return distribution;
  }, [exercises, setsByExercise]);

  // ─── Empty state ───
  if (!activeWorkoutId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="dumbbell" size={48} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No active workout found</Text>
      </View>
    );
  }

  if (exercises.length === 0) {
    if (isLoading || isSyncingWorkout) {
      return (
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>Syncing workout...</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="dumbbell" size={48} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No exercises in this workout</Text>
        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={[styles.emptyBtn, { borderColor: colors.primary.main }]}
            onPress={() => navigation.navigate('ExercisePicker', { returnTo: 'ActiveWorkout', multiSelect: true })}
          >
            <Text style={{ color: colors.primary.main }}>Add Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.emptyBtn, { borderColor: colors.border }]}
            onPress={handleCancel}
          >
            <Text style={{ color: colors.error }}>Cancel Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ─── TOP BAR ─── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        {/* Row 1: Nav + Title + Actions */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleMinimize} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
            <Ionicons name="chevron-down" size={22} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <Text style={[styles.workoutTitle, { color: colors.foreground }]} numberOfLines={1}>
              {workoutName || 'Workout'}
            </Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
              <Ionicons name="settings-outline" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
              <MaterialCommunityIcons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleComplete}
              style={[styles.finishBtn, { backgroundColor: colors.primary.main }]}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Timer + Stats */}
        <View style={styles.statsBar}>
          {/* Timer */}
          <View style={styles.timerChip}>
            <View style={styles.liveDot} />
            <Text style={[styles.timerText, { color: colors.foreground }]}>
              {formatTime(elapsedSeconds)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.restBtn,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                opacity: isResting ? 0.65 : 1,
              },
            ]}
            onPress={() => handleStartManualRest(defaultTimerSeconds)}
            disabled={isResting}
            activeOpacity={0.8}
          >
            <Ionicons name="timer-outline" size={14} color={colors.foreground} />
            <Text style={[styles.restBtnText, { color: colors.foreground }]}>
              {isResting ? 'Resting' : `Rest ${defaultTimerSeconds}s`}
            </Text>
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{totalSetsCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>/{totalSetsTarget} sets</Text>
          </View>

          {/* Volume */}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{formatVolume(totalVolume)}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}> lbs</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` as any }]}
          />
        </View>
      </View>

      {/* ─── EXERCISE LIST ─── */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.muscleMapWrap}>
          <View style={[styles.muscleMapHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.muscleMapTitle, { color: colors.foreground }]}>Live Muscle Stimulation</Text>
            <TouchableOpacity
              style={[styles.muscleMapToggle, { backgroundColor: colors.muted }]}
              onPress={() => setIsMuscleMapCollapsed((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={[styles.muscleMapToggleText, { color: colors.foreground }]}>
                {isMuscleMapCollapsed ? 'Expand' : 'Collapse'}
              </Text>
              <Ionicons
                name={isMuscleMapCollapsed ? 'chevron-down' : 'chevron-up'}
                size={14}
                color={colors.foreground}
              />
            </TouchableOpacity>
          </View>

          {!isMuscleMapCollapsed && (
            <>
              {Object.keys(workoutMuscleSets).length === 0 ? (
                <View style={styles.muscleMapEmpty}>
                  <Text style={[styles.muscleMapEmptyText, { color: colors.mutedForeground }]}>
                    Complete a set to see muscle stimulation
                  </Text>
                </View>
              ) : (
                <MuscleHighlighterCard
                  subtitle="Showing muscles targeted by completed sets only."
                  muscleSets={workoutMuscleSets}
                  compact
                />
              )}
            </>
          )}
        </View>

        {exercises.map((exercise) => {
          const sets = setsByExercise[exercise.id] || [];
          const isExpanded = expandedExerciseId === exercise.id;
          const isActiveExercise = isExpanded; // Active == expanded for input

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completedSets={sets}
              isExpanded={isExpanded}
              isActive={isActiveExercise}
              weightInput={isActiveExercise ? weightInput : ''}
              repsInput={isActiveExercise ? repsInput : ''}
              rpeInput={isActiveExercise ? rpeInput : null}
              setType={isActiveExercise ? setType : 'working'}
              editingSetId={isActiveExercise ? editingSetId : null}
              isLoading={isLoading}
              onToggleExpand={handleExpandExercise}
              onWeightChange={(v) => dispatch({ type: 'SET_WEIGHT', value: v })}
              onRepsChange={(v) => dispatch({ type: 'SET_REPS', value: v })}
              onRpeChange={(v) => dispatch({ type: 'SET_RPE', value: v })}
              onSetTypeChange={cycleSetType}
              onBeginEditSet={beginEditSet}
              onLogSet={() => { handleExpandExercise(exercise.id); handleLogSet(); }}
              onDeleteSet={deleteSet}
              onRemoveExercise={handleRemoveExercise}
            />
          );
        })}

        {/* Add Exercise placeholder */}
        <TouchableOpacity
          style={[styles.addExerciseBtn, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('ExercisePicker', { returnTo: 'ActiveWorkout', multiSelect: true })}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
          <Text style={[styles.addExerciseText, { color: colors.primary.main }]}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── REST TIMER OVERLAY ─── */}
      <RestTimerOverlay
        isVisible={isResting}
        isPaused={isRestPaused}
        durationSeconds={restDurationSeconds}
        elapsedSeconds={restDurationSeconds - restRemaining}
        onAddTime={(seconds) => extendRest(seconds)}
        onPauseToggle={handlePauseRest}
        onNextExercise={nextExerciseAfterRest ? handleNextExercise : undefined}
        onSkip={handleSkipRest}
        onClose={handleSkipRest}
        onOpenSettings={() => setSettingsModalVisible(true)}
        nextExerciseName={nextExerciseAfterRest?.exerciseName}
        nextSetNumber={(nextExerciseAfterRest
          ? setsByExercise[nextExerciseAfterRest.id]?.length ?? 0
          : 0) + 1}
        nextReps={
          nextExerciseAfterRest?.targetRepsMin
            ? `${nextExerciseAfterRest.targetRepsMin}–${nextExerciseAfterRest.targetRepsMax} reps`
            : undefined
        }
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      )}

      {/* ─── MODALS ─── */}
      <CustomAlert
        visible={cancelModalVisible}
        title="Discard Workout?"
        message="Are you sure you want to discard this workout? All progress will be lost."
        danger={true}
        primaryActionLabel="Discard"
        secondaryActionLabel="Back"
        onPrimaryPress={async () => {
          setCancelModalVisible(false);
          await cancelWorkout();
          navigation.goBack();
        }}
        onSecondaryPress={() => setCancelModalVisible(false)}
      />

      <CustomAlert
        visible={completeModalVisible}
        title="Finish Workout?"
        message={`You've completed ${totalSetsCompleted} sets with ${formatVolume(totalVolume)} lbs total volume.`}
        primaryActionLabel="Complete"
        secondaryActionLabel="Cancel"
        onPrimaryPress={async () => {
          setCompleteModalVisible(false);
          await completeWorkout({});
          // Store transitions to 'completed' phase with summary embedded.
          // WorkoutSummaryScreen reads selectCompletedSummary from the store.
          navigation.navigate('WorkoutSummary', {
            workoutId: activeWorkoutId,
            workoutName: workoutName || 'Workout Session',
          });
        }}
        onSecondaryPress={() => setCompleteModalVisible(false)}
      />

      <TimerSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ─── Top Bar ───
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fontFamilies.display,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 12,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── Stats Bar ───
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
  },
  restBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontFamilies.mono,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  timerText: {
    fontFamily: fontFamilies.mono,
    fontSize: 16,
    fontWeight: '700',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontFamily: fontFamilies.mono,
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ─── Progress Bar ───
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ─── Scroll Area ───
  scrollArea: {
    flex: 1,
  },

  // ─── Add Exercise ───
  muscleMapWrap: {
    marginTop: 10,
    marginBottom: 12,
    gap: 8,
  },
  muscleMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  muscleMapTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  muscleMapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  muscleMapToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  muscleMapEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleMapEmptyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ─── Empty State ───
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  // ─── Loading ───
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
