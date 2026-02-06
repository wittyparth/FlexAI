/**
 * Minimalist Modern Design System - Color Palette
 * Signature: Electric Blue gradient (#0052FF → #4D7CFF)
 * Philosophy: Warm near-monochrome palette with bold accent
 */

export const colors = {
  // ==========================================
  // Primary Brand Colors (The Signature)
  // ==========================================
  primary: {
    // The Electric Blue - used sparingly but with maximum impact
    main: '#0052FF',           // Primary action color, CTAs, highlights
    light: '#4D7CFF',          // Gradient endpoint
    lighter: '#7A9CFF',        // Hover states
    dark: '#0041CC',           // Active states
    
    // Gradient (THE signature visual element)
    gradient: ['#0052FF', '#4D7CFF'],
  },

  // ==========================================
  // Neutral Grays (Slate Scale)
  // ==========================================
  slate: {
    50: '#F9FAFB',
    100: '#F1F5F9',           // muted - secondary surfaces
    200: '#E2E8F0',           // border - structural borders
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',           // muted-foreground - secondary text
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',           // foreground - primary text & inverted backgrounds
  },

  // ==========================================
  // Semantic Colors
  // ==========================================
  background: '#FAFAFA',      // Primary canvas - warmer off-white
  foreground: '#0F172A',      // Primary text (Slate-900)
  
  card: '#FFFFFF',            // Elevated surfaces - pure white for maximum lift
  cardForeground: '#0F172A',
  
  muted: '#F1F5F9',          // Secondary surfaces (Slate-100)
  mutedForeground: '#64748B', // Secondary text (Slate-500)
  
  border: '#E2E8F0',         // Subtle structural borders (Slate-200)
  
  accent: '#0052FF',         // Primary accent (Electric Blue)
  accentSecondary: '#4D7CFF', // Gradient endpoint
  accentForeground: '#FFFFFF', // Text on accent backgrounds
  
  ring: '#0052FF',           // Focus rings

  // ==========================================
  // Semantic Status Colors
  // ==========================================
  success: '#10B981',        // Green - achievements, completed
  warning: '#F59E0B',        // Orange - rest timer, warnings
  error: '#EF4444',          // Red - active workout, errors
  info: '#3B82F6',           // Blue - informational

  // ==========================================
  // Workout-Specific Colors
  // ==========================================
  workout: {
    active: '#EF4444',       // Red - active workout state
    rest: '#F59E0B',         // Orange - rest timer
    complete: '#10B981',     // Green - completed sets/workouts
    warmup: '#3B82F6',       // Blue - warmup sets
  },

  // ==========================================
  // Stats-Specific Colors
  // ==========================================
  stats: {
    pr: '#8B5CF6',           // Purple - personal records
    volume: '#3B82F6',       // Blue - volume metrics
    consistency: '#10B981',   // Green - consistency/streaks
    strength: '#EF4444',     // Red - strength metrics
  },

  // ==========================================
  // Dark Mode (for inverted sections & dark mode support)
  // ==========================================
  dark: {
    background: {
      primary: '#0F172A',    // Deep slate
      secondary: '#1E293B',  // Lighter slate
      tertiary: '#334155',   // Even lighter
    },
    text: {
      primary: '#F1F5F9',    // Near white
      secondary: '#CBD5E1',  // Lighter gray
      tertiary: '#94A3B8',   // Medium gray
    },
  },

  // ==========================================
  // Shadow Colors (with opacity)
  // ==========================================
  shadow: {
    default: 'rgba(0, 0, 0, 0.08)',
    accent: 'rgba(0, 82, 255, 0.25)',      // Accent-tinted shadows
    accentLarge: 'rgba(0, 82, 255, 0.35)',  // Featured elements
  },

  // ==========================================
  // Overlay Colors
  // ==========================================
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(15, 23, 42, 0.6)',
    gradient: 'rgba(0, 82, 255, 0.03)',     // Subtle hover overlays
  },
};

export type Colors = typeof colors;

