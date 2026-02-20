/**
 * useColors Hook — Centralized Theme-Aware Color Provider
 * 
 * ⚠️  THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL COLORS.
 *     Every screen and component MUST use this hook.
 *     DO NOT define local color constants in screens.
 * 
 * Access Patterns:
 *   colors.background        → string (background surface)
 *   colors.foreground         → string (primary text)
 *   colors.card               → string (card surface)
 *   colors.cardForeground     → string (text on cards)
 *   colors.popover            → string (popover surface)
 *   colors.popoverForeground  → string (text on popovers)
 *   colors.primary.main       → string (primary brand)
 *   colors.primary.foreground → string (text on primary)
 *   colors.secondary          → string (secondary surface)
 *   colors.muted              → string (muted surface)
 *   colors.mutedForeground    → string (muted text)
 *   colors.accent             → string (accent surface)
 *   colors.destructive        → string (error/destructive)
 *   colors.border             → string (border color)
 *   colors.input              → string (input background)
 *   colors.ring               → string (focus ring)
 *   colors.chart1–5           → string (chart palette — colorful)
 *   colors.neutral[100–900]   → string (neutral scale)
 *   colors.slate[100–900]     → string (alias for neutral)
 *   colors.success/warning/error/info → string (semantic)
 *   colors.sidebar.*          → sidebar-specific tokens
 *   colors.text.primary/secondary/tertiary/inverse → legacy text
 */

import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS_LIGHT, COLORS_DARK, GRADIENTS } from '../constants/colors';

const createThemePalette = (baseColors: typeof COLORS_LIGHT, isDark: boolean) => {
  return {
    // ── All flat tokens from base ──
    ...baseColors,

    // ── Override primary: string → object for .main/.foreground ──
    primary: {
      main:       baseColors.primary,
      foreground: baseColors.primaryForeground,
      light:      baseColors.muted,
      lighter:    baseColors.secondary,
      dark:       baseColors.foreground,
      gradient:   isDark ? GRADIENTS.primary.dark : GRADIENTS.primary.light,
    },

    // ── Legacy text object ──
    text: {
      primary:   baseColors.foreground,
      secondary: baseColors.mutedForeground,
      tertiary:  baseColors.mutedForeground,
      inverse:   baseColors.primaryForeground,
      link:      baseColors.chart1,
    },

    // ── Slate alias → neutral (prevents runtime crashes) ──
    slate: baseColors.neutral,

    // ── Semantic stat colors ──
    stats: {
      pr:          baseColors.chart4,
      volume:      baseColors.chart1,
      consistency: baseColors.chart2,
      strength:    baseColors.destructive,
    },
    workout: {
      active:   baseColors.destructive,
      rest:     baseColors.chart5,
      complete: baseColors.chart2,
      warmup:   baseColors.chart1,
    },
    gamification: {
      xp:     baseColors.chart4,
      streak:  baseColors.chart5,
      level:   baseColors.primary,
      pr:      baseColors.chart2,
    },

    // ── Sidebar / Menu ──
    menu: {
      item:       baseColors.sidebar.foreground,
      itemActive: baseColors.sidebar.accent,
      text:       baseColors.sidebar.foreground,
      textActive: baseColors.sidebar.primary,
      icon:       baseColors.sidebar.foreground,
      iconActive: baseColors.sidebar.primary,
    },

    // ── Navigation / Tab Bar ──
    tabBarBackground: baseColors.background,
    tabBarBorder:     baseColors.border,
    tabBarActive:     baseColors.primary,
    tabBarInactive:   baseColors.mutedForeground,

    // ── Input Fields ──
    inputBackground:        baseColors.input,
    inputBackgroundFocused:  baseColors.background,
    placeholder:            baseColors.mutedForeground,

    // ── Gradients ──
    gradients: isDark ? {
      primary:     GRADIENTS.primary.dark,
      subtle:      GRADIENTS.subtle.dark,
      chart:       GRADIENTS.chart.dark,
      darkOverlay: GRADIENTS.darkOverlay.dark,
    } : {
      primary:     GRADIENTS.primary.light,
      subtle:      GRADIENTS.subtle.light,
      chart:       GRADIENTS.chart.light,
      darkOverlay: GRADIENTS.darkOverlay.light,
    },
  };
};

const lightTheme = createThemePalette(COLORS_LIGHT, false);
const darkTheme  = createThemePalette(COLORS_DARK, true);

export type ThemeColors = typeof lightTheme;

export function useColors(): ThemeColors {
  const { isDark } = useTheme();
  return useMemo(() => isDark ? darkTheme : lightTheme, [isDark]);
}
