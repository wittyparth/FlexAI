/**
 * Centralized Design System — Color Tokens
 * 
 * ⚠️  ALL screens and components MUST use these tokens via useColors() hook.
 *     DO NOT define local color constants in screens.
 * 
 * Premium palette: Deep navy/slate dark theme, crisp light theme
 * with vibrant electric blue accent and rich semantic colors.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIGHT THEME — Clean, airy, professional
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const COLORS_LIGHT = {
  // Core surfaces
  background:           '#F8FAFC',   // cool white
  foreground:           '#0F172A',   // slate-900

  // Card
  card:                 '#FFFFFF',
  cardForeground:       '#0F172A',

  // Popover
  popover:              '#FFFFFF',
  popoverForeground:    '#0F172A',

  // Primary — vibrant electric blue
  primary:              '#2563EB',   // blue-600
  primaryForeground:    '#FFFFFF',

  // Secondary
  secondary:            '#F1F5F9',   // slate-100
  secondaryForeground:  '#334155',   // slate-700

  // Muted
  muted:                '#F1F5F9',   // slate-100
  mutedForeground:      '#64748B',   // slate-500

  // Accent — soft indigo wash
  accent:               '#EEF2FF',   // indigo-50
  accentForeground:     '#3730A3',   // indigo-800

  // Destructive
  destructive:          '#EF4444',   // red-500
  destructiveForeground:'#FFFFFF',

  // Borders & Inputs
  border:               '#E2E8F0',   // slate-200
  input:                '#F1F5F9',   // slate-100
  ring:                 '#2563EB',   // matches primary for focus rings

  // Chart palette — vibrant, distinct colors
  chart1:               '#3B82F6',   // blue-500
  chart2:               '#10B981',   // emerald-500
  chart3:               '#F59E0B',   // amber-500
  chart4:               '#8B5CF6',   // violet-500
  chart5:               '#EC4899',   // pink-500

  // Sidebar
  sidebar: {
    background:           '#FFFFFF',
    foreground:           '#334155',
    primary:              '#2563EB',
    primaryForeground:    '#FFFFFF',
    accent:               '#EEF2FF',
    accentForeground:     '#3730A3',
    border:               '#E2E8F0',
    ring:                 '#2563EB',
  },

  // Semantic
  success:  '#10B981',   // emerald-500
  warning:  '#F59E0B',   // amber-500
  error:    '#EF4444',   // red-500
  info:     '#3B82F6',   // blue-500

  // Neutral scale  (slate-based for premium cool tone)
  neutral: {
     50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARK THEME — Rich, deep, immersive
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const COLORS_DARK = {
  // Core surfaces — deep navy layering
  background:           '#0B1120',   // deep navy
  foreground:           '#F1F5F9',   // slate-100

  // Card — elevated surface
  card:                 '#111827',   // slightly lighter navy
  cardForeground:       '#F1F5F9',

  // Popover
  popover:              '#1E293B',   // slate-800
  popoverForeground:    '#F1F5F9',

  // Primary — electric blue
  primary:              '#3B82F6',   // blue-500
  primaryForeground:    '#FFFFFF',

  // Secondary
  secondary:            '#1E293B',   // slate-800
  secondaryForeground:  '#E2E8F0',

  // Muted
  muted:                '#1E293B',   // slate-800
  mutedForeground:      '#94A3B8',   // slate-400

  // Accent — indigo glow
  accent:               '#1E1B4B',   // indigo-950
  accentForeground:     '#A5B4FC',   // indigo-300

  // Destructive
  destructive:          '#F87171',   // red-400
  destructiveForeground:'#FFFFFF',

  // Borders & Inputs
  border:               '#1E293B',   // slate-800
  input:                '#1E293B',
  ring:                 '#3B82F6',

  // Chart palette — vibrant on dark
  chart1:               '#60A5FA',   // blue-400
  chart2:               '#34D399',   // emerald-400
  chart3:               '#FBBF24',   // amber-400
  chart4:               '#A78BFA',   // violet-400
  chart5:               '#F472B6',   // pink-400

  // Sidebar
  sidebar: {
    background:           '#111827',
    foreground:           '#E2E8F0',
    primary:              '#3B82F6',
    primaryForeground:    '#FFFFFF',
    accent:               '#1E293B',
    accentForeground:     '#A5B4FC',
    border:               '#1F2937',
    ring:                 '#3B82F6',
  },

  // Semantic — brighter for dark backgrounds
  success:  '#34D399',   // emerald-400
  warning:  '#FBBF24',   // amber-400
  error:    '#F87171',   // red-400
  info:     '#60A5FA',   // blue-400

  // Neutral scale (inverted slate)
  neutral: {
     50: '#0F172A',
    100: '#1E293B',
    200: '#334155',
    300: '#475569',
    400: '#64748B',
    500: '#94A3B8',
    600: '#CBD5E1',
    700: '#E2E8F0',
    800: '#F1F5F9',
    900: '#F8FAFC',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRADIENTS — Rich, multi-stop for premium feel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const GRADIENTS = {
  primary: {
    light: ['#2563EB', '#7C3AED'] as const,    // blue → violet
    dark:  ['#3B82F6', '#8B5CF6'] as const,
  },
  subtle: {
    light: ['#F8FAFC', '#EEF2FF'] as const,    // white → indigo wash
    dark:  ['#0B1120', '#1E1B4B'] as const,    // navy → indigo
  },
  chart: {
    light: ['#3B82F6', '#8B5CF6'] as const,
    dark:  ['#60A5FA', '#A78BFA'] as const,
  },
  darkOverlay: {
    light: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as const,
    dark:  ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)'] as const,
  },
  // Premium accent gradients
  fire: {
    light: ['#F97316', '#EF4444'] as const,    // orange → red
    dark:  ['#FB923C', '#F87171'] as const,
  },
  emerald: {
    light: ['#10B981', '#059669'] as const,    // emerald
    dark:  ['#34D399', '#10B981'] as const,
  },
  purple: {
    light: ['#7C3AED', '#4F46E5'] as const,   // violet → indigo
    dark:  ['#A78BFA', '#818CF8'] as const,
  },
  gold: {
    light: ['#F59E0B', '#D97706'] as const,
    dark:  ['#FBBF24', '#F59E0B'] as const,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY EXPORTS (backward compat)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const colors = {
  ...COLORS_LIGHT,
  primary: {
    main: COLORS_LIGHT.primary,
    light: COLORS_LIGHT.muted,
    dark: COLORS_LIGHT.foreground,
    ...COLORS_LIGHT,
  },
};

export type ColorsLight = typeof COLORS_LIGHT;
export type ColorsDark = typeof COLORS_DARK;
export type Colors = ColorsLight;
