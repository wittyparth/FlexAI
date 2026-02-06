/**
 * Theme Context - Dark/Light Mode Support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@fittrack_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');

    // Determine if dark mode is active
    const isDark = mode === 'system'
        ? systemColorScheme === 'dark'
        : mode === 'dark';

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved && ['light', 'dark', 'system'].includes(saved)) {
                    setModeState(saved as ThemeMode);
                }
            } catch (e) {
                console.warn('Failed to load theme preference');
            }
        };
        loadTheme();
    }, []);

    // Save theme preference
    const setMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch (e) {
            console.warn('Failed to save theme preference');
        }
    };

    const toggleTheme = () => {
        const newMode = isDark ? 'light' : 'dark';
        setMode(newMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, isDark, setMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
