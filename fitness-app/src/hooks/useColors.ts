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
 *   colors.primary.main       → string (primary brand — electric blue)
 *   colors.primary.foreground → string (text on primary)
 *   colors.chart1–5           → string (chart palette — vivid colors)
 *   colors.neutral[50–900]    → string (slate scale)
 *   colors.slate[50–900]      → string (alias for neutral)
 *   colors.success/warning/error/info → string (semantic)
 *   colors.toggle.*           → string (toggle/switch control)
 *   colors.badge.*            → { bg, fg } (badge variants)
 *   colors.skeleton.*         → string (loading skeleton)
 *   colors.heatmap.*          → string (intensity colors)
 *   colors.focus.*            → string (focus ring/border)
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
      light:      isDark ? '#1E3A5F' : '#DBEAFE',  // blue-900/20 or blue-100
      lighter:    isDark ? '#0C2341' : '#EFF6FF',  // darker blue or blue-50
      dark:       isDark ? '#2563EB' : '#1D4ED8',   // blue-600/700
      gradient:   isDark ? GRADIENTS.primary.dark : GRADIENTS.primary.light,
    },

    // ── Legacy text object ──
    text: {
      primary:   baseColors.foreground,
      secondary: baseColors.mutedForeground,
      tertiary:  isDark ? '#64748B' : '#94A3B8',
      inverse:   baseColors.primaryForeground,
      link:      baseColors.chart1,
    },

    // ── Slate alias → neutral (prevents runtime crashes) ──
    slate: baseColors.neutral,

    // ── Toggle / Switch ──
    toggle: {
      trackOn:    baseColors.primary,
      trackOff:   isDark ? '#334155' : '#CBD5E1',
      thumb:      '#FFFFFF',
    },

    // ── Badge variants ──
    badge: {
      default:      { bg: baseColors.primary, fg: baseColors.primaryForeground },
      secondary:    { bg: baseColors.secondary, fg: baseColors.secondaryForeground },
      destructive:  { bg: baseColors.destructive, fg: baseColors.destructiveForeground },
      outline:      { bg: 'transparent', fg: baseColors.foreground },
      success:      { bg: isDark ? '#064E3B' : '#D1FAE5', fg: baseColors.success },
      warning:      { bg: isDark ? '#451A03' : '#FEF3C7', fg: baseColors.warning },
      info:         { bg: isDark ? '#1E3A5F' : '#DBEAFE', fg: baseColors.info },
    },

    // ── Skeleton / Shimmer ──
    skeleton: {
      base:    isDark ? '#1E293B' : '#E2E8F0',
      shimmer: isDark ? '#334155' : '#F1F5F9',
    },

    // ── Heatmap intensity palette ──
    heatmap: {
      rest:      isDark ? '#1E293B' : '#F1F5F9',
      light:     isDark ? '#1E3A5F' : '#BFDBFE',
      moderate:  isDark ? '#1D4ED8' : '#60A5FA',
      heavy:     isDark ? '#3B82F6' : '#2563EB',
      todayRing: baseColors.primary,
    },

    // ── Focus / Ring ──
    focus: {
      ring:         baseColors.ring,
      inputBorder:  baseColors.primary,
      inputBg:      isDark ? '#0F172A' : '#FFFFFF',
    },

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
      warmup:   baseColors.chart3,
    },
    gamification: {
      xp:     baseColors.chart4,
      streak:  baseColors.chart3,
      level:   baseColors.primary,
      pr:      baseColors.chart2,
    },

    // ── Sidebar / Menu ──
    menu: {
      item:       isDark ? '#1E293B' : '#F1F5F9',
      itemActive: isDark ? '#1E3A5F' : '#DBEAFE',
      text:       baseColors.foreground,
      textActive: baseColors.primary,
      icon:       baseColors.mutedForeground,
      iconActive: baseColors.primary,
    },

    // ── Navigation / Tab Bar ──
    tabBarBackground: isDark ? '#0B1120' : '#FFFFFF',
    tabBarBorder:     isDark ? '#1E293B' : '#E2E8F0',
    tabBarActive:     baseColors.primary,
    tabBarInactive:   baseColors.mutedForeground,

    // ── Input Fields ──
    inputBackground:        baseColors.input,
    inputBackgroundFocused:  isDark ? '#0F172A' : '#FFFFFF',
    placeholder:            baseColors.mutedForeground,

    // ── Gradients ──
    gradients: isDark ? {
      primary:     GRADIENTS.primary.dark,
      subtle:      GRADIENTS.subtle.dark,
      chart:       GRADIENTS.chart.dark,
      darkOverlay: GRADIENTS.darkOverlay.dark,
      fire:        GRADIENTS.fire.dark,
      emerald:     GRADIENTS.emerald.dark,
      purple:      GRADIENTS.purple.dark,
      gold:        GRADIENTS.gold.dark,
    } : {
      primary:     GRADIENTS.primary.light,
      subtle:      GRADIENTS.subtle.light,
      chart:       GRADIENTS.chart.light,
      darkOverlay: GRADIENTS.darkOverlay.light,
      fire:        GRADIENTS.fire.light,
      emerald:     GRADIENTS.emerald.light,
      purple:      GRADIENTS.purple.light,
      gold:        GRADIENTS.gold.light,
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
