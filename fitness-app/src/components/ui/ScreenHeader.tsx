/**
 * ScreenHeader Component — Production Grade
 *
 * Wizard / onboarding header with:
 *  - Back button: minimum 44×44 touch target, circular with scale animation
 *  - Step indicator chip
 *  - Optional `title` for centered screen heading
 *  - Reanimated animated progress bar
 *  - Safe-area aware (handled by parent SafeAreaView)
 */

import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { typography, spacing, borderRadius } from '../../constants';
import { ProgressBar } from './ProgressBar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScreenHeaderProps {
  onBack?: () => void;
  backIcon?: keyof typeof Ionicons.glyphMap;
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  /** Optional centered screen title displayed below step chip row */
  title?: string;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  onBack,
  backIcon = 'arrow-back',
  currentStep,
  totalSteps,
  showProgress = false,
  title,
  rightElement,
}: ScreenHeaderProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  const progress = currentStep && totalSteps ? currentStep / totalSteps : 0;

  // Back button press scale
  const scale = useSharedValue(1);
  const backAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {/* Back Button */}
        {onBack ? (
          <AnimatedPressable
            onPress={onBack}
            onPressIn={() => { scale.value = withSpring(0.92, { damping: 20, stiffness: 400 }); }}
            onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 400 }); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              backAnimStyle,
              styles.backButton,
              { backgroundColor: isDark ? colors.neutral[200] : colors.neutral[100] },
            ]}
          >
            <Ionicons name={backIcon} size={22} color={colors.text.primary} />
          </AnimatedPressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Step Chip */}
        {currentStep && totalSteps && (
          <View style={[styles.stepChip, { backgroundColor: isDark ? colors.neutral[200] : colors.neutral[100] }]}>
            <Text style={[styles.stepText, { color: colors.text.secondary }]}>
              {currentStep} / {totalSteps}
            </Text>
          </View>
        )}

        {/* Right Element or Placeholder */}
        {rightElement || <View style={styles.placeholder} />}
      </View>

      {/* Optional screen title */}
      {title && (
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      )}

      {/* Progress Bar */}
      {showProgress && progress > 0 && (
        <ProgressBar
          progress={progress}
          height={4}
          gradient={[colors.primary.main, colors.gradients?.primary?.[1] ?? '#7C3AED']}
          style={styles.progressBar}
        />
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
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1] + 2,
    borderRadius: borderRadius.full,
  },
  stepText: {
    ...typography.caption,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing[2],
  },
  progressBar: {
    marginTop: spacing[2],
  },
});
