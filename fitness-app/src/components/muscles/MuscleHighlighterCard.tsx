import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Body from 'react-native-body-highlighter';
import { useColors } from '../../hooks';
import { buildBodyHighlighterData, mergeMuscleInputs } from '../../utils/muscleHighlighter';

type Side = 'front' | 'back';
type Gender = 'male' | 'female';

interface MuscleHighlighterCardProps {
  title?: string;
  subtitle?: string;
  muscleSets?: Record<string, number>;
  muscles?: ReadonlyArray<string>;
  defaultSide?: Side;
  gender?: Gender;
  showGenderToggle?: boolean;
  compact?: boolean;
}

export function MuscleHighlighterCard({
  title,
  subtitle,
  muscleSets,
  muscles,
  defaultSide = 'front',
  gender: genderProp = 'male',
  showGenderToggle = false,
  compact = false,
}: MuscleHighlighterCardProps) {
  const colors = useColors();
  const [side, setSide] = useState<Side>(defaultSide);
  const [gender, setGender] = useState<Gender>(genderProp);
  const [showAllTargets, setShowAllTargets] = useState(false);

  const merged = useMemo(() => mergeMuscleInputs(muscleSets, muscles), [muscleSets, muscles]);
  const bodyData = useMemo(() => buildBodyHighlighterData(muscleSets, muscles), [muscleSets, muscles]);
  const sortedMuscles = useMemo(
    () =>
      Object.entries(merged).sort((a, b) => b[1] - a[1]),
    [merged],
  );
  const hasExtraTargets = sortedMuscles.length > 6;
  const visibleMuscles = showAllTargets ? sortedMuscles : sortedMuscles.slice(0, 6);

  const hasData = bodyData.length > 0;
  const intensityColors = [colors.heatmap.light, colors.chart1, colors.primary.main, colors.chart4];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : null}
          {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
        </View>
      )}

      {/* Front / Back + Gender toggle row */}
      <View style={styles.controlsRow}>
        <View style={[styles.toggleWrap, { backgroundColor: colors.muted, flex: 1 }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, side === 'front' && { backgroundColor: colors.primary.main }]}
            onPress={() => setSide('front')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, { color: side === 'front' ? '#FFFFFF' : colors.foreground }]}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, side === 'back' && { backgroundColor: colors.primary.main }]}
            onPress={() => setSide('back')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, { color: side === 'back' ? '#FFFFFF' : colors.foreground }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {showGenderToggle && (
          <View style={[styles.genderToggleWrap, { backgroundColor: colors.muted }]}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && { backgroundColor: colors.primary.main }]}
              onPress={() => setGender('male')}
              activeOpacity={0.8}
            >
              <Ionicons name="man" size={14} color={gender === 'male' ? '#FFFFFF' : colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && { backgroundColor: colors.primary.main }]}
              onPress={() => setGender('female')}
              activeOpacity={0.8}
            >
              <Ionicons name="woman" size={14} color={gender === 'female' ? '#FFFFFF' : colors.foreground} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {hasData ? (
        <View style={styles.bodyWrap}>
          <Body
            data={bodyData}
            side={side}
            gender={gender}
            scale={compact ? 1.2 : 1.35}
            colors={intensityColors}
            border={colors.border}
          />
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          No muscle stimulation data available yet.
        </Text>
      )}

      {visibleMuscles.length > 0 && (
        <View style={styles.targetedSection}>
          <View style={styles.targetedHeader}>
            <Text style={[styles.targetedTitle, { color: colors.foreground }]}>Targeted Muscles</Text>
            {hasExtraTargets && (
              <TouchableOpacity onPress={() => setShowAllTargets((prev) => !prev)} activeOpacity={0.8}>
                <Text style={[styles.targetedToggleText, { color: colors.primary.main }]}>
                  {showAllTargets ? 'Show Less' : `Show All (${sortedMuscles.length})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.topMusclesRow}>
            {visibleMuscles.map(([muscleName]) => (
              <View key={muscleName} style={[styles.muscleTag, { backgroundColor: `${colors.primary.main}15` }]}>
                <Text
                  style={[styles.muscleTagText, { color: colors.primary.main }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {muscleName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {hasExtraTargets && showAllTargets && (
        <TouchableOpacity style={[styles.collapseBtn, { backgroundColor: colors.muted }]} onPress={() => setShowAllTargets(false)}>
          <Text style={[styles.collapseBtnText, { color: colors.foreground }]}>Close Expanded List</Text>
        </TouchableOpacity>
      )}

      <View style={styles.legendRow}>
        {['Low', 'Medium', 'High', 'Peak'].map((label, index) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: intensityColors[index] }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  genderToggleWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  genderBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 280,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  targetedSection: {
    gap: 10,
  },
  targetedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  targetedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  targetedToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  topMusclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '48%',
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 130,
  },
  collapseBtn: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  collapseBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
