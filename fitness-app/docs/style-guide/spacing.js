// theme/spacing.js
// 8-point Grid Spacing System

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

// Layout Constants
export const LAYOUT = {
  // Screen Padding
  screenHorizontal: SPACING.base, // 16
  screenTop: SPACING.huge, // 48
  screenBottom: SPACING.xl, // 24

  // Section Spacing
  sectionGap: SPACING.xl, // 24
  sectionGapLarge: SPACING.xxl, // 32

  // Card Spacing
  cardPadding: SPACING.base, // 16
  cardPaddingLarge: SPACING.xl, // 24
  cardGap: SPACING.md, // 12

  // Component Spacing
  componentGap: SPACING.md, // 12
  elementGap: SPACING.sm, // 8

  // List Spacing
  listItemGap: SPACING.base, // 16
  listPadding: SPACING.base, // 16
};

// Touch Target Sizes (Minimum for accessibility)
export const TOUCH_TARGETS = {
  minimum: 48,
  small: 36,
  medium: 48,
  large: 56,
};
