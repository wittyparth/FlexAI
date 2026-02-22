/**
 * Badge Component — Production Grade
 *
 * Sizes: xs | sm | md
 * Features:
 *  - `icon` prop for Ionicons in badge
 *  - `outline` prop for border-only style
 *  - `pulse` prop for looping Reanimated scale pulse (live/active)
 *  - `dot` size variant — notification dot without text
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants';

interface BadgeProps {
    text?: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'info';
    size?: 'xs' | 'sm' | 'md';
    /** Ionicons icon shown left of text */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Border-only style (no fill, just colored border + text) */
    outline?: boolean;
    /** Looping pulse scale animation for live/active badges */
    pulse?: boolean;
    showDot?: boolean;
    style?: ViewStyle;
}

export function Badge({
    text,
    variant = 'primary',
    size = 'sm',
    icon,
    outline = false,
    pulse = false,
    showDot = !icon,
    style,
}: BadgeProps) {
    const colors = useColors();

    const getVariantStyles = () => {
        const opacity = outline ? '00' : '33';
        switch (variant) {
            case 'success':
                return { color: colors.success, bg: colors.success + opacity, border: colors.success };
            case 'warning':
                return { color: colors.warning, bg: colors.warning + opacity, border: colors.warning };
            case 'error':
                return { color: colors.error, bg: colors.error + opacity, border: colors.error };
            case 'info':
                return { color: colors.info, bg: colors.info + opacity, border: colors.info };
            case 'muted':
                return { color: colors.text.secondary, bg: colors.neutral[100], border: colors.border };
            case 'primary':
            default:
                return { color: colors.primary.main, bg: colors.primary.main + (outline ? '00' : '20'), border: colors.primary.main };
        }
    };

    const v = getVariantStyles();

    const sizeStyles: Record<string, { px: number; py: number; fontSize: number; dotSize: number; iconSize: number }> = {
        xs: { px: 4, py: 0, fontSize: 10, dotSize: 4, iconSize: 10 },
        sm: { px: spacing[3], py: 3, fontSize: 12, dotSize: 5, iconSize: 12 },
        md: { px: spacing[4], py: spacing[1], fontSize: 13, dotSize: 6, iconSize: 14 },
    };
    const sz = sizeStyles[size];

    // Pulse animation
    const pulseScale = useSharedValue(1);
    useEffect(() => {
        if (pulse) {
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                ),
                -1,
                false,
            );
        }
    }, [pulse]);
    const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

    // xs = pure notification dot (no text)
    if (size === 'xs' || !text) {
        return (
            <Animated.View
                style={[
                    {
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: v.color,
                        borderWidth: outline ? 1.5 : 0,
                        borderColor: v.border,
                    },
                    pulse && pulseStyle,
                    style,
                ]}
            />
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: v.bg,
                    paddingHorizontal: sz.px,
                    paddingVertical: sz.py,
                    borderWidth: outline ? 1.5 : 0,
                    borderColor: v.border,
                },
                pulse && pulseStyle,
                style,
            ]}
        >
            {icon ? (
                <Ionicons name={icon} size={sz.iconSize} color={v.color} style={styles.icon} />
            ) : (showDot && variant !== 'muted') && (
                <View style={[styles.dot, { backgroundColor: v.color, width: sz.dotSize, height: sz.dotSize, borderRadius: sz.dotSize / 2 }]} />
            )}
            <Text style={[styles.text, { color: v.color, fontSize: sz.fontSize }]}>
                {text}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
    },
    dot: {
        marginRight: 5,
    },
    icon: {
        marginRight: 3,
    },
    text: {
        fontWeight: '600' as const,
        letterSpacing: 0.1,
    },
});
        marginRight: spacing[2],
    },
    text: {
        ...typography.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
