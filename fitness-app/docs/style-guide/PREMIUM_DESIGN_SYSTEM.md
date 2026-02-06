# Premium Banking App Design System
### AI-Optimized Design System for React Native/Expo

---

## 🎨 CORE DESIGN PHILOSOPHY

**Premium Minimalism**: Clean, spacious interfaces with subtle depth through shadows and gradients
**Trust & Security**: Professional color palette with blue as primary (trust), balanced with neutrals
**Modern Fintech**: Glass morphism, soft shadows, rounded corners, and floating elements
**Accessibility First**: High contrast ratios, large touch targets, clear hierarchy

---

## 📐 SPACING SYSTEM

Use a consistent 8-point grid system. All spacing must be multiples of 4.

```javascript
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

// Usage in styles
paddingHorizontal: SPACING.base, // 16
marginBottom: SPACING.xl, // 24
gap: SPACING.md, // 12
```

**Layout Margins**:
- Screen horizontal padding: 16px (SPACING.base)
- Screen top padding: 48px (SPACING.huge) or use SafeAreaView
- Screen bottom padding: 24px (SPACING.xl)
- Section spacing: 24-32px (SPACING.xl - SPACING.xxl)

---

## 🎨 COLOR PALETTE

### Light Mode Colors

```javascript
export const COLORS_LIGHT = {
  // Primary Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Secondary Colors (Accent)
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Success green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Neutral Colors (Grayscale)
  neutral: {
    0: '#FFFFFF',     // Pure white
    50: '#FAFBFC',    // Off white background
    100: '#F5F7FA',   // Light background
    200: '#E4E9F2',   // Border light
    300: '#C5CEE0',   // Border
    400: '#8F9BB3',   // Text tertiary
    500: '#6B7280',   // Text secondary
    600: '#4B5563',   // Text secondary dark
    700: '#374151',   // Text primary
    800: '#1F2937',   // Text primary dark
    900: '#111827',   // Almost black
    950: '#0A0E1A',   // Pure black alternative
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Special Colors
  gradient: {
    start: '#2196F3',
    end: '#1976D2',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    tertiary: '#FAFBFC',
    card: '#FFFFFF',
    input: '#F5F7FA',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#2196F3',
    success: '#10B981',
    error: '#EF4444',
  },
  
  // Border Colors
  border: {
    light: '#E4E9F2',
    default: '#C5CEE0',
    dark: '#8F9BB3',
    focus: '#2196F3',
  },
  
  // Shadow Colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.05)',
    md: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    colored: 'rgba(33, 150, 243, 0.2)',
  },
};
```

### Dark Mode Colors

```javascript
export const COLORS_DARK = {
  // Primary Colors (slightly adjusted for dark mode)
  primary: {
    50: '#0D47A1',
    100: '#1565C0',
    200: '#1976D2',
    300: '#1E88E5',
    400: '#2196F3',
    500: '#42A5F5', // Main primary (lighter in dark mode)
    600: '#64B5F6',
    700: '#90CAF9',
    800: '#BBDEFB',
    900: '#E3F2FD',
  },
  
  // Secondary Colors
  secondary: {
    50: '#1B5E20',
    100: '#2E7D32',
    200: '#388E3C',
    300: '#43A047',
    400: '#4CAF50',
    500: '#66BB6A',
    600: '#81C784',
    700: '#A5D6A7',
    800: '#C8E6C9',
    900: '#E8F5E9',
  },
  
  // Neutral Colors (Inverted)
  neutral: {
    0: '#000000',     // Pure black
    50: '#0A0E1A',    // Almost black
    100: '#111827',   // Dark background
    200: '#1F2937',   // Border dark
    300: '#374151',   // Border
    400: '#4B5563',   // Text tertiary
    500: '#6B7280',   // Text secondary
    600: '#8F9BB3',   // Text secondary light
    700: '#C5CEE0',   // Text primary light
    800: '#E4E9F2',   // Text primary
    900: '#F5F7FA',   // Off white
    950: '#FFFFFF',   // Pure white
  },
  
  // Semantic Colors (adjusted for dark mode)
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Special Colors
  gradient: {
    start: '#42A5F5',
    end: '#2196F3',
  },
  
  // Background Colors
  background: {
    primary: '#0A0E1A',    // Main dark background
    secondary: '#111827',  // Slightly lighter
    tertiary: '#1F2937',   // Card background
    card: '#1F2937',       // Card background
    input: '#111827',      // Input background
  },
  
  // Text Colors
  text: {
    primary: '#F5F7FA',
    secondary: '#C5CEE0',
    tertiary: '#8F9BB3',
    inverse: '#0A0E1A',
    link: '#60A5FA',
    success: '#34D399',
    error: '#F87171',
  },
  
  // Border Colors
  border: {
    light: '#1F2937',
    default: '#374151',
    dark: '#4B5563',
    focus: '#42A5F5',
  },
  
  // Shadow Colors
  shadow: {
    sm: 'rgba(0, 0, 0, 0.3)',
    md: 'rgba(0, 0, 0, 0.4)',
    lg: 'rgba(0, 0, 0, 0.5)',
    colored: 'rgba(66, 165, 245, 0.3)',
  },
};
```

