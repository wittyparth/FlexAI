// theme/index.js
// Main Theme Export File

export { COLORS_LIGHT, COLORS_DARK, GRADIENTS } from './colors';
export { SPACING, LAYOUT, TOUCH_TARGETS } from './spacing';
export { TYPOGRAPHY, FONT_WEIGHTS, FONTS, createTextStyle } from './typography';
export { SHADOWS, SHADOWS_LIGHT, SHADOWS_DARK } from './shadows';
export { RADIUS } from './radius';
export { ThemeProvider, useTheme, withTheme } from './ThemeContext';

// Icon sizes
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};

// Animation durations
export const ANIMATION_DURATION = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
};

// Breakpoints (for responsive design)
export const getBreakpoint = (width) => {
  if (width < 375) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};
