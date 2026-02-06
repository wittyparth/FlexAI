/**
 * SelectableCard Component
 * 
 * Reusable selection card with icon, title, description, and radio indicator.
 * Used in onboarding screens for goal selection, experience level, etc.
 * 
 * Usage:
 * <SelectableCard
 *   title="Muscle Gain"
 *   description="Build mass & strength"
 *   icon="barbell-outline"
 *   selected={selectedGoal === 'muscle_gain'}
 *   onPress={() => setSelectedGoal('muscle_gain')}
 * />
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

interface SelectableCardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconComponent?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SelectableCard({
  title,
  description,
  icon,
  iconComponent,
  selected = false,
  onPress,
  disabled = false,
  style,
}: SelectableCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? colors.primary.main : colors.border,
        },
        selected && styles.selectedCard,
        disabled && styles.disabledCard,
        style,
      ]}
    >
      {/* Selection highlight border */}
      {selected && (
        <View style={[styles.selectedBorder, { borderColor: colors.primary.main }]} />
      )}

      <View style={styles.cardContent}>
        {/* Icon Box */}
        {(icon || iconComponent) && (
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: selected
                  ? colors.primary.main
                  : isDark
                  ? colors.muted
                  : colors.primary.main + '10',
              },
            ]}
          >
            {iconComponent || (
              <Ionicons
                name={icon!}
                size={28}
                color={selected ? '#FFFFFF' : colors.primary.main}
              />
            )}
          </View>
        )}

        {/* Text Container */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: selected ? colors.primary.main : colors.foreground },
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          )}
        </View>

        {/* Radio Circle */}
        <View
          style={[
            styles.radioCircle,
            {
              borderColor: selected ? colors.primary.main : colors.border,
              backgroundColor: selected ? colors.primary.main : 'transparent',
            },
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing[4],
    position: 'relative',
    overflow: 'hidden',
    ...shadows.sm,
  },
  selectedCard: {
    ...shadows.md,
  },
  disabledCard: {
    opacity: 0.6,
  },
  selectedBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    zIndex: -1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.base,
    marginBottom: 2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
