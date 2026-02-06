// theme/typography.js
// Typography System

// Font Weights
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Font Families
export const FONTS = {
  primary: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  mono: 'Courier',
};

// Typography Scale
export const TYPOGRAPHY = {
  // Display (Hero Text)
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -1.5,
  },

  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.15,
  },

  // Body Text
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.5,
  },
  bodyRegular: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.4,
  },

  // UI Text
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.regular,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Button Text
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 0.5,
  },

  // Financial Numbers (Monospace)
  financialLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.5,
    fontFamily: FONTS.mono,
  },
  financialMedium: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: -0.3,
    fontFamily: FONTS.mono,
  },
  financialSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0,
    fontFamily: FONTS.mono,
  },
};

// Helper function to create text style
export const createTextStyle = (typography, color) => ({
  ...typography,
  color,
});