---

## 📝 TYPOGRAPHY SYSTEM

### Font Families

```javascript
export const FONTS = {
  // Primary Font: SF Pro / Inter / System Default
  primary: {
    regular: 'System',      // 400 weight
    medium: 'System',       // 500 weight
    semibold: 'System',     // 600 weight
    bold: 'System',         // 700 weight
  },
  
  // Monospace for numbers/codes
  mono: 'Courier',
};

// Font Weights
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};
```

### Type Scale

```javascript
export const TYPOGRAPHY = {
  // Display Styles (Hero text)
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
  
  // Labels & UI Text
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
  
  // Buttons
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
  
  // Numbers (for financial data)
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
    fontFamily: FONTS.mono,
  },
  financialSmall: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: FONTS.mono,
  },
};
```

---

## 🎭 ELEVATION & SHADOWS

```javascript
export const SHADOWS = {
  // Light Mode Shadows
  light: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    colored: {
      shadowColor: '#2196F3',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  
  // Dark Mode Shadows (more pronounced)
  dark: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 12,
    },
    colored: {
      shadowColor: '#42A5F5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};
```

---

## 🔵 BORDER RADIUS SYSTEM

```javascript
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999, // Fully rounded (pills)
};

// Usage Guidelines:
// - Buttons: RADIUS.md (12px)
// - Cards: RADIUS.lg or RADIUS.xl (16-20px)
// - Inputs: RADIUS.md (12px)
// - Modals: RADIUS.xl (20px)
// - Pills/Badges: RADIUS.full
// - Images: RADIUS.md to RADIUS.lg
```

---

## 🎯 COMPONENT LIBRARY

### 1. BUTTONS

```javascript
// Button Variants
export const BUTTON_STYLES = {
  // Primary Button (Filled)
  primary: {
    backgroundColor: COLORS_LIGHT.primary[500], // Use theme.primary[500]
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    ...SHADOWS.light.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Secondary Button (Outlined)
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS_LIGHT.primary[500],
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Tertiary Button (Ghost/Text)
  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Destructive Button
  destructive: {
    backgroundColor: COLORS_LIGHT.error,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    ...SHADOWS.light.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Small Button
  small: {
    backgroundColor: COLORS_LIGHT.primary[500],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.sm,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Icon Button
  icon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

// Button Text Styles
export const BUTTON_TEXT_STYLES = {
  primary: {
    ...TYPOGRAPHY.button,
    color: COLORS_LIGHT.text.inverse,
  },
  secondary: {
    ...TYPOGRAPHY.button,
    color: COLORS_LIGHT.primary[500],
  },
  tertiary: {
    ...TYPOGRAPHY.button,
    color: COLORS_LIGHT.primary[500],
  },
  small: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS_LIGHT.text.inverse,
  },
};
```

### 2. CARDS

```javascript
export const CARD_STYLES = {
  // Standard Card
  default: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    ...SHADOWS.light.md,
  },
  
  // Elevated Card (more shadow)
  elevated: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.light.lg,
  },
  
  // Flat Card (no shadow, with border)
  flat: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS_LIGHT.border.light,
  },
  
  // Glass Card (semi-transparent)
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...SHADOWS.light.md,
  },
  
  // Feature Card (with gradient background)
  feature: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.light.lg,
    overflow: 'hidden',
  },
  
  // Balance Card (large financial display)
  balance: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.light.md,
    minHeight: 180,
  },
  
  // Transaction Card
  transaction: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.light.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
};
```

### 3. INPUTS

