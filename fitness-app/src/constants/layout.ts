/**
 * Premium FitTrack Design System - Layout Tokens
 * 
 * Radius: 1rem (16px) base
 */

// Spacing System (0.25rem = 4px)
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

// Border Radius System (Global Radius: 1rem = 16px)
export const RADIUS = {
  none: 0,
  xs: 4,               // calc(var(--radius) - 12px) approx? No, let's stick to safe smalls
  sm: 12,              // calc(var(--radius) - 4px) -> 16 - 4
  md: 14,              // calc(var(--radius) - 2px) -> 16 - 2
  lg: 16,              // var(--radius)
  xl: 20,              // calc(var(--radius) + 4px) -> 16 + 4
  xxl: 24,
  full: 999,
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
  sm: RADIUS.sm,    // 12
  md: RADIUS.md,    // 14
  lg: RADIUS.lg,    // 16
  xl: RADIUS.xl,    // 20
  '2xl': RADIUS.xxl,// 24
  '3xl': 28,
  full: RADIUS.full,
};

export const sizing = {
  icon: {
    sm: 16,
    md: 24, // Typically 1.5rem
    lg: 32,
    xl: 48,
  },
  touchTarget: 48,
  inputHeight: 48, 
  buttonHeight: 48, 
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
