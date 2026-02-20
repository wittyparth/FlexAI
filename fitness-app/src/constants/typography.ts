/**
 * Premium FitTrack Design System - Typography Tokens
 * 
 * Fonts: 
 * - Sans: DM Sans (Primary)
 * - Mono: Geist Mono (Financial/Code)
 * - Serif: System Serif
 */

import { Platform, TextStyle } from 'react-native';

// Font Weights
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// Font Families
// NOTE: Ensure these specific font names are used in `useFonts` in App.tsx if adding new assets.
// For now, mapping to existing 'Inter' as fallback or 'System' until assets are loaded.
export const FONTS = {
  primary: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto', // Fallback until DM Sans is loaded
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semibold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },
  // Mapping Geist Mono request to JetBrainsMono (existing) or Monospace
  mono: 'JetBrainsMono', 
  
  // Legacy
  inter: Platform.OS === 'ios' ? 'System' : 'Roboto',
};

// Typography Scale
export const TYPOGRAPHY = {
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -1.5,
    fontFamily: FONTS.primary.bold,
  } as TextStyle,
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.5,
    fontFamily: FONTS.primary.bold,
  } as TextStyle,
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.3,
    fontFamily: FONTS.primary.bold,
  } as TextStyle,
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0,
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,
  bodyRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: FONTS.primary.medium,
  } as TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,
  overline: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,
};

export const fonts = {
  display: FONTS.primary.bold,
  body: FONTS.primary.regular,
  bodyMedium: FONTS.primary.medium,
  bodyBold: FONTS.primary.bold,
  bodySemibold: FONTS.primary.semibold,
  mono: FONTS.mono,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 48,
};

export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

export const typography = {
    h1: TYPOGRAPHY.h1,
    h2: TYPOGRAPHY.h2,
    h3: TYPOGRAPHY.h3,
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: FONT_WEIGHTS.semibold,
      fontFamily: FONTS.primary.semibold,
    } as import('react-native').TextStyle,
    body: TYPOGRAPHY.bodyLarge,
    bodyLarge: TYPOGRAPHY.bodyLarge,
    bodyRegular: TYPOGRAPHY.bodyRegular,
    caption: TYPOGRAPHY.caption,
    button: TYPOGRAPHY.button,
    sectionLabel: TYPOGRAPHY.overline,
    label: TYPOGRAPHY.label,
};
