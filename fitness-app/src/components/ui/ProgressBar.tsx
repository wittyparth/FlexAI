/**
 * ProgressBar Component — Production Grade
 *
 * Migrated from legacy Animated to react-native-reanimated.
 * Features:
 *  - `gradient?: [string, string]` — LinearGradient fill
 *  - `label?: string` — shows text above the bar
 *  - `showPercent?: boolean` — shows percentage above bar
 *  - Smooth spring/timing fill animation
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { borderRadius, spacing, typography } from '../../constants';

interface ProgressBarProps {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    /** Two-stop gradient fill — overrides `color` */
    gradient?: [string, string];
    trackColor?: string;
    /** Label shown above the bar on the left */
    label?: string;
    /** Show percentage on the right above the bar */
    showPercent?: boolean;
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    color,
    gradient,
    trackColor,
    label,
    showPercent = false,
    style,
}) => {
    const colors = useColors();
    const activeColor = color || colors.primary.main;
    const track = trackColor || (colors.neutral?.[200] || colors.muted);

    const width = useSharedValue(0);
    const pct = Math.max(0, Math.min(1, progress));

    useEffect(() => {
        width.value = withTiming(pct, {
            duration: 500,
            easing: Easing.out(Easing.quad),
        });
    }, [pct]);

    const fillStyle = useAnimatedStyle(() => ({
        width: `${width.value * 100}%` as any,
    }));

    const showHeader = label || showPercent;

    return (
        <View style={[styles.wrapper, style]}>
            {showHeader && (
                <View style={styles.header}>
                    {label && (
                        <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
                    )}
                    {showPercent && (
                        <Text style={[styles.percent, { color: colors.text.secondary }]}>
                            {Math.round(pct * 100)}%
                        </Text>
                    )}
                </View>
            )}
            <View style={[styles.track, { height, backgroundColor: track }]}>
                <Animated.View style={[styles.fill, fillStyle]}>
                    {gradient ? (
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: activeColor }]} />
                    )}
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[1],
    },
    label: {
        ...typography.caption,
        fontWeight: '500' as const,
    },
    percent: {
        ...typography.caption,
        fontWeight: '600' as const,
    },
    track: {
        width: '100%',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
});
