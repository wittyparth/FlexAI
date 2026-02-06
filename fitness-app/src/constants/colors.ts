/**
 * FitTrack Design System - Color Tokens
 * 
 * Design: Minimalist Modern
 * Signature: Electric Blue gradient (#0052FF → #4D7CFF)
 * Philosophy: Clarity through structure, character through bold detail
 */

export const colors = {
  // ==========================================
  // Core Brand Colors (The Signature)
  // ==========================================
  primary: '#0052FF',           // Electric Blue - primary actions, CTAs, highlights
  primaryLight: '#4D7CFF',      // Gradient endpoint
  primaryLighter: '#7A9CFF',    // Hover states, subtle accents
  primaryDark: '#0041CC',       // Active/pressed states
  
  // Gradient (THE signature visual element)
  gradient: ['#0052FF', '#4D7CFF'] as const,
  
  // ==========================================
  // Semantic Surface Colors
  // ==========================================
  background: '#FAFAFA',        // Primary canvas - warmer off-white
  foreground: '#0F172A',        // Primary text (Slate-900)
  
  card: '#FFFFFF',              // Elevated surfaces - pure white for maximum lift
  cardForeground: '#0F172A',    // Text on cards
  
  muted: '#F1F5F9',             // Secondary surfaces (Slate-100)
  mutedForeground: '#64748B',   // Secondary text (Slate-500)
  
  border: '#E2E8F0',            // Subtle structural borders (Slate-200)
  
  // Accent (main brand color)
  accent: '#0052FF',            // Primary accent (Electric Blue)
  accentSecondary: '#4D7CFF',   // Gradient endpoint
  accentForeground: '#FFFFFF',  // Text on accent backgrounds
  
  ring: '#0052FF',              // Focus rings
  
  // ==========================================
  // Semantic Status Colors
  // ==========================================
  success: '#10B981',           // Green - achievements, completed, fresh
  successLight: '#D1FAE5',      // Success background tint
  warning: '#F59E0B',           // Orange - rest timer, warnings, recovering
  warningLight: '#FEF3C7',      // Warning background tint
  error: '#EF4444',             // Red - active workout, errors
  errorLight: '#FEE2E2',        // Error background tint
  info: '#3B82F6',              // Blue - informational
  infoLight: '#DBEAFE',         // Info background tint
  
  // ==========================================
  // Text Colors
  // ==========================================
  text: {
    primary: '#0F172A',         // Slate-900 - headings, body
    secondary: '#64748B',       // Slate-500 - descriptions, metadata
    tertiary: '#94A3B8',        // Slate-400 - placeholders, disabled
    inverse: '#FFFFFF',         // On dark/accent backgrounds
  },
  
  // ==========================================
  // Workout-Specific Colors
  // ==========================================
  workout: {
    active: '#EF4444',          // Red - active workout state
    rest: '#F59E0B',            // Orange - rest timer
    complete: '#10B981',        // Green - completed sets/workouts
    warmup: '#3B82F6',          // Blue - warmup sets
  },
  
  // ==========================================
  // Gamification Colors
  // ==========================================
  gamification: {
    xp: '#8B5CF6',              // Purple - XP and experience
    streak: '#F97316',          // Orange - streak fire
    level: '#0052FF',           // Blue - level badges
    pr: '#10B981',              // Green - personal records
  },
  
  // ==========================================
  // Dark Mode (for inverted sections)
  // ==========================================
  dark: {
    background: '#0F172A',      // Deep slate
    backgroundSecondary: '#1E293B',
    text: '#F1F5F9',            // Near white
    textSecondary: '#CBD5E1',
    border: '#334155',
  },
  
  // ==========================================
  // Transparent & Overlay Colors
  // ==========================================
  transparent: 'transparent',
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(15, 23, 42, 0.6)',
    accent: 'rgba(0, 82, 255, 0.03)',
  },
};

// Type export for TypeScript
export type Colors = typeof colors;
