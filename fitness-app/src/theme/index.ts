/**
 * Minimalist Modern Design System - Complete Theme Export
 * 
 * Design Philosophy:
 * - Clarity through structure, character through bold detail
 * - Electric Blue gradient (#0052FF → #4D7CFF) as signature
 * - Dual-font typography: Calistoga (display) + Inter (body) + JetBrains Mono (mono)
 * - Generous whitespace, confident execution
 */

import { colors } from './colors';
import { typography, fontFamilies, fontWeights, fontSize, letterSpacing } from './typography';
import { spacing, spacingPatterns } from './spacing';
import { shadows } from './shadows';

// Border radius scale
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 999,
};

// Animation durations (in milliseconds)
export const duration = {
  fast: 200,
  normal: 300,
  slow: 700,
  slower: 1000,
  pulse: 2000,
  float: 4000,
  rotate: 60000,
};

// Combined theme object
export const theme = {
  colors,
  typography,
  fontFamilies,
  fontWeights,
  fontSize,
  letterSpacing,
  spacing,
  spacingPatterns,
  shadows,
  borderRadius,
  duration,
  
  // Signature gradient (for use with LinearGradient component)
  gradients: {
    primary: {
      colors: colors.primary.gradient,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
    primaryDiagonal: {
      colors: colors.primary.gradient,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },
};

export type Theme = typeof theme;

// Export individual modules for convenience
export {
  colors,
  typography,
  fontFamilies,
  fontWeights,
  fontSize,
  letterSpacing,
  spacing,
  spacingPatterns,
  shadows,
};
