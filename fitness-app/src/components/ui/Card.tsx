/**
 * Card Component (Theme-Aware)
 * 
 * Premium Design System Cards
 * Variants: default, elevated, flat, glass, feature
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../hooks';
import { borderRadius, spacing } from '../../constants';
// Shadows handling handled via useColors or direct import
import { SHADOWS_LIGHT, SHADOWS_DARK } from '../../constants/shadows';
import { useTheme } from '../../contexts';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'flat' | 'glass' | 'feature';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    style?: StyleProp<ViewStyle>;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    style,
}: CardProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const shadows = isDark ? SHADOWS_DARK : SHADOWS_LIGHT;

    const paddingValue = {
        none: 0,
        sm: spacing[2],  // 8px
        md: spacing[4],  // 16px
        lg: spacing[6],  // 24px
        xl: spacing[8],  // 32px
    }[padding];

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: colors.card,
                    ...shadows.lg,
                    borderWidth: 0,
                };
            case 'flat':
                return {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    elevation: 0,
                    shadowOpacity: 0,
                };
            case 'glass':
                return {
                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                    ...shadows.md,
                };
            case 'feature':
                return {
                    backgroundColor: colors.primary.light + '80', // Transparent primary
                    borderColor: colors.primary.lighter,
                    borderWidth: 1,
                    ...shadows.colored,
                };
            case 'default':
            default:
                return {
                    backgroundColor: colors.card,
                    ...shadows.md,
                    borderWidth: 0,
                };
        }
    };

    return (
        <View style={[
            styles.base,
            { borderRadius: borderRadius.xl }, // 20px
            getVariantStyle(),
            { padding: paddingValue },
            style,
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        width: '100%',
        overflow: 'hidden', // For borderRadius
    },
});
