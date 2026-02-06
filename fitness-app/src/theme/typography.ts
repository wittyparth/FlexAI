/**
 * Minimalist Modern Design System - Typography
 * Dual-Font System: Calistoga (display) + Inter (UI/body) + JetBrains Mono (monospace)
 * 
 * Note: React Native lineHeight must be absolute pixel values, not multipliers
 */

import { Platform, TextStyle } from 'react-native';

// Font Families (Note: These will need to be loaded via expo-google-fonts)
export const fontFamilies = {
  // Display font - warm, characterful serif
  display: Platform.select({
    ios: 'Calistoga',
    android: 'Calistoga',
    default: 'Georgia',
  }) as string,
  
  // UI & Body font - clean, legible sans-serif
  body: Platform.select({
    ios: 'Inter',
    android: 'Inter',
    default: 'System',
  }) as string,
  
  // Monospace - for badges, labels, technical callouts
  mono: Platform.select({
    ios: 'JetBrainsMono',
    android: 'JetBrainsMono',
    default: 'Courier',
  }) as string,
};

// Font Weights - React Native compatible
export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Type Scale
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
};

// Letter Spacing (tracking)
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 2.4,
};

// Typography Presets - React Native compatible (no lineHeight multipliers)
export const typography = {
  // Hero Headline
  heroHeadline: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,
  
  heroHeadlineDesktop: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['6xl'],
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,
  
  // Section Headlines
  sectionHeadline: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeights.normal,
  } as TextStyle,
  
  sectionHeadlineDesktop: {
    fontFamily: fontFamilies.display,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeights.normal,
  } as TextStyle,
  
  // Card Titles
  cardTitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  // Body Text
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.base,
    fontWeight: fontWeights.normal,
  } as TextStyle,
  
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeights.normal,
  } as TextStyle,
  
  // Section Labels (Badges)
  sectionLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSize.xs,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  } as TextStyle,
  
  // Button Text
  button: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.base,
    fontWeight: fontWeights.medium,
  } as TextStyle,
  
  buttonLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeights.medium,
  } as TextStyle,
  
  // Small Text
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeights.normal,
  } as TextStyle,
  
  // Input Text
  input: {
    fontFamily: fontFamilies.body,
    fontSize: fontSize.base,
    fontWeight: fontWeights.normal,
  } as TextStyle,
};

export type Typography = typeof typography;
