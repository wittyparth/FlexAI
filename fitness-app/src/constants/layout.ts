/**
 * Premium FitTrack Design System - Layout Tokens
 * 
 * Spacing: 8pt grid (base unit: 4px)
 * Radius: Consistent rounded corners
 */

// Spacing System (multiples of 4)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

// Border Radius System
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999, // Pills/Circles
} as const;

// Legacy mappings for backward compatibility
export const spacing = {
  0: 0,
  1: SPACING.xs,      // 4
  2: SPACING.sm,      // 8
  3: SPACING.md,      // 12
  4: SPACING.base,    // 16
  5: SPACING.lg,      // 20
  6: SPACING.xl,      // 24
  8: SPACING.xxl,     // 32
  10: SPACING.xxxl,   // 40
  12: SPACING.huge,   // 48
  16: SPACING.massive,// 64
};

export const borderRadius = {
  none: RADIUS.none,
  sm: RADIUS.xs,    // 4
  md: RADIUS.sm,    // 8
  lg: RADIUS.md,    // 12
  xl: RADIUS.lg,    // 16
  '2xl': RADIUS.xl, // 20
  '3xl': RADIUS.xxl,// 24
  full: RADIUS.full,
};

export const sizing = {
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  touchTarget: 48,
  inputHeight: 48, // Added for Input component
  buttonHeight: 48, // Added for Button component
};

export const layout = {
    spacing,
    radius: borderRadius,
    sizing,
};
export const duration = {
  fast: 200,
  normal: 300,
  slow: 500,
};
