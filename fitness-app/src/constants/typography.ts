/**
 * Premium FitTrack Design System - Typography Tokens
 * 
 * Fonts: System (Apple/Roboto) + Monospace (Courier/Mono)
 * Scale: H1-H5, Body, Caption, Financial
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
export const FONTS = {
  primary: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semibold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium', // Android fallback
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },
  mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  // Legacy backward compatibility
  calistoga: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  inter: Platform.OS === 'ios' ? 'System' : 'Roboto',
  interMedium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  interSemiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  interBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
};

// Typography Scale
export const TYPOGRAPHY = {
  // Display (Hero Text)
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -1.5,
    fontFamily: FONTS.primary.bold,
  } as TextStyle,

  // Headings
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
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.15,
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.15,
    fontFamily: FONTS.primary.medium,
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.5,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,
  bodyRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.25,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.4,
    fontFamily: FONTS.primary.regular,
  } as TextStyle,

  // UI Text
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.1,
    fontFamily: FONTS.primary.medium,
  } as TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.4,
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

  // Button Text
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.5,
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.5,
    fontFamily: FONTS.primary.semibold,
  } as TextStyle,

  // Financial (Monospace)
  financialLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.5,
    fontFamily: FONTS.mono,
  } as TextStyle,
};

// Legacy exports for backward compatibility
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
    // Mapping legacy usage to new system
    h1: TYPOGRAPHY.h1,
    h2: TYPOGRAPHY.h2,
    h3: TYPOGRAPHY.h3,
    body: TYPOGRAPHY.bodyLarge,
    bodyLarge: TYPOGRAPHY.bodyLarge, // Added for compatibility
    caption: TYPOGRAPHY.caption,
    button: TYPOGRAPHY.button,
    sectionLabel: TYPOGRAPHY.overline,
    label: TYPOGRAPHY.label, // Added for compatibility
};