```javascript
export const INPUT_STYLES = {
  // Text Input Container
  container: {
    marginBottom: SPACING.base,
  },
  
  // Label
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS_LIGHT.text.secondary,
    marginBottom: SPACING.xs,
  },
  
  // Input Field
  input: {
    backgroundColor: COLORS_LIGHT.background.input,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS_LIGHT.text.primary,
    borderWidth: 1,
    borderColor: COLORS_LIGHT.border.light,
    minHeight: 48,
  },
  
  // Input Focused State
  inputFocused: {
    borderColor: COLORS_LIGHT.border.focus,
    ...SHADOWS.light.sm,
  },
  
  // Input Error State
  inputError: {
    borderColor: COLORS_LIGHT.error,
  },
  
  // Search Input
  search: {
    backgroundColor: COLORS_LIGHT.background.input,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS_LIGHT.text.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 44,
  },
  
  // Helper Text
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.text.tertiary,
    marginTop: SPACING.xs,
  },
  
  // Error Text
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.error,
    marginTop: SPACING.xs,
  },
};
```

### 4. BADGES & PILLS

```javascript
export const BADGE_STYLES = {
  // Success Badge
  success: {
    backgroundColor: COLORS_LIGHT.success + '20', // 20% opacity
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  successText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.success,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  
  // Warning Badge
  warning: {
    backgroundColor: COLORS_LIGHT.warning + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.warning,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  
  // Error Badge
  error: {
    backgroundColor: COLORS_LIGHT.error + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.error,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  
  // Info Badge
  info: {
    backgroundColor: COLORS_LIGHT.info + '20',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.info,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  
  // Neutral Badge
  neutral: {
    backgroundColor: COLORS_LIGHT.neutral[200],
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  neutralText: {
    ...TYPOGRAPHY.caption,
    color: COLORS_LIGHT.neutral[700],
    fontWeight: FONT_WEIGHTS.semibold,
  },
};
```

### 5. LISTS

```javascript
export const LIST_STYLES = {
  // List Container
  container: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    ...SHADOWS.light.md,
    overflow: 'hidden',
  },
  
  // List Item
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS_LIGHT.border.light,
    minHeight: 64,
  },
  
  // Last List Item (no border)
  itemLast: {
    borderBottomWidth: 0,
  },
  
  // List Item with Icon
  itemWithIcon: {
    gap: SPACING.md,
  },
  
  // Icon Container
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS_LIGHT.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // List Item Content
  itemContent: {
    flex: 1,
  },
  
  // List Item Title
  itemTitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS_LIGHT.text.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  
  // List Item Subtitle
  itemSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS_LIGHT.text.secondary,
    marginTop: SPACING.xs,
  },
  
  // List Item Trailing
  itemTrailing: {
    alignItems: 'flex-end',
  },
};
```

### 6. BOTTOM SHEETS & MODALS

```javascript
export const MODAL_STYLES = {
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  // Bottom Sheet Container
  bottomSheet: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
    ...SHADOWS.light.xl,
  },
  
  // Bottom Sheet Handle
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS_LIGHT.neutral[300],
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.base,
  },
  
  // Modal Container (Center)
  modal: {
    backgroundColor: COLORS_LIGHT.background.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    margin: SPACING.base,
    ...SHADOWS.light.xl,
  },
  
  // Modal Title
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS_LIGHT.text.primary,
    marginBottom: SPACING.md,
  },
  
  // Modal Content
  modalContent: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS_LIGHT.text.secondary,
    marginBottom: SPACING.xl,
  },
};
```

### 7. SWITCHES & CHECKBOXES

```javascript
export const SWITCH_STYLES = {
  // Switch Track
  track: {
    width: 51,
    height: 31,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[300],
    padding: 2,
  },
  trackActive: {
    backgroundColor: COLORS_LIGHT.primary[500],
  },
  
  // Switch Thumb
  thumb: {
    width: 27,
    height: 27,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[0],
    ...SHADOWS.light.sm,
  },
  
  // Checkbox Container
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    borderColor: COLORS_LIGHT.neutral[300],
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS_LIGHT.primary[500],
    borderColor: COLORS_LIGHT.primary[500],
  },
};
```

### 8. TABS

```javascript
export const TAB_STYLES = {
  // Tab Bar Container
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS_LIGHT.background.secondary,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  
  // Tab Item
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  
  // Active Tab
  tabActive: {
    backgroundColor: COLORS_LIGHT.background.card,
    ...SHADOWS.light.sm,
  },
  
  // Tab Text
  tabText: {
    ...TYPOGRAPHY.label,
    color: COLORS_LIGHT.text.secondary,
  },
  
  // Active Tab Text
  tabTextActive: {
    ...TYPOGRAPHY.label,
    color: COLORS_LIGHT.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
};
```

