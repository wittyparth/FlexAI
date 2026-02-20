import React, { memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { WorkoutSet } from '../../types/backend.types';
import { CustomAlert } from '../ui/CustomAlert';

const SET_TYPE_CONFIG: Record<string, { label: string; color: string; short: string }> = {
  working: { label: 'Working', color: '#3B82F6', short: 'W' },
  warmup: { label: 'Warm-up', color: '#F59E0B', short: 'WU' },
  drop: { label: 'Drop', color: '#8B5CF6', short: 'D' },
  failure: { label: 'Failure', color: '#EF4444', short: 'F' },
  amrap: { label: 'AMRAP', color: '#10B981', short: 'A' },
};

const SetTypeBadge = memo(({ type, onPress, interactive }: { type: string; onPress?: () => void; interactive?: boolean }) => {
  const config = SET_TYPE_CONFIG[type] || SET_TYPE_CONFIG.working;
  const Wrapper = interactive ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.setTypeBadge, { backgroundColor: config.color + '20' }]}
      {...(interactive ? { onPress, activeOpacity: 0.7 } : {})}
    >
      <Text style={[styles.setTypeBadgeText, { color: config.color }]}>{config.short}</Text>
    </Wrapper>
  );
});

interface Props {
  exerciseId: number;
  completedSets: WorkoutSet[];
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetWeight?: number;
  previousWeight?: number;
  weightInput: string;
  repsInput: string;
  rpeInput: number | null;
  setType: any;
  editingSetId?: string | null;
  isActive: boolean;
  isLoading: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: number | null) => void;
  onSetTypeChange: () => void;
  onBeginEditSet: (setId: string, setItem: WorkoutSet) => void;
  onLogSet: () => void;
  onDeleteSet: (exerciseId: number, setId: string) => void;
}

const CompletedSetRow = memo(({
  set,
  index,
  onDelete,
  onBeginEdit,
  exerciseId,
  colors,
  previousWeight,
  isEditing,
}: {
  set: WorkoutSet;
  index: number;
  onDelete: (exerciseId: number, setId: string) => void;
  onBeginEdit: (setId: string, setItem: WorkoutSet) => void;
  exerciseId: number;
  colors: any;
  previousWeight?: number;
  isEditing: boolean;
}) => {
  return (
    <Pressable
      onPress={() => onBeginEdit(set.id, set)}
      onLongPress={() => onDelete(exerciseId, set.id)}
      style={[
        styles.setRow,
        {
          backgroundColor: isEditing ? colors.primary.main + '15' : (colors.success || '#10B981') + '10',
          borderWidth: isEditing ? 1 : 0,
          borderColor: isEditing ? colors.primary.main + '60' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.setCell, styles.setCellNarrow, { color: colors.foreground, fontWeight: '700' }]}>{index + 1}</Text>

      <SetTypeBadge type={(set.setType as string) || 'working'} />

      <Text style={[styles.setCell, styles.setCellWide, { color: colors.mutedForeground, paddingHorizontal: 4 }]} numberOfLines={1}>
        {previousWeight ? `${previousWeight} kg` : '-'}
      </Text>

      <View style={[styles.staticCellBox, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.staticCellText, { color: colors.foreground }]}>{set.weight ?? '-'}</Text>
      </View>
      <View style={[styles.staticCellBox, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.staticCellText, { color: colors.foreground }]}>{set.reps ?? '-'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, { backgroundColor: isEditing ? colors.primary.main : colors.muted }]}
        onPress={() => onBeginEdit(set.id, set)}
        activeOpacity={0.8}
      >
        <Ionicons name={isEditing ? 'save-outline' : 'pencil-outline'} size={16} color={isEditing ? '#FFFFFF' : colors.foreground} />
      </TouchableOpacity>
    </Pressable>
  );
});

