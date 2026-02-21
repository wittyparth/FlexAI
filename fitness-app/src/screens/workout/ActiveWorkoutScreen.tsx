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
import { useActiveWorkout } from '../../hooks/useActiveWorkout';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { ExerciseCard } from '../../components/active-workout/ExerciseCard';
import { RestTimerOverlay } from '../../components/active-workout/RestTimerOverlay';
import { TimerSettingsModal } from '../../components/active-workout/TimerSettingsModal';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';

export function ActiveWorkoutScreen({ navigation, route }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const lastHandledSelectionKeyRef = useRef<string | null>(null);

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [completeModalVisible, setCompleteModalVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [isMuscleMapCollapsed, setIsMuscleMapCollapsed] = React.useState(false);

  const {
    // Store data
    activeWorkoutId,
    workoutName,
    elapsedSeconds,
    isLoading,
    isResting,
    isRestPaused,
    restRemaining,
    restDurationSeconds,
    defaultTimerSeconds,

    // Derived
    exercises,
    setsByExercise,
    totalSetsTarget,
    totalSetsCompleted,
    totalVolume,
    progressPercent,

    // Local state
    weightInput,
    repsInput,
    rpeInput,
    setType,
    editingSetId,
    expandedExerciseId,
    lastLoggedSet,

    // Dispatchers
    dispatch,
    handleLogSet,
    handleSkipRest,
    handlePauseRest,
    handleStartManualRest,
    handleExpandExercise,
    beginEditSet,
    cycleSetType,

    // Store actions
    completeWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    deleteSet,
    stopRest,
    extendRest,

    // Helpers
    formatTime,
    formatVolume,
  } = useActiveWorkout();

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

    exercises.forEach((exerciseItem: any) => {
      const exerciseMeta = exerciseItem?.exercise ?? {};
      const primaryMuscle = exerciseMeta?.muscleGroup
        || (Array.isArray(exerciseMeta?.primaryMuscleGroups) ? exerciseMeta.primaryMuscleGroups[0] : undefined);
      if (!primaryMuscle) return;

      const completedSets = (setsByExercise[exerciseItem.id] || []).length;
      const targetSets = Number(exerciseItem?.targetSets || 0);
      const baseScore = completedSets > 0
        ? completedSets
        : Math.max(1, Math.round(Math.max(targetSets, 3) * 0.35));

      distribution[primaryMuscle] = (distribution[primaryMuscle] ?? 0) + baseScore;

      const secondary = Array.isArray(exerciseMeta?.secondaryMuscleGroups)
        ? exerciseMeta.secondaryMuscleGroups
        : [];
      secondary.forEach((muscle: string) => {
        distribution[muscle] = (distribution[muscle] ?? 0) + baseScore * 0.45;
      });
    });

    return distribution;
  }, [exercises, setsByExercise]);

  // ─── Empty state ───
  if (!activeWorkoutId || exercises.length === 0) {
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
            onPress={handleStartManualRest}
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
            <MuscleHighlighterCard
              subtitle="Updates as you log sets, based on current workout focus."
              muscleSets={workoutMuscleSets}
              compact
            />
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
              onWeightChange={(v) => dispatch({ type: 'UPDATE_INPUT', field: 'weightInput', value: v })}
              onRepsChange={(v) => dispatch({ type: 'UPDATE_INPUT', field: 'repsInput', value: v })}
              onRpeChange={(v) => dispatch({ type: 'SET_RPE', value: v })}
              onSetTypeChange={cycleSetType}
              onBeginEditSet={beginEditSet}
              onLogSet={() => handleLogSet(exercise.id)}
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
        nextExerciseName={nextExerciseAfterRest?.exercise?.name}
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
          navigation.navigate('WorkoutSummary', {
            workoutId: activeWorkoutId,
            workoutName: workoutName || 'Workout Session',
            elapsedSeconds,
            totalVolume,
            totalSetsCompleted,
            totalSetsTarget,
            muscleSets: workoutMuscleSets,
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
