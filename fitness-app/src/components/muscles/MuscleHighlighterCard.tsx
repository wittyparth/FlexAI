import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Body from 'react-native-body-highlighter';
import { useColors } from '../../hooks';
import { buildBodyHighlighterData, mergeMuscleInputs } from '../../utils/muscleHighlighter';

type Side = 'front' | 'back';

interface MuscleHighlighterCardProps {
  title?: string;
  subtitle?: string;
  muscleSets?: Record<string, number>;
  muscles?: ReadonlyArray<string>;
  defaultSide?: Side;
  gender?: 'male' | 'female';
  compact?: boolean;
}

export function MuscleHighlighterCard({
  title,
  subtitle,
  muscleSets,
  muscles,
  defaultSide = 'front',
  gender = 'male',
  compact = false,
}: MuscleHighlighterCardProps) {
  const colors = useColors();
  const [side, setSide] = useState<Side>(defaultSide);

  const merged = useMemo(() => mergeMuscleInputs(muscleSets, muscles), [muscleSets, muscles]);
  const bodyData = useMemo(() => buildBodyHighlighterData(muscleSets, muscles), [muscleSets, muscles]);
  const topMuscles = useMemo(
    () =>
      Object.entries(merged)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    [merged],
  );

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

      <View style={[styles.toggleWrap, { backgroundColor: colors.muted }]}>
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

      {topMuscles.length > 0 && (
        <View style={styles.topMusclesRow}>
          {topMuscles.map((muscle) => (
            <View key={muscle} style={[styles.muscleTag, { backgroundColor: `${colors.primary.main}15` }]}>
              <Text style={[styles.muscleTagText, { color: colors.primary.main }]} numberOfLines={1}>
                {muscle}
              </Text>
            </View>
          ))}
        </View>
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

