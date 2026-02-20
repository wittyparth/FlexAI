/**
 * FitTrack Design System - Central Export
 */

// Export all tokens
export { fonts, fontSize, letterSpacing, typography } from './typography';
export { spacing, borderRadius, sizing, duration } from './layout';
export { shadows, SHADOWS, SHADOWS_LIGHT, SHADOWS_DARK } from './shadows';
export { COLORS_LIGHT, COLORS_DARK, GRADIENTS } from './colors';
export { FONTS, TYPOGRAPHY, FONT_WEIGHTS } from './typography';

// Re-export types
export type { Colors } from './colors';
// export type { Typography } from './typography'; // Not exported currently

export { colors } from './colors'; // Legacy default export usage
