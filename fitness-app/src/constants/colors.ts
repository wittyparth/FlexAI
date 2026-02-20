/**
 * Centralized Design System — Color Tokens
 * 
 * Source: shadcn/ui CSS variables (oklch → hex)
 * 
 * ⚠️  ALL screens and components MUST use these tokens via useColors() hook.
 *     DO NOT define local color constants in screens.
 * 
 * oklch conversion reference:
 *   Achromatic: oklch(L 0 0) → grayscale hex
 *   Chromatic:  oklch(L C H) → computed via oklab→sRGB
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIGHT THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const COLORS_LIGHT = {
  // Core surfaces
  background:           '#FFFFFF',   // oklch(1 0 0)
  foreground:           '#171717',   // oklch(0.145 0 0)

  // Card
  card:                 '#FDFDFD',   // oklch(0.995 0 0)
  cardForeground:       '#171717',   // oklch(0.145 0 0)

  // Popover
  popover:              '#FFFFFF',   // oklch(1 0 0)
  popoverForeground:    '#171717',   // oklch(0.145 0 0)

  // Primary (monochrome per shadcn zinc)
  primary:              '#1A1A1A',   // oklch(0.205 0 0)
  primaryForeground:    '#FAFAFA',   // oklch(0.985 0 0)

  // Secondary
  secondary:            '#D4D4D4',   // oklch(0.87 0 0)
  secondaryForeground:  '#171717',   // oklch(0.145 0 0)

  // Muted
  muted:                '#ECECEC',   // oklch(0.95 0 0)
  mutedForeground:      '#737373',   // oklch(0.556 0 0)

  // Accent
  accent:               '#ECECEC',   // oklch(0.95 0 0)
  accentForeground:     '#1A1A1A',   // oklch(0.205 0 0)

  // Destructive
  destructive:          '#DC2626',   // oklch(0.577 0.245 27.325)
  destructiveForeground:'#FFFFFF',   // oklch(1 0 0)

  // Borders & Inputs
  border:               '#ECECEC',   // oklch(0.95 0 0)
  input:                '#F5F5F5',   // oklch(0.97 0 0)
  ring:                 '#A3A3A3',   // oklch(0.708 0 0)

  // Chart palette (chromatic — the ONLY colorful tokens)
  chart1:               '#4B91F1',   // oklch(0.81 0.10 252) — blue
  chart2:               '#2563EB',   // oklch(0.62 0.19 260) — vivid blue
  chart3:               '#6D28D9',   // oklch(0.55 0.22 263) — indigo
  chart4:               '#7C3AED',   // oklch(0.49 0.22 264) — purple
  chart5:               '#5B21B6',   // oklch(0.42 0.18 266) — deep purple

  // Sidebar
  sidebar: {
    background:           '#FAFAFA',   // oklch(0.985 0 0)
    foreground:           '#171717',   // oklch(0.145 0 0)
    primary:              '#1A1A1A',   // oklch(0.205 0 0)
    primaryForeground:    '#FAFAFA',   // oklch(0.985 0 0)
    accent:               '#F5F5F5',   // oklch(0.97 0 0)
    accentForeground:     '#1A1A1A',   // oklch(0.205 0 0)
    border:               '#E5E5E5',   // oklch(0.922 0 0)
    ring:                 '#A3A3A3',   // oklch(0.708 0 0)
  },

  // Semantic (legacy bridges)
  success:  '#10B981',
  warning:  '#F59E0B',
  error:    '#DC2626',
  info:     '#4B91F1',

  // Neutral scale (zinc-mapped)
  neutral: {
     50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#ECECEC',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARK THEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const COLORS_DARK = {
  // Core surfaces
  background:           '#262626',   // oklch(0.205 0 0)
  foreground:           '#FAFAFA',   // oklch(0.985 0 0)

  // Card
  card:                 '#1F1F1F',   // oklch(0.165 0 0)
  cardForeground:       '#FAFAFA',   // oklch(0.985 0 0)

  // Popover
  popover:              '#262626',   // oklch(0.205 0 0)
  popoverForeground:    '#FAFAFA',   // oklch(0.985 0 0)

  // Primary
  primary:              '#E5E5E5',   // oklch(0.922 0 0)
  primaryForeground:    '#262626',   // oklch(0.205 0 0)

  // Secondary
  secondary:            '#3B3B3B',   // oklch(0.269 0 0)
  secondaryForeground:  '#FAFAFA',   // oklch(0.985 0 0)

  // Muted
  muted:                '#3B3B3B',   // oklch(0.269 0 0)
  mutedForeground:      '#A3A3A3',   // oklch(0.708 0 0)

  // Accent
  accent:               '#525252',   // oklch(0.371 0 0)
  accentForeground:     '#FAFAFA',   // oklch(0.985 0 0)

  // Destructive
  destructive:          '#F87171',   // oklch(0.704 0.191 22.216)
  destructiveForeground:'#FAFAFA',   // oklch(0.985 0 0)

  // Borders & Inputs
  border:               '#3B3B3B',   // oklch(0.269 0 0)
  input:                '#3B3B3B',   // oklch(0.269 0 0)
  ring:                 '#737373',   // oklch(0.556 0 0)

  // Chart palette (same in both themes)
  chart1:               '#4B91F1',   // oklch(0.81 0.10 252)
  chart2:               '#2563EB',   // oklch(0.62 0.19 260)
  chart3:               '#6D28D9',   // oklch(0.55 0.22 263)
  chart4:               '#7C3AED',   // oklch(0.49 0.22 264)
  chart5:               '#5B21B6',   // oklch(0.42 0.18 266)

  // Sidebar
  sidebar: {
    background:           '#3B3B3B',   // oklch(0.269 0 0)
    foreground:           '#FAFAFA',   // oklch(0.985 0 0)
    primary:              '#7C3AED',   // oklch(0.488 0.243 264.376) — purple
    primaryForeground:    '#FAFAFA',   // oklch(0.985 0 0)
    accent:               '#3B3B3B',   // oklch(0.269 0 0)
    accentForeground:     '#FAFAFA',   // oklch(0.985 0 0)
    border:               '#3D3D3D',   // oklch(0.275 0 0)
    ring:                 '#666666',   // oklch(0.439 0 0)
  },

  // Semantic (legacy bridges)
  success:  '#34D399',
  warning:  '#FBBF24',
  error:    '#F87171',
  info:     '#60A5FA',

  // Neutral scale (inverted for dark)
  neutral: {
     50: '#171717',
    100: '#262626',
    200: '#3B3B3B',
    300: '#525252',
    400: '#737373',
    500: '#A3A3A3',
    600: '#D4D4D4',
    700: '#E5E5E5',
    800: '#ECECEC',
    900: '#FAFAFA',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRADIENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const GRADIENTS = {
  primary: {
    light: [COLORS_LIGHT.primary, COLORS_LIGHT.primary] as const,
    dark:  [COLORS_DARK.primary, COLORS_DARK.primary] as const,
  },
  subtle: {
    light: [COLORS_LIGHT.background, COLORS_LIGHT.muted] as const,
    dark:  [COLORS_DARK.background, COLORS_DARK.muted] as const,
  },
  chart: {
    light: [COLORS_LIGHT.chart1, COLORS_LIGHT.chart4] as const,
    dark:  [COLORS_DARK.chart1, COLORS_DARK.chart4] as const,
  },
  darkOverlay: {
    light: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)'] as const,
    dark:  ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'] as const,
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
