/**
 * IconButton Component
 *
 * Icon-only pressable button with multiple visual variants.
 * Shares the same spring-press animation as Button for consistency.
 */

import React from 'react';
import {
    StyleSheet,
    ViewStyle,
    StyleProp,
    Platform,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '../../hooks';
import { shadows } from '../../theme';

type IoniconName = keyof typeof Ionicons.glyphMap;
type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type IconButtonVariant = 'ghost' | 'filled' | 'outline' | 'tinted';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconButtonProps {
    /** Ionicons icon name */
    icon?: IoniconName;
    /** MaterialCommunityIcons icon name */
    materialIcon?: MaterialIconName;
    /** Visual variant */
    variant?: IconButtonVariant;
    /** Size preset */
    size?: IconButtonSize;
    /** Custom icon color (overrides variant default) */
    color?: string;
    /** Custom background color (overrides variant default) */
    backgroundColor?: string;
    /** Circular shape (true = round, false = rounded square) */
    rounded?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Triggers haptic feedback on press */
    haptic?: boolean;
    /** Press handler */
    onPress?: () => void;
    /** Custom container style */
    style?: StyleProp<ViewStyle>;
    /** Accessibility label for screen readers */
    accessibilityLabel?: string;
}

const SIZE_MAP: Record<IconButtonSize, { container: number; icon: number; radius: number }> = {
    xs: { container: 28, icon: 14, radius: 8 },
    sm: { container: 36, icon: 18, radius: 10 },
    md: { container: 44, icon: 22, radius: 12 },
    lg: { container: 52, icon: 26, radius: 14 },
    xl: { container: 60, icon: 30, radius: 16 },
};



export function IconButton({
    icon,
    materialIcon,
    variant = 'ghost',
    size = 'md',
    color,
    backgroundColor,
    rounded = false,
    disabled = false,
    haptic = true,
    onPress,
    style,
    accessibilityLabel,
}: IconButtonProps) {
    const colors = useColors();
    const sz = SIZE_MAP[size];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.88, { damping: 20, stiffness: 400 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 350 });
    };
    const handlePress = () => {
        if (disabled) return;
        if (haptic && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
    };

    // Resolve colors per variant
    const variantStyles = {
        ghost: {
            bg: 'transparent',
            iconColor: colors.mutedForeground,
            border: undefined,
            shadow: undefined,
        },
        filled: {
            bg: colors.primary.main,
            iconColor: '#FFFFFF',
            border: undefined,
            shadow: shadows.colored ?? shadows.md,
        },
        outline: {
            bg: 'transparent',
            iconColor: colors.primary.main,
            border: colors.primary.main,
            shadow: undefined,
        },
        tinted: {
            bg: colors.primary.main + '18',
            iconColor: colors.primary.main,
            border: undefined,
            shadow: undefined,
        },
    };

    const v = variantStyles[variant];
    const finalBg = backgroundColor ?? v.bg;
    const finalColor = color ?? v.iconColor;
    const finalRadius = rounded ? sz.container / 2 : sz.radius;

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
        >
            <Animated.View
                style={[
                    animatedStyle,
                    styles.base,
                    {
                        width: sz.container,
                        height: sz.container,
                        borderRadius: finalRadius,
                        backgroundColor: finalBg,
                        borderWidth: v.border ? 1.5 : 0,
                        borderColor: v.border ?? 'transparent',
                        opacity: disabled ? 0.45 : 1,
                    },
                    style,
                ]}
            >
                {icon ? (
                    <Ionicons name={icon} size={sz.icon} color={finalColor} />
                ) : materialIcon ? (
                    <MaterialCommunityIcons name={materialIcon} size={sz.icon} color={finalColor} />
                ) : null}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
