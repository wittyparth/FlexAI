// components/ExampleButton.js
// Example: How to create a Button component using the design system

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BUTTON_STYLES, BUTTON_TEXT_STYLES } from '../theme/components/buttons';
import { Feather } from '@expo/vector-icons';

/**
 * PrimaryButton Component
 * @param {string} title - Button text
 * @param {function} onPress - Button press handler
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled - Disable button
 * @param {string} icon - Icon name from Feather icons
 * @param {boolean} fullWidth - Make button full width
 */
const PrimaryButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  icon,
  fullWidth = false 
}) => {
  const { colors, shadows } = useTheme();

  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.primary,
        { backgroundColor: colors.primary[500] },
        shadows.md,
        fullWidth && BUTTON_STYLES.fullWidth,
        disabled && BUTTON_STYLES.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <>
          {icon && (
            <Feather name={icon} size={20} color={colors.text.inverse} />
          )}
          <Text style={[BUTTON_TEXT_STYLES.primary, { color: colors.text.inverse }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * SecondaryButton Component (Outlined)
 */
const SecondaryButton = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  icon,
  fullWidth = false 
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.secondary,
        { borderColor: colors.primary[500] },
        fullWidth && BUTTON_STYLES.fullWidth,
        disabled && BUTTON_STYLES.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary[500]} />
      ) : (
        <>
          {icon && (
            <Feather name={icon} size={20} color={colors.primary[500]} />
          )}
          <Text style={[BUTTON_TEXT_STYLES.secondary, { color: colors.primary[500] }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * IconButton Component (Round)
 */
const IconButton = ({ icon, onPress, variant = 'primary' }) => {
  const { colors, shadows } = useTheme();

  const backgroundColor = variant === 'primary' 
    ? colors.primary[500] 
    : colors.background.secondary;

  const iconColor = variant === 'primary'
    ? colors.text.inverse
    : colors.text.primary;

  return (
    <TouchableOpacity
      style={[
        BUTTON_STYLES.iconRound,
        { backgroundColor },
        variant === 'primary' && shadows.sm,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={20} color={iconColor} />
    </TouchableOpacity>
  );
};

export { PrimaryButton, SecondaryButton, IconButton };

// USAGE EXAMPLE:
/*
import { PrimaryButton, SecondaryButton, IconButton } from './components/ExampleButton';

const MyScreen = () => {
  return (
    <View>
      <PrimaryButton
        title="Get Started"
        onPress={() => console.log('Pressed')}
        icon="arrow-right"
        fullWidth
      />
      
      <SecondaryButton
        title="Learn More"
        onPress={() => console.log('Pressed')}
      />
      
      <IconButton
        icon="settings"
        onPress={() => console.log('Settings')}
      />
    </View>
  );
};
*/
