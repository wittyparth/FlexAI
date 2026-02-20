/**
 * Badge Component (Theme-Aware)
 * 
 * Premium Design System Badges
 * Styles: Subtle backgrounds (20% opacity) with strong text
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants';

interface BadgeProps {
    text: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'info';
    showDot?: boolean;
    style?: ViewStyle;
}

export function Badge({
    text,
    variant = 'primary',
    showDot = true,
    style,
}: BadgeProps) {
    const colors = useColors();

    const getVariantStyles = () => {
        // Opacity helpers would be ideal, but we'll use string concat for hex + opacity
        // '20' = ~12% opacity (approx for subtle background)
        // '33' = ~20% opacity
        
        const opacity = '33'; 

        switch (variant) {
            case 'success':
                return {
                    bg: colors.success + opacity,
                    text: colors.success,
                };
            case 'warning':
                return {
                    bg: colors.warning + opacity,
                    text: colors.warning,
                };
            case 'error':
                return {
                    bg: colors.error + opacity,
                    text: colors.error,
                };
            case 'info':
                return {
                    bg: colors.info + opacity,
                    text: colors.info,
                };
            case 'muted':
                return {
                    bg: colors.neutral[100] || colors.muted,
                    text: colors.text.secondary,
                };
            case 'primary':
            default:
                return {
                    bg: colors.primary.main + '20',
                    text: colors.primary.main,
                };
        }
    };

    const stylesValues = getVariantStyles();

    return (
        <View style={[
            styles.container,
            { backgroundColor: stylesValues.bg },
            style,
        ]}>
            {showDot && variant !== 'muted' && (
                <View style={[styles.dot, { backgroundColor: stylesValues.text }]} />
            )}
            <Text style={[styles.text, { color: stylesValues.text }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3], // 12px
        paddingVertical: spacing[1], // 4px
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: spacing[2],
    },
    text: {
        ...typography.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