export const ExerciseSetTable = memo(({
  exerciseId,
  completedSets,
  targetSets,
  targetRepsMin,
  targetRepsMax,
  targetWeight,
  previousWeight,
  weightInput,
  repsInput,
  setType,
  editingSetId,
  isActive,
  isLoading,
  onWeightChange,
  onRepsChange,
  onSetTypeChange,
  onBeginEditSet,
  onLogSet,
  onDeleteSet,
}: Props) => {
  const colors = useColors();
  const nextSetNumber = completedSets.length + 1;

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [setToDelete, setSetToDelete] = React.useState<{ id: string; index: number } | null>(null);

  const handleDeleteRequest = React.useCallback((eid: number, sid: string) => {
    const idx = completedSets.findIndex(s => s.id === sid);
    setSetToDelete({ id: sid, index: idx });
    setDeleteModalVisible(true);
  }, [completedSets]);

  const targetHint = targetRepsMin && targetRepsMax
    ? `${targetRepsMin}-${targetRepsMax}`
    : targetRepsMin
      ? `${targetRepsMin}`
      : '';

  const pendingSetIndices: number[] = [];
  for (let i = completedSets.length; i < targetSets; i++) {
    if (isActive && i === completedSets.length) continue;
    pendingSetIndices.push(i);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.setCellNarrow, { color: colors.mutedForeground }]}>SET</Text>
        <Text style={[styles.headerCell, { color: colors.mutedForeground, width: 36, textAlign: 'center' }]}>TYPE</Text>
        <Text style={[styles.headerCell, styles.setCellWide, { color: colors.mutedForeground, textAlign: 'center' }]}>PREV</Text>
        <Text style={[styles.headerCell, styles.setCellWide, { color: colors.mutedForeground, textAlign: 'center' }]}>KG</Text>
        <Text style={[styles.headerCell, styles.setCellWide, { color: colors.mutedForeground, textAlign: 'center' }]}>REPS</Text>
        <View style={styles.checkBtnWidth} />
      </View>

      {completedSets.map((set, i) => (
        <CompletedSetRow
          key={set.id}
          set={set}
          index={i}
          onDelete={handleDeleteRequest}
          onBeginEdit={onBeginEditSet}
          exerciseId={exerciseId}
          colors={colors}
          previousWeight={previousWeight}
          isEditing={editingSetId === set.id}
        />
      ))}

      {isActive && (
        <View style={[styles.setRow, { backgroundColor: colors.card }]}> 
          <Text style={[styles.setCell, styles.setCellNarrow, { color: colors.primary.main, fontWeight: '800' }]}>
            {editingSetId ? 'E' : nextSetNumber}
          </Text>

          <SetTypeBadge type={setType} onPress={onSetTypeChange} interactive />

          <Text style={[styles.setCell, styles.setCellWide, { color: colors.mutedForeground, paddingHorizontal: 4 }]} numberOfLines={1}>
            {previousWeight ? `${previousWeight} kg` : '-'}
          </Text>

          <TextInput
            style={[styles.inputCell, styles.setCellWide, { color: colors.foreground, backgroundColor: colors.muted }]}
            placeholder={targetWeight?.toString() || '0'}
            placeholderTextColor={colors.mutedForeground + '60'}
            keyboardType="decimal-pad"
            value={weightInput}
            onChangeText={onWeightChange}
            selectTextOnFocus
          />
          <TextInput
            style={[styles.inputCell, styles.setCellWide, { color: colors.foreground, backgroundColor: colors.muted }]}
            placeholder={targetHint || '0'}
            placeholderTextColor={colors.mutedForeground + '60'}
            keyboardType="number-pad"
            value={repsInput}
            onChangeText={onRepsChange}
            selectTextOnFocus
          />

          <TouchableOpacity
            style={[styles.checkBtn, { backgroundColor: editingSetId ? colors.primary.main : colors.muted }]}
            onPress={onLogSet}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons
              name={editingSetId ? 'save-outline' : 'checkmark'}
              size={18}
              color={editingSetId ? '#FFFFFF' : colors.foreground}
            />
          </TouchableOpacity>
        </View>
      )}

      {pendingSetIndices.map(i => (
        <View key={`pending-${i}`} style={[styles.setRow, { opacity: 0.5 }]}> 
          <Text style={[styles.setCell, styles.setCellNarrow, { color: colors.mutedForeground }]}>{i + 1}</Text>

          <View style={[styles.setTypeBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.setTypeBadgeText, { color: colors.mutedForeground }]}>W</Text>
          </View>

          <Text style={[styles.setCell, styles.setCellWide, { color: colors.mutedForeground, paddingHorizontal: 4 }]} numberOfLines={1}>
            {previousWeight ? `${previousWeight} kg` : '-'}
          </Text>

          <View style={[styles.staticCellBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.staticCellText, { color: colors.mutedForeground }]}>{targetWeight || '-'}</Text>
          </View>
          <View style={[styles.staticCellBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.staticCellText, { color: colors.mutedForeground }]}>{targetHint || '-'}</Text>
          </View>

          <View style={[styles.checkBtn, { backgroundColor: colors.muted, opacity: 0.5 }]}> 
            <Ionicons name="checkmark" size={18} color="transparent" />
          </View>
        </View>
      ))}

      <CustomAlert
        visible={deleteModalVisible}
        title="Delete Set"
        message={`Are you sure you want to remove set ${setToDelete ? setToDelete.index + 1 : ''}?`}
        danger={true}
        primaryActionLabel="Delete"
        secondaryActionLabel="Cancel"
        onPrimaryPress={() => {
          if (setToDelete) {
            onDeleteSet(exerciseId, setToDelete.id);
          }
          setDeleteModalVisible(false);
        }}
        onSecondaryPress={() => setDeleteModalVisible(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  setCell: {
    fontSize: 14,
    textAlign: 'center',
  },
  setCellNarrow: {
    width: 24,
  },
  setCellWide: {
    flex: 1,
    marginHorizontal: 4,
  },
  setTypeBadge: {
    width: 32,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  setTypeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  inputCell: {
    height: 36,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: fontFamilies.mono,
  },
  staticCellBox: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  staticCellText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fontFamilies.mono,
  },
  checkBtnWidth: {
    width: 44,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
