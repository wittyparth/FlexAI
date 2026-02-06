// theme/colors.js
// Premium Banking App Color System

export const COLORS_LIGHT = {
  // Primary Colors (Blue - Trust & Finance)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary Colors (Green - Success & Growth)
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary color
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
    warning: '#F59E0B',
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
    xl: 'rgba(0, 0, 0, 0.2)',
    colored: 'rgba(33, 150, 243, 0.2)',
  },
};

export const COLORS_DARK = {
  // Primary Colors (Lighter in dark mode)
  primary: {
    50: '#0D47A1',
    100: '#1565C0',
    200: '#1976D2',
    300: '#1E88E5',
    400: '#2196F3',
    500: '#42A5F5', // Main primary (lighter)
    600: '#64B5F6',
    700: '#90CAF9',
    800: '#BBDEFB',
    900: '#E3F2FD',
  },

  // Secondary Colors (Lighter in dark mode)
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

  // Semantic Colors (Lighter for dark mode)
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

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
    warning: '#FBBF24',
  },

  // Border Colors
  border: {
    light: '#1F2937',
    default: '#374151',
    dark: '#4B5563',
    focus: '#42A5F5',
  },

  // Shadow Colors (More pronounced in dark mode)
  shadow: {
    sm: 'rgba(0, 0, 0, 0.3)',
    md: 'rgba(0, 0, 0, 0.4)',
    lg: 'rgba(0, 0, 0, 0.5)',
    xl: 'rgba(0, 0, 0, 0.6)',
    colored: 'rgba(66, 165, 245, 0.3)',
  },
};

// Gradient Definitions
export const GRADIENTS = {
  // Primary Gradient (Blue)
  primary: {
    light: ['#2196F3', '#1976D2'],
    dark: ['#42A5F5', '#2196F3'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Success Gradient (Green)
  success: {
    light: ['#4CAF50', '#388E3C'],
    dark: ['#66BB6A', '#4CAF50'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Warm Gradient (Red-Orange)
  warm: {
    light: ['#FF6B6B', '#FF8E53'],
    dark: ['#FF8E53', '#FF6B6B'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Cool Gradient (Purple)
  cool: {
    light: ['#667EEA', '#764BA2'],
    dark: ['#764BA2', '#667EEA'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Dark Overlay (for images)
  darkOverlay: {
    light: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)'],
    dark: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
