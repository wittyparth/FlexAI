/**
 * Theme Re-export Module
 * 
 * ⚠️ ALL TOKENS COME FROM src/constants/
 */

// Re-export everything from constants (single source of truth)
export { 
  colors, 
  COLORS_LIGHT, 
  COLORS_DARK, 
  GRADIENTS 
} from '../constants/colors';

export { 
  fonts, 
  fontSize, 
  letterSpacing, 
  typography, 
  FONTS, 
  TYPOGRAPHY 
} from '../constants/typography';

export { 
  spacing, 
  borderRadius, 
  layout, 
  SPACING, 
  RADIUS,
  sizing,
  duration 
} from '../constants/layout';

export { 
  shadows, 
  SHADOWS, 
  SHADOWS_LIGHT, 
  SHADOWS_DARK 
} from '../constants/shadows';

export type { Colors, ColorsLight, ColorsDark } from '../constants/colors';
