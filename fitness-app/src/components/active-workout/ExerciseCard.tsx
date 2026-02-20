/**
 * ExerciseCard — Always-expanded exercise card.
 * All sets are visible from the start — no tap-to-expand required.
 * The active exercise shows input controls at the bottom.
 */

import React, { memo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { WorkoutExercise, WorkoutSet } from '../../types/backend.types';
import { ExerciseSetTable } from './ExerciseSetTable';
import type { SetType } from '../../hooks/useActiveWorkout';

// ─── Muscle group icon mapping ───
const MUSCLE_ICONS: Record<string, string> = {
  'Chest': 'human-male-height',
  'Back': 'human-male-height-variant',
  'Legs': 'run',
  'Shoulders': 'weight-lifter',
  'Arms': 'arm-flex',
  'Biceps': 'arm-flex',
  'Triceps': 'arm-flex',
  'Hamstrings': 'run',
  'Core': 'yoga',
  default: 'dumbbell',
};

// ─── Progress Dots ───
const ProgressDots = memo(({ completed, total, color }: { completed: number; total: number; color: string }) => {
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.dot,
          i < completed
            ? { backgroundColor: color }
            : { backgroundColor: color + '30', borderWidth: 1, borderColor: color + '50' },
        ]}
      />
    );
  }
  return <View style={styles.dotsContainer}>{dots}</View>;
});

interface Props {
  exercise: WorkoutExercise;
  completedSets: WorkoutSet[];
  isExpanded: boolean; // kept for API compat — card is always expanded now
  isActive: boolean;
  weightInput: string;
  repsInput: string;
  rpeInput: number | null;
  setType: SetType;
  editingSetId?: string | null;
  isLoading: boolean;
  previousWeight?: number;
  onToggleExpand: (exerciseId: number) => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: number | null) => void;
  onSetTypeChange: () => void;
  onBeginEditSet: (setId: string, setItem: WorkoutSet) => void;
  onLogSet: () => void;
  onDeleteSet: (exerciseId: number, setId: string) => void;
  onRemoveExercise?: (exerciseId: number) => void;
}

// ─── MAIN COMPONENT ───
export const ExerciseCard = memo(({
  exercise,
  completedSets,
  isExpanded,
  isActive,
  weightInput,
  repsInput,
  rpeInput,
  setType,
  editingSetId,
  isLoading,
  previousWeight,
  onToggleExpand,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onSetTypeChange,
  onBeginEditSet,
  onLogSet,
  onDeleteSet,
  onRemoveExercise,
}: Props) => {
  const colors = useColors();
  const targetSets = exercise.targetSets || 3;
  const setsCompleted = completedSets.length;
  const allDone = setsCompleted >= targetSets;
  const muscleGroup = exercise.exercise?.muscleGroup || 'default';
  const iconName = MUSCLE_ICONS[muscleGroup] || MUSCLE_ICONS.default;

  const targetRepsLabel = exercise.targetRepsMin && exercise.targetRepsMax
    ? `${exercise.targetRepsMin}–${exercise.targetRepsMax} reps`
    : exercise.targetRepsMin
    ? `${exercise.targetRepsMin} reps`
    : '';

  const handleFocus = useCallback(() => {
    if (!isActive) onToggleExpand(exercise.id);
  }, [exercise.id, isActive, onToggleExpand]);

  const accentColor = allDone ? (colors.success || '#10B981') : colors.primary.main;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: isActive ? colors.primary.main + '50' : allDone ? (colors.success || '#10B981') + '30' : colors.border,
        borderWidth: isActive ? 1.5 : 1,
      },
    ]}>
      {/* ── Accent Bar ── */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* ── Header ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleFocus}
        activeOpacity={0.75}
      >
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: accentColor + '18' }]}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={18}
            color={accentColor}
          />
        </View>

        {/* Info */}
        <View style={styles.headerInfo}>
          <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
            {exercise.exercise?.name || 'Exercise'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: allDone ? (colors.success || '#10B981') : colors.mutedForeground }]}>
              {setsCompleted}/{targetSets} sets
            </Text>
            {targetRepsLabel ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {'  '}·{'  '}{targetRepsLabel}
              </Text>
            ) : null}
            {exercise.targetWeight ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {'  '}·{'  '}{exercise.targetWeight} kg
              </Text>
            ) : null}
          </View>
        </View>

        {/* Progress dots + completion indicator */}
        <View style={styles.rightActions}>
          <View style={styles.rightSection}>
            <ProgressDots completed={setsCompleted} total={targetSets} color={accentColor} />
            {allDone && (
              <Ionicons name="checkmark-circle" size={20} color={colors.success || '#10B981'} style={{ marginTop: 4 }} />
            )}
          </View>
          {onRemoveExercise ? (
            <TouchableOpacity
              onPress={(event: any) => {
                event?.stopPropagation?.();
                onRemoveExercise(exercise.id);
              }}
              style={[styles.removeBtn, { backgroundColor: colors.muted }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* ── Notes ── */}
      {isExpanded && exercise.notes ? (
        <View style={[styles.notesBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={colors.primary.main} />
          <Text style={[styles.notesText, { color: colors.mutedForeground }]} numberOfLines={2}>
            {exercise.notes}
          </Text>
        </View>
      ) : null}

      {/* ── Set Table ── */}
      {isExpanded && (
        <ExerciseSetTable
          exerciseId={exercise.id}
          completedSets={completedSets}
          targetSets={targetSets}
          targetRepsMin={exercise.targetRepsMin}
          targetRepsMax={exercise.targetRepsMax}
          targetWeight={exercise.targetWeight}
          previousWeight={previousWeight}
          weightInput={weightInput}
          repsInput={repsInput}
          rpeInput={rpeInput}
          setType={setType}
          editingSetId={editingSetId}
          isActive={isActive}
          isLoading={isLoading}
          onWeightChange={onWeightChange}
          onRepsChange={onRepsChange}
          onRpeChange={onRpeChange}
          onSetTypeChange={onSetTypeChange}
          onBeginEditSet={onBeginEditSet}
          onLogSet={onLogSet}
          onDeleteSet={onDeleteSet}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'center',
    gap: 2,
  },
  rightActions: {
    alignItems: 'center',
    gap: 8,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});
