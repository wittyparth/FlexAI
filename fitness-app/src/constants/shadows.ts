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
  // --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05)
  '2xs': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  // --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05)
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  // --shadow-sm: ...
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // --shadow (base): ...
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  // --shadow-md: ...
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  // --shadow-lg: ...
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  // --shadow-xl: ...
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  // --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25)
  '3xl': {
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.25,
     shadowRadius: 3,
     elevation: 16,
  },
  colored: {
    shadowColor: '#000', // shadcn doesn't use colored shadows by default
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const SHADOWS_DARK = {
  // Dark mode shadows are often more subtle or just elevation in RN
  none: SHADOWS_LIGHT.none,
  '2xs': { ...SHADOWS_LIGHT['2xs'], shadowOpacity: 0.3 },
  xs: { ...SHADOWS_LIGHT.xs, shadowOpacity: 0.3 },
  sm: { ...SHADOWS_LIGHT.sm, shadowOpacity: 0.4 },
  md: { ...SHADOWS_LIGHT.md, shadowOpacity: 0.4 },
  lg: { ...SHADOWS_LIGHT.lg, shadowOpacity: 0.5 },
  xl: { ...SHADOWS_LIGHT.xl, shadowOpacity: 0.6 },
  '2xl': { ...SHADOWS_LIGHT['2xl'], shadowOpacity: 0.6 },
  '3xl': { ...SHADOWS_LIGHT['3xl'], shadowOpacity: 0.7 },
  colored: { ...SHADOWS_LIGHT.colored, shadowOpacity: 0.4 },
};

export const SHADOWS = {
  light: SHADOWS_LIGHT,
  dark: SHADOWS_DARK,
};

export const shadows = SHADOWS_LIGHT; 
