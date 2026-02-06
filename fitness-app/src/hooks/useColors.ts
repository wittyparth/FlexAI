/**
 * useColors Hook - Returns theme-aware colors
 * Aligned with src/theme/colors.ts structure
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { colors as schemaColors } from '../theme/colors';

// Light mode palette
const lightColors = {
  ...schemaColors,
  
  // Navigation / Tab Bar (Backward Compatibility)
  tabBarBackground: '#FFFFFF',
  tabBarBorder: schemaColors.slate[200],
  tabBarActive: schemaColors.primary.main,
  tabBarInactive: schemaColors.slate[500],
  
  // Input Fields
  inputBackground: schemaColors.slate[100],
  inputBackgroundFocused: '#FFFFFF',
  placeholder: schemaColors.slate[400],
};

// Dark mode palette overrides
const darkColors: typeof lightColors = {
  ...schemaColors,
  
  // Core overrides
  primary: {
    ...schemaColors.primary,
    main: '#4D7CFF', // Lighter for dark mode visibility
    light: '#7A9CFF',
    dark: '#0052FF',
  },
  
  // Semantic overrides
  background: '#0F172A',      // Slate 900
  foreground: '#F1F5F9',      // Slate 100
  
  card: '#1E293B',            // Slate 800
  cardForeground: '#F1F5F9',
  
  muted: '#1E293B',           // Slate 800
  mutedForeground: '#94A3B8', // Slate 400
  
  border: '#334155',          // Slate 700
  
  ring: '#4D7CFF',

  // Complex Objects handling (if they contain colors needing inversion)
  // Slate scale is constant, but usage changes.
  
  // Navigation / Tab Bar
  tabBarBackground: '#0F172A',
  tabBarBorder: '#334155',
  tabBarActive: '#4D7CFF',
  tabBarInactive: '#64748B',
  
  // Input Fields
  inputBackground: '#1E293B',
  inputBackgroundFocused: '#334155',
  placeholder: '#64748B',
};

export type ThemeColors = typeof lightColors;

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  
  return useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);
}
