/**
 * Minimalist Modern Design System - Spacing Scale
 * Philosophy: Generous, intentional whitespace balanced by component density
 */

// Base unit: 4px (React Native works in density-independent pixels)
const BASE = 4;

export const spacing = {
  // Micro spacing
  0: 0,
  0.5: BASE * 0.5,   // 2px
  1: BASE,           // 4px
  1.5: BASE * 1.5,   // 6px
  2: BASE * 2,       // 8px
  2.5: BASE * 2.5,   // 10px
  3: BASE * 3,       // 12px
  3.5: BASE * 3.5,   // 14px
  4: BASE * 4,       // 16px
  5: BASE * 5,       // 20px
  6: BASE * 6,       // 24px
  
  // Medium spacing
  7: BASE * 7,       // 28px
  8: BASE * 8,       // 32px
  9: BASE * 9,       // 36px
  10: BASE * 10,     // 40px
  11: BASE * 11,     // 44px
  12: BASE * 12,     // 48px
  14: BASE * 14,     // 56px
  16: BASE * 16,     // 64px
  
  // Large spacing
  20: BASE * 20,     // 80px
  24: BASE * 24,     // 96px
  28: BASE * 28,     // 112px - section padding (mobile)
  32: BASE * 32,     // 128px
  36: BASE * 36,     // 144px
  40: BASE * 40,     // 160px
  44: BASE * 44,     // 176px - section padding (desktop)
  48: BASE * 48,     // 192px
  52: BASE * 52,     // 208px
  56: BASE * 56,     // 224px
  60: BASE * 60,     // 240px
  64: BASE * 64,     // 256px
  72: BASE * 72,     // 288px
  80: BASE * 80,     // 320px
  96: BASE * 96,     // 384px
};

// Common spacing patterns
export const spacingPatterns = {
  // Component padding
  cardPadding: spacing[6],      // 24px - standard card interior
  cardPaddingLarge: spacing[10], // 40px - featured cards
  
  // Section spacing
  sectionPaddingY: spacing[28],  // 112px - mobile sections
  sectionPaddingYDesktop: spacing[44], // 176px - desktop sections
  sectionGap: spacing[16],       // 64px - between section elements
  
  // Grid gaps
  gridGapSm: spacing[5],         // 20px - tight grids
  gridGap: spacing[6],           // 24px - standard grids
  gridGapLg: spacing[8],         // 32px - loose grids
  
  // Container max width
  containerMaxWidth: 1152,       // 72rem equivalent (6xl)
  containerPadding: spacing[6],  // 24px - horizontal container padding
  
  // Touch targets
  touchTargetMin: spacing[11],   // 44px - minimum touch target
  touchTargetComfortable: spacing[12], // 48px - comfortable buttons
  touchTargetLarge: spacing[14], // 56px - large CTAs
  
  // Stack spacing
  stackXs: spacing[2],           // 8px
  stackSm: spacing[3],           // 12px
  stack: spacing[4],             // 16px
  stackLg: spacing[6],           // 24px
  stackXl: spacing[8],           // 32px
};

export type Spacing = typeof spacing;
export type SpacingPatterns = typeof spacingPatterns;
