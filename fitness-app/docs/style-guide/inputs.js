// theme/components/inputs.js
// Input Component Styles

import { SPACING, RADIUS, TOUCH_TARGETS } from './spacing';
import { TYPOGRAPHY } from './typography';

export const INPUT_STYLES = {
  // Container
  container: {
    marginBottom: SPACING.base,
  },

  // Label
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.xs,
  },

  // Text Input
  input: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    ...TYPOGRAPHY.bodyLarge,
    borderWidth: 1,
    minHeight: TOUCH_TARGETS.medium,
  },

  // Input with Icon
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    minHeight: TOUCH_TARGETS.medium,
  },

  // Input Field inside container with icon
  inputField: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  // Icon Container
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search Input
  search: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    ...TYPOGRAPHY.bodyLarge,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 44,
  },

  // Textarea
  textarea: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    ...TYPOGRAPHY.bodyLarge,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  // Helper Text
  helperText: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },

  // Error Text
  errorText: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xs,
  },

  // States (to be combined with input styles)
  focused: {
    borderWidth: 2,
  },

  error: {
    borderWidth: 2,
  },

  disabled: {
    opacity: 0.5,
  },
};

// Select/Picker Styles
export const SELECT_STYLES = {
  container: {
    marginBottom: SPACING.base,
  },

  select: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    minHeight: TOUCH_TARGETS.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectText: {
    ...TYPOGRAPHY.bodyLarge,
    flex: 1,
  },

  placeholder: {
    ...TYPOGRAPHY.bodyLarge,
  },
};

// Checkbox & Radio Styles
export const CHECKBOX_STYLES = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkmark: {
    width: 12,
    height: 12,
  },

  label: {
    ...TYPOGRAPHY.bodyLarge,
    flex: 1,
  },
};

// Switch Styles
export const SWITCH_STYLES = {
  track: {
    width: 51,
    height: 31,
    borderRadius: RADIUS.full,
    padding: 2,
    justifyContent: 'center',
  },

  thumb: {
    width: 27,
    height: 27,
    borderRadius: RADIUS.full,
  },
};

// Example Usage:
/*
import { useTheme } from '../theme/ThemeContext';
import { INPUT_STYLES } from '../theme/components/inputs';

const MyInput = ({ value, onChangeText, placeholder, error }) => {
  const { colors } = useTheme();
  
  return (
    <View style={INPUT_STYLES.container}>
      <Text style={[INPUT_STYLES.label, { color: colors.text.secondary }]}>
        Label
      </Text>
      <TextInput
        style={[
          INPUT_STYLES.input,
          { 
            backgroundColor: colors.background.input,
            borderColor: error ? colors.error : colors.border.light,
            color: colors.text.primary,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
      />
      {error && (
        <Text style={[INPUT_STYLES.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};
*/
