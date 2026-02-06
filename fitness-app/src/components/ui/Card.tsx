/**
 * Card Component (Theme-Aware)
 * 
 * Elevated surface with optional gradient border for featured items
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { borderRadius, shadows, spacing } from '../../constants';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'featured';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: StyleProp<ViewStyle>;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    style,
}: CardProps) {
    const colors = useColors();

    const paddingValue = {
        none: 0,
        sm: spacing[3],
        md: spacing[5],
        lg: spacing[6],
    }[padding];

    // Featured card with gradient border
    if (variant === 'featured') {
        return (
            <LinearGradient
                colors={(colors.primary.gradient || [colors.primary.main, colors.primary.light]) as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientBorder, shadows.accent]}
            >
                <View style={[
                    styles.featuredInner,
                    { padding: paddingValue, backgroundColor: colors.card }
                ]}>
                    {children}
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={[
            styles.base,
            {
                backgroundColor: colors.card,
                borderColor: colors.border,
                padding: paddingValue,
            },
            variant === 'elevated' && shadows.lg,
            style,
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        ...shadows.md,
    },
    gradientBorder: {
        borderRadius: borderRadius.xl,
        padding: 2,
    },
    featuredInner: {
        borderRadius: borderRadius.xl - 2,
    },
});
