/**
 * ActiveWorkoutScreen — Redesigned with scrollable exercise list layout.
 * Industry-standard design (like Strong/Hevy): all exercises visible vertically
 * with inline set tables and collapsible cards.
 */

import React, { useCallback, useEffect, useRef } from 'react';
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

export function ActiveWorkoutScreen({ navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [completeModalVisible, setCompleteModalVisible] = React.useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);

  const {
    // Store data
    activeWorkoutId,
    workoutName,
    elapsedSeconds,
    isLoading,
    isResting,
    restRemaining,
    restDurationSeconds,

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
    expandedExerciseId,
    lastLoggedSet,

    // Dispatchers
    dispatch,
    handleLogSet,
    handleSkipRest,
    handleExpandExercise,
    cycleSetType,

    // Store actions
    completeWorkout,
    cancelWorkout,
    deleteSet,
    stopRest,

    // Helpers
    formatTime,
    formatVolume,
  } = useActiveWorkout();

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

  const handleMinimize = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ─── Computed ───
  const nextExerciseAfterRest = exercises.find((_, i) => {
    if (i === 0) return false;
    const prev = exercises[i - 1];
    return prev.id === expandedExerciseId;
  });

  // ─── Empty state ───
  if (!activeWorkoutId || exercises.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="dumbbell" size={48} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No exercises in this workout</Text>
        <TouchableOpacity
          style={[styles.emptyBtn, { borderColor: colors.border }]}
          onPress={handleCancel}
        >
          <Text style={{ color: colors.error }}>Cancel Workout</Text>
        </TouchableOpacity>
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
              isLoading={isLoading}
              onToggleExpand={handleExpandExercise}
              onWeightChange={(v) => dispatch({ type: 'UPDATE_INPUT', field: 'weightInput', value: v })}
              onRepsChange={(v) => dispatch({ type: 'UPDATE_INPUT', field: 'repsInput', value: v })}
              onRpeChange={(v) => dispatch({ type: 'SET_RPE', value: v })}
              onSetTypeChange={cycleSetType}
              onLogSet={() => handleLogSet(exercise.id)}
              onDeleteSet={deleteSet}
            />
          );
        })}

        {/* Add Exercise placeholder */}
        <TouchableOpacity
          style={[styles.addExerciseBtn, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('ExercisePicker')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
          <Text style={[styles.addExerciseText, { color: colors.primary.main }]}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── REST TIMER OVERLAY ─── */}
      <RestTimerOverlay
        isVisible={isResting}
        durationSeconds={restDurationSeconds}
        elapsedSeconds={restDurationSeconds - restRemaining}
        onAddTime={(seconds) => {
          // Extend the rest timer by dispatching to the store
          // useWorkoutStore.getState().extendRest(seconds);
          // For now this is a no-op — stubbed until store action is added
        }}
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
          navigation.navigate('WorkoutSummary');
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
