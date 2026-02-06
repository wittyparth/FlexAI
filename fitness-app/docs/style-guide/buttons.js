// theme/components/buttons.js
// Button Component Styles

import { SPACING, RADIUS, TOUCH_TARGETS } from './spacing';
import { TYPOGRAPHY } from './typography';

// This file contains style definitions - actual colors should come from theme context
// Usage: {...BUTTON_STYLES.primary, backgroundColor: theme.colors.primary[500]}

export const BUTTON_STYLES = {
  // Primary Button (Filled)
  primary: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    minHeight: TOUCH_TARGETS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // Secondary Button (Outlined)
  secondary: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    minHeight: TOUCH_TARGETS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // Tertiary Button (Ghost/Text)
  tertiary: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    minHeight: TOUCH_TARGETS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // Destructive Button
  destructive: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    minHeight: TOUCH_TARGETS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  // Small Button
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.sm,
    minHeight: TOUCH_TARGETS.small,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },

  // Large Button
  large: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
    minHeight: TOUCH_TARGETS.large,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
  },

  // Icon Button (Square)
  icon: {
    width: TOUCH_TARGETS.medium,
    height: TOUCH_TARGETS.medium,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Icon Button (Round)
  iconRound: {
    width: TOUCH_TARGETS.medium,
    height: TOUCH_TARGETS.medium,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Full Width Button
  fullWidth: {
    width: '100%',
  },

  // Disabled State (combine with any button style)
  disabled: {
    opacity: 0.5,
  },
};

export const BUTTON_TEXT_STYLES = {
  primary: {
    ...TYPOGRAPHY.button,
  },
  secondary: {
    ...TYPOGRAPHY.button,
  },
  tertiary: {
    ...TYPOGRAPHY.button,
  },
  small: {
    ...TYPOGRAPHY.buttonSmall,
  },
  large: {
    ...TYPOGRAPHY.button,
    fontSize: 18,
  },
};

// Example Usage:
/*
import { useTheme } from '../theme/ThemeContext';
import { BUTTON_STYLES, BUTTON_TEXT_STYLES } from '../theme/components/buttons';

const MyButton = () => {
  const { colors, shadows } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.primary,
        { backgroundColor: colors.primary[500] },
        shadows.md,
      ]}
    >
      <Text style={[BUTTON_TEXT_STYLES.primary, { color: colors.text.inverse }]}>
        Click Me
      </Text>
    </TouchableOpacity>
  );
};
*/