### 9. DIVIDERS

```javascript
export const DIVIDER_STYLES = {
  // Horizontal Divider
  horizontal: {
    height: 1,
    backgroundColor: COLORS_LIGHT.border.light,
    marginVertical: SPACING.base,
  },
  
  // Vertical Divider
  vertical: {
    width: 1,
    backgroundColor: COLORS_LIGHT.border.light,
    marginHorizontal: SPACING.base,
  },
  
  // Thick Divider
  thick: {
    height: 2,
    backgroundColor: COLORS_LIGHT.border.default,
    marginVertical: SPACING.lg,
  },
};
```

### 10. AVATARS

```javascript
export const AVATAR_STYLES = {
  // Small Avatar
  small: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[200],
  },
  
  // Medium Avatar
  medium: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[200],
  },
  
  // Large Avatar
  large: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[200],
  },
  
  // Extra Large Avatar
  xlarge: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS_LIGHT.neutral[200],
  },
};
```

---

## 🌈 GRADIENT SYSTEM

```javascript
export const GRADIENTS = {
  // Primary Gradient (Blue)
  primary: {
    colors: ['#2196F3', '#1976D2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Success Gradient (Green)
  success: {
    colors: ['#4CAF50', '#388E3C'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Warm Gradient
  warm: {
    colors: ['#FF6B6B', '#FF8E53'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Cool Gradient
  cool: {
    colors: ['#667EEA', '#764BA2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Dark Overlay Gradient
  darkOverlay: {
    colors: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
```

---

## 🎬 ANIMATION SYSTEM

```javascript
export const ANIMATIONS = {
  // Duration
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    default: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    spring: 'spring',
  },
  
  // Common Animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideUp: {
    from: { transform: [{ translateY: 20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  slideDown: {
    from: { transform: [{ translateY: -20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  scale: {
    from: { transform: [{ scale: 0.95 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
};
```

---

## 📱 SCREEN LAYOUTS

### Layout Templates

```javascript
export const LAYOUTS = {
  // Container with Safe Area
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS_LIGHT.background.primary,
  },
  
  // Screen Container
  screenContainer: {
    flex: 1,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.xl,
  },
  
  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  
  // Section Title
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS_LIGHT.text.primary,
  },
  
  // Grid (2 columns)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
  },
  gridItem: {
    width: '48%', // For 2 columns with gap
  },
  
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  
  // Column
  column: {
    flexDirection: 'column',
    gap: SPACING.md,
  },
};
```

---

## 🎨 ICON SYSTEM

```javascript
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
};

// Icon Library: Use react-native-vector-icons or expo-vector-icons
// Recommended: Feather Icons or Ionicons for consistency

export const ICON_COLORS = {
  primary: COLORS_LIGHT.primary[500],
  secondary: COLORS_LIGHT.text.secondary,
  tertiary: COLORS_LIGHT.text.tertiary,
  success: COLORS_LIGHT.success,
  warning: COLORS_LIGHT.warning,
  error: COLORS_LIGHT.error,
  inverse: COLORS_LIGHT.text.inverse,
};
```

---

## 🎯 COMPONENT USAGE EXAMPLES

### Example 1: Primary Button Component

```jsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { BUTTON_STYLES, BUTTON_TEXT_STYLES, COLORS_LIGHT } from './theme';

const PrimaryButton = ({ title, onPress, loading, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.primary,
        disabled && { opacity: 0.5 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS_LIGHT.text.inverse} />
      ) : (
        <Text style={BUTTON_TEXT_STYLES.primary}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
```

### Example 2: Card Component

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CARD_STYLES, TYPOGRAPHY, COLORS_LIGHT, SPACING } from './theme';

const Card = ({ title, subtitle, children, variant = 'default' }) => {
  return (
    <View style={CARD_STYLES[variant]}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS_LIGHT.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS_LIGHT.text.secondary,
    marginBottom: SPACING.base,
  },
});

