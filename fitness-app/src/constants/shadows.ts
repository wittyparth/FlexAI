/**
 * Premium FitTrack Design System - Shadow Tokens
 * 
 * Source: shadcn/ui variables
 */

// Helper to convert CSS shadow to RN shadow props
// Note: React Native implementation of shadows is different (elevation vs shadowProps).
// We simulate the look defined in CSS variables.

export const SHADOWS_LIGHT = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Hair-line lift — buttons, chips
  '2xs': {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  // Subtle card lift
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  // Standard card
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  // Elevated card / feature section
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  // Hero elements / modals
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 14,
  },
  // Full-screen bottom sheet
  '2xl': {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 48,
    elevation: 20,
  },
  '3xl': {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.22,
    shadowRadius: 64,
    elevation: 24,
  },
  // Primary-brand tinted shadow (electric blue glow)
  colored: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  // Stronger primary glow for CTAs
  coloredLg: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  // Bottom sheet float shadow
  float: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
};

export const SHADOWS_DARK = {
  none: SHADOWS_LIGHT.none,
  '2xs': { ...SHADOWS_LIGHT['2xs'], shadowOpacity: 0.35 },
  xs:   { ...SHADOWS_LIGHT.xs,   shadowOpacity: 0.40 },
  sm:   { ...SHADOWS_LIGHT.sm,   shadowOpacity: 0.45 },
  md:   { ...SHADOWS_LIGHT.md,   shadowOpacity: 0.50 },
  lg:   { ...SHADOWS_LIGHT.lg,   shadowOpacity: 0.55 },
  xl:   { ...SHADOWS_LIGHT.xl,   shadowOpacity: 0.60 },
  '2xl':{ ...SHADOWS_LIGHT['2xl'], shadowOpacity: 0.65 },
  '3xl':{ ...SHADOWS_LIGHT['3xl'], shadowOpacity: 0.70 },
  colored: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 8,
  },
  coloredLg: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 12,
  },
  float: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 16,
  },
};

export const SHADOWS = {
  light: SHADOWS_LIGHT,
  dark: SHADOWS_DARK,
};

export const shadows = {
  ...SHADOWS_LIGHT,
  accent:     SHADOWS_LIGHT.colored,
  accentLarge: SHADOWS_LIGHT.coloredLg,
} as const;
