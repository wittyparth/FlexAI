// theme/ThemeContext.js
// Theme Provider for Light/Dark Mode Management

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS_LIGHT, COLORS_DARK, GRADIENTS } from './colors';
import { SHADOWS_LIGHT, SHADOWS_DARK } from './shadows';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Update theme when system preference changes
  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const theme = {
    // Colors
    colors: isDarkMode ? COLORS_DARK : COLORS_LIGHT,
    
    // Shadows
    shadows: isDarkMode ? SHADOWS_DARK : SHADOWS_LIGHT,
    
    // Gradients
    gradients: Object.keys(GRADIENTS).reduce((acc, key) => {
      acc[key] = {
        ...GRADIENTS[key],
        colors: isDarkMode ? GRADIENTS[key].dark : GRADIENTS[key].light,
      };
      return acc;
    }, {}),
    
    // Mode state
    isDarkMode,
    
    // Toggle function
    toggleTheme: () => setIsDarkMode(!isDarkMode),
    
    // Set specific mode
    setLightMode: () => setIsDarkMode(false),
    setDarkMode: () => setIsDarkMode(true),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// HOC to inject theme as props
export const withTheme = (Component) => {
  return (props) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};