export default Card;
```

### Example 3: Balance Card (Financial Display)

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CARD_STYLES, TYPOGRAPHY, COLORS_LIGHT, SPACING } from './theme';
import { LinearGradient } from 'expo-linear-gradient';

const BalanceCard = ({ balance, label, trend }) => {
  return (
    <LinearGradient
      colors={['#2196F3', '#1976D2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={CARD_STYLES.balance}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.balance}>${balance.toLocaleString()}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={styles.trend}>{trend}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  balance: {
    ...TYPOGRAPHY.financialLarge,
    color: '#FFFFFF',
  },
  trendContainer: {
    marginTop: SPACING.md,
  },
  trend: {
    ...TYPOGRAPHY.bodyRegular,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default BalanceCard;
```

---

## 🌙 THEME CONTEXT (Light/Dark Mode)

```jsx
// theme/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { COLORS_LIGHT, COLORS_DARK } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = {
    colors: isDarkMode ? COLORS_DARK : COLORS_LIGHT,
    isDarkMode,
    toggleTheme: () => setIsDarkMode(!isDarkMode),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Using Theme in Components

```jsx
import { useTheme } from './theme/ThemeContext';

const MyComponent = () => {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
};
```

---

## 📋 AI PROMPTING GUIDELINES

### For Consistent Screen Generation

**Always include this in your prompts to AI:**

```
Use the PREMIUM_DESIGN_SYSTEM.md for all styling. Follow these rules:

