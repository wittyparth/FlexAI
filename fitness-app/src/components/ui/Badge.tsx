/**
 * Badge Component (Theme-Aware)
 * 
 * Section labels and status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '../../hooks';
import { fonts, fontSize, borderRadius, spacing, letterSpacing } from '../../constants';

interface BadgeProps {
    text: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'muted';
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
        switch (variant) {
            case 'success':
                return {
                    background: colors.successLight,
                    border: colors.success + '30',
                    dot: colors.success,
                    text: colors.success,
                };
            case 'warning':
                return {
                    background: colors.warningLight,
                    border: colors.warning + '30',
                    dot: colors.warning,
                    text: colors.warning,
                };
            case 'error':
                return {
                    background: colors.errorLight,
                    border: colors.error + '30',
                    dot: colors.error,
                    text: colors.error,
                };
            case 'muted':
                return {
                    background: colors.backgroundSecondary,
                    border: colors.border,
                    dot: colors.textTertiary,
                    text: colors.textSecondary,
                };
            default:
                return {
                    background: colors.primary + '08',
                    border: colors.primary + '30',
                    dot: colors.primary,
                    text: colors.primary,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: variantStyles.background,
                borderColor: variantStyles.border,
            },
            style,
        ]}>
            {showDot && (
                <View style={[styles.dot, { backgroundColor: variantStyles.dot }]} />
            )}
            <Text style={[styles.text, { color: variantStyles.text }]}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing[3],
    },
    text: {
        fontFamily: fonts.mono,
        fontSize: fontSize.xs,
        letterSpacing: letterSpacing.wide,
        textTransform: 'uppercase',
    },
});
