/**
 * ScreenHeader Component
 * 
 * Reusable header for onboarding/wizard screens with:
 * - Back button (optional)
 * - Step indicator chip (optional)
 * - Progress bar (optional)
 * 
 * Usage:
 * <ScreenHeader
 *   onBack={() => navigation.goBack()}
 *   currentStep={1}
 *   totalSteps={10}
 *   showProgress
 * />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { typography, spacing, borderRadius } from '../../constants';
import { ProgressBar } from './ProgressBar';

interface ScreenHeaderProps {
  onBack?: () => void;
  backIcon?: keyof typeof Ionicons.glyphMap;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  onBack,
  backIcon = 'arrow-back',
  currentStep,
  totalSteps,
  showProgress = false,
  rightElement,
}: ScreenHeaderProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  const progress = currentStep && totalSteps ? currentStep / totalSteps : 0;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* Back Button */}
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: colors.neutral?.[100] || colors.muted }]}
          >
            <Ionicons name={backIcon} size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Step Chip */}
        {currentStep && totalSteps && (
          <View
            style={[
              styles.stepChip,
              { backgroundColor: isDark ? colors.card : colors.background },
            ]}
          >
            <Text style={[styles.stepText, { color: colors.text.secondary }]}>
              STEP {currentStep} OF {totalSteps}
            </Text>
          </View>
        )}

        {/* Right Element or Placeholder */}
        {rightElement || <View style={styles.placeholder} />}
      </View>

      {/* Progress Bar */}
      {showProgress && progress > 0 && (
        <ProgressBar progress={progress} style={styles.progressBar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 44,
  },
  stepChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  stepText: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressBar: {
    marginTop: spacing[2],
  },
});
