/**
 * Minimalist Modern Design System - Shadow System
 * React Native shadow properties adapted for iOS and Android
 */

import { ViewStyle } from 'react-native';

// Shadow presets for React Native
// Note: Android uses elevation, iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius

export const shadows = {
  // Subtle lift
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  } as ViewStyle,
  
  // Standard cards
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  } as ViewStyle,
  
  // Elevated cards
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  } as ViewStyle,
  
  // Hero elements
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  } as ViewStyle,
  
  // Accent-tinted shadow (for primary elements)
  accent: {
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  } as ViewStyle,
  
  // Large accent shadow (for featured elements)
  accentLarge: {
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  } as ViewStyle,
  
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
};

export type Shadows = typeof shadows;