COLORS:
- Background: colors.background.primary (#FFFFFF light, #0A0E1A dark)
- Cards: colors.background.card with SHADOWS.md and RADIUS.xl
- Primary actions: colors.primary[500]
- Text: colors.text.primary, .secondary, .tertiary

SPACING:
- Screen padding: SPACING.base (16px) horizontal
- Between sections: SPACING.xl (24px)
- Card padding: SPACING.base or SPACING.xl
- Between elements: SPACING.md (12px)

TYPOGRAPHY:
- Screen titles: TYPOGRAPHY.h1
- Section titles: TYPOGRAPHY.h4
- Body text: TYPOGRAPHY.bodyLarge
- Labels: TYPOGRAPHY.label
- Financial numbers: TYPOGRAPHY.financialLarge

COMPONENTS:
- Buttons: Use BUTTON_STYLES.primary with RADIUS.md
- Cards: Use CARD_STYLES.default with RADIUS.xl
- Inputs: Use INPUT_STYLES.input with RADIUS.md
- All components use theme colors, never hardcoded hex values

LAYOUT:
- Use SafeAreaView for screen container
- Main content in ScrollView or FlatList
- Consistent section spacing with SPACING.xl
- 2-column grid uses LAYOUTS.grid
```

---

## 🎨 COLOR USAGE RULES

### Do's ✅
- Use theme colors from the color palette
- Use primary[500] for main actions
- Use neutral colors for backgrounds and borders
- Use semantic colors (success, error, warning) appropriately
- Maintain high contrast ratios (4.5:1 for body text)

### Don'ts ❌
- Never hardcode hex colors directly in components
- Don't use too many colors in one screen (max 3-4)
- Don't use light text on light backgrounds
- Don't use primary color for destructive actions

---

## 📱 RESPONSIVE GUIDELINES

```javascript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BREAKPOINTS = {
  small: width < 375,
  medium: width >= 375 && width < 768,
  large: width >= 768,
};

// Usage
const cardWidth = BREAKPOINTS.large ? '48%' : '100%';
```

---

## 🎯 ACCESSIBILITY GUIDELINES

1. **Touch Targets**: Minimum 48x48 dp
2. **Contrast**: 4.5:1 for body text, 3:1 for large text
3. **Text Size**: Minimum 14px for body text
4. **Focus Indicators**: Visible focus states on all interactive elements
5. **Labels**: All inputs must have labels
6. **Alternative Text**: All images must have alt text

---

## 📦 FILE STRUCTURE

```
src/
├── theme/
│   ├── index.js              // Export all theme tokens
│   ├── colors.js             // Color palette
│   ├── spacing.js            // Spacing system
│   ├── typography.js         // Typography scale
│   ├── shadows.js            // Shadow system
│   ├── radius.js             // Border radius
│   ├── animations.js         // Animation configs
│   ├── ThemeContext.js       // Theme provider
│   └── components/           // Component styles
│       ├── buttons.js
│       ├── cards.js
│       ├── inputs.js
│       ├── lists.js
│       └── ...
├── components/
│   ├── Button/
│   │   ├── PrimaryButton.js
│   │   ├── SecondaryButton.js
│   │   └── IconButton.js
│   ├── Card/
│   │   ├── Card.js
│   │   ├── BalanceCard.js
│   │   └── TransactionCard.js
│   └── ...
└── screens/
    ├── HomeScreen.js
    ├── TransactionsScreen.js
    └── ...
```

---

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Install required packages (expo-linear-gradient, react-native-vector-icons)
- [ ] Create theme folder structure
- [ ] Define all color palettes (light/dark)
- [ ] Set up typography system
- [ ] Create spacing and layout constants
- [ ] Define shadow system
- [ ] Build component style library
- [ ] Create ThemeContext for dark mode
- [ ] Build reusable components (Button, Card, Input, etc.)
- [ ] Test theme switching between light/dark
- [ ] Document component usage examples
- [ ] Create style guide for AI prompts

---

## 💡 PRO TIPS FOR AI CONSISTENCY

### 1. Always Reference the Design System
Start every AI prompt with: "Using the PREMIUM_DESIGN_SYSTEM..."

### 2. Be Specific About Components
Instead of: "Create a button"
Use: "Create a button using BUTTON_STYLES.primary with TYPOGRAPHY.button"

### 3. Specify Layout Structure
Always mention: screen padding, section spacing, card shadows, border radius

### 4. Use Exact Token Names
Reference: `colors.primary[500]` not "blue"
Reference: `SPACING.xl` not "24px"
Reference: `TYPOGRAPHY.h3` not "24px bold"

### 5. Maintain Hierarchy
Screen Title (h1) → Section Title (h4) → Card Title (bodyLarge + semibold)

---

## 🎨 EXAMPLE SCREENS BREAKDOWN

### From Image 1 (Light Banking App):
- **Background**: colors.background.primary (#FFFFFF)
- **Hero Text**: TYPOGRAPHY.display, mix of black + primary[500]
- **Description**: TYPOGRAPHY.bodyLarge, colors.text.secondary
- **Primary CTA**: BUTTON_STYLES.primary, RADIUS.md, full width
- **Secondary CTA**: BUTTON_STYLES.tertiary
- **Card**: CARD_STYLES.elevated with RADIUS.xxl, decorative 3D elements
- **Badge**: "INTRODUCING" using BADGE_STYLES.info

### From Image 2 (Dark Developer App):
- **Background**: colors.background.primary (#0A0E1A in dark mode)
- **Hero Text**: TYPOGRAPHY.display, white + primary[400] (lighter in dark)
- **Dashboard Card**: CARD_STYLES.default with chart, RADIUS.xl
- **Financial Display**: TYPOGRAPHY.financialLarge
- **Metric Cards**: CARD_STYLES.flat in grid layout
- **Buttons**: BUTTON_STYLES.primary (light background in dark mode)

### From Image 3 (Light FinSaaS App):
- **Background**: colors.background.secondary (#F5F7FA)
- **Trust Badge**: BADGE_STYLES.info, "TRUSTED BY 500K+"
- **Balance Card**: CARD_STYLES.elevated, prominent border, chart
- **Trend Indicator**: BADGE_STYLES.success with percentage
- **Avatar Group**: AVATAR_STYLES.small, overlapping
- **CTA Button**: BUTTON_STYLES.primary with arrow icon

---

## 📝 QUICK REFERENCE CARD

| Element | Value |
|---------|-------|
| **Primary Color** | #2196F3 (light) / #42A5F5 (dark) |
| **Background** | #FFFFFF (light) / #0A0E1A (dark) |
| **Card Background** | #FFFFFF (light) / #1F2937 (dark) |
| **Screen Padding** | 16px horizontal |
| **Section Spacing** | 24px |
| **Card Radius** | 20px (xl) |
| **Button Radius** | 12px (md) |
| **Card Shadow** | md elevation |
| **Button Height** | 48px minimum |
| **Touch Target** | 48x48 minimum |
| **Body Text** | 14px (bodyRegular) |
| **Heading** | 24px (h3) |

---

## 🎬 CONCLUSION

This design system provides:
✅ Consistent colors across light/dark modes
✅ Predictable spacing and layout
✅ Comprehensive component library
✅ Clear typography hierarchy
✅ Premium visual aesthetic
✅ AI-friendly token names
✅ Accessibility compliance
✅ React Native/Expo ready

**Remember**: Consistency is key. Always reference exact token names from this system in your AI prompts to maintain visual coherence across all screens.
