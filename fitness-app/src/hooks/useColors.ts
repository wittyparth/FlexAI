/**
 * useColors Hook - Returns theme-aware colors
 * 
 * ⚠️ USE THIS HOOK IN ALL SCREENS FOR CONSISTENT THEMING
 * Returns Premium Design System colors with legacy compatibility.
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS_LIGHT, COLORS_DARK, GRADIENTS } from '../constants/colors';

// Helper to create the full legacy-compatible theme object
const createThemePalette = (baseColors: typeof COLORS_LIGHT) => {
  return {
    ...baseColors,
    
    // Mapped Aliases for Backward Compatibility
    primary: {
      ...baseColors.primary,
      main: baseColors.primary[500],
      light: baseColors.primary[400],
      lighter: baseColors.primary[300],
      dark: baseColors.primary[600],
      gradient: baseColors.primary[500] === COLORS_LIGHT.primary[500] 
        ? GRADIENTS.primary.light 
        : GRADIENTS.primary.dark,
    },
    
    // Semantic aliases
    background: baseColors.background.primary,
    card: baseColors.background.card,
    border: baseColors.border.default,
    foreground: baseColors.text.primary,
    muted: baseColors.neutral[100],
    mutedForeground: baseColors.text.secondary,
    accent: baseColors.primary[500],
    accentForeground: baseColors.text.inverse,
    ring: baseColors.border.focus,

    // Legacy Objects
    stats: {
      pr: '#8B5CF6',
      volume: baseColors.info,
      consistency: baseColors.success,
      strength: baseColors.error,
    },
    workout: {
      active: baseColors.error,
      rest: baseColors.warning,
      complete: baseColors.success,
      warmup: baseColors.info,
    },
    gamification: {
      xp: '#8B5CF6',
      streak: baseColors.warning,
      level: baseColors.primary[500],
      pr: baseColors.success,
    },
    menu: {
      item: baseColors.neutral[100],
      itemActive: baseColors.primary[50], // Check contrast for dark mode
      text: baseColors.text.primary,
      textActive: baseColors.primary[600],
      icon: baseColors.primary[500],
      iconActive: baseColors.primary[600],
    },

    // Navigation / Tab Bar
    tabBarBackground: baseColors.background.primary,
    tabBarBorder: baseColors.border.light,
    tabBarActive: baseColors.primary[500],
    tabBarInactive: baseColors.text.secondary,
    
    // Input Fields
    inputBackground: baseColors.background.input,
    inputBackgroundFocused: baseColors.background.primary,
    placeholder: baseColors.text.tertiary,
  };
};

const lightTheme = createThemePalette(COLORS_LIGHT);
const darkTheme = createThemePalette(COLORS_DARK);

// Fix specific Dark Mode overrides that createThemePalette might miss
darkTheme.menu.item = COLORS_DARK.neutral[200];      // Dark sidebar item
darkTheme.menu.itemActive = COLORS_DARK.primary[900]; // Dark active item
darkTheme.menu.textActive = COLORS_DARK.primary[400]; // Lighter blue text
darkTheme.menu.iconActive = COLORS_DARK.primary[400]; // Lighter blue icon

export type ThemeColors = typeof lightTheme;

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  
  return useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);
}
