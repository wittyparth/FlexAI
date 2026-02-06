/**
 * FitTrack Design System - Typography
 * 
 * Dual-Font System:
 * - Display: Calistoga (warm, characterful serif for headlines)
 * - Body: Inter (clean, legible sans-serif for UI)
 * - Mono: JetBrains Mono (for badges, labels, technical callouts)
 */

import { TextStyle } from 'react-native';
import { colors } from './colors';

// ==========================================
// Font Families
// ==========================================
export const fonts = {
  display: 'Calistoga',         // Headlines, hero text
  body: 'Inter',                // Body text, UI elements
  bodyMedium: 'Inter-Medium',   // Medium weight body
  bodySemibold: 'Inter-SemiBold', // Semibold body (buttons, card titles)
  bodyBold: 'Inter-Bold',       // Bold body
  mono: 'JetBrainsMono',        // Section labels, badges, code
} as const;

// ==========================================
// Font Sizes (in pixels)
// ==========================================
export const fontSize = {
  xs: 12,      // Section labels (monospace, uppercase)
  sm: 14,      // Small body text, captions
  base: 16,    // Body text (minimum for mobile)
  lg: 18,      // Large body, card descriptions
  xl: 20,      // Small headings
  '2xl': 24,   // Card titles
  '3xl': 30,   // Section headlines (mobile)
  '4xl': 36,   // Section headlines (tablet)
  '5xl': 48,   // Hero headline (mobile)
  '6xl': 60,   // Hero headline (tablet)
} as const;

// ==========================================
// Letter Spacing (tracking)
// ==========================================
export const letterSpacing = {
  tighter: -0.8,   // Hero headlines (-0.02em equivalent)
  tight: -0.4,     // Card titles (-0.01em equivalent)
  normal: 0,       // Body text
  wide: 2.4,       // Uppercase labels (0.15em for 12px)
} as const;

// ==========================================
// Typography Presets (Ready-to-use styles)
// ==========================================
export const typography = {
  // Hero Headlines (Calistoga)
  heroHeadline: {
    fontFamily: fonts.display,
    fontSize: fontSize['5xl'],
    color: colors.text.primary,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,
  
  // Section Headlines (Calistoga)
  sectionHeadline: {
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: colors.text.primary,
  } as TextStyle,
  
  // Card Titles (Inter Semibold)
  cardTitle: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,
  
  // Large Body (Inter)
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.text.secondary,
  } as TextStyle,
  
  // Body (Inter)
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  } as TextStyle,
  
  // Body Secondary (Inter)
  bodySecondary: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
  } as TextStyle,
  
  // Caption (Inter)
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  } as TextStyle,
  
  // Section Labels (JetBrains Mono - UPPERCASE)
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.primary,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  } as TextStyle,
  
  // Button Text (Inter Medium)
  button: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.base,
    color: colors.accentForeground,
  } as TextStyle,
  
  // Button Large (Inter Medium)
  buttonLarge: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.lg,
    color: colors.accentForeground,
  } as TextStyle,
  
  // Input Text (Inter)
  input: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
  } as TextStyle,
  
  // Input Label (Inter Semibold)
  inputLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSize.sm,
    color: colors.text.primary,
  } as TextStyle,
  
  // Stat Value (Inter Semibold)
  statValue: {
    fontFamily: fonts.bodySemibold,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
  } as TextStyle,
  
  // Stat Label (Inter)
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  } as TextStyle,
  
  // Badge (JetBrains Mono)
  badge: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  } as TextStyle,
};

// Type export
export type Typography = typeof typography;
