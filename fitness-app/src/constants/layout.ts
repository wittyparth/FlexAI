/**
 * FitTrack Design System - Spacing & Layout
 */

// ==========================================
// Spacing Scale (4px base unit)
// ==========================================
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ==========================================
// Border Radius
// ==========================================
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 999,
} as const;

// ==========================================
// Shadows (React Native compatible)
// ==========================================
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  accent: {
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  accentLarge: {
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ==========================================
// Component Sizing
// ==========================================
export const sizing = {
  touchTarget: 44,      // Minimum touch target (44x44)
  touchTargetLarge: 56, // Large touch target (buttons)
  inputHeight: 56,      // Standard input height
  buttonHeight: 56,     // Standard button height
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 28,
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 80,
} as const;

// ==========================================
// Animation Durations (ms)
// ==========================================
export const duration = {
  fast: 150,
  normal: 200,
  slow: 300,
  entrance: 700,
} as const;
