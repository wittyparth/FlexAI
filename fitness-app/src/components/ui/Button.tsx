/**
 * Button Component — Production Grade
 *
 * Variants: primary | secondary | tertiary | destructive | ghost | outlined
 * Sizes: small | default | large
 * Features:
 *  - Reanimated spring press-scale (damping: 20, stiffness: 350)
 *  - LinearGradient fill: blue → violet (primary), red gradient (destructive)
 *  - Primary-tinted glow shadow on CTAs
 *  - Pill shape via `rounded` prop
 *  - Two-line layout via `subtitle` prop for action buttons
 *  - Haptic feedback on every press
 *  - Clean disabled state (opacity + muted background)
 */

import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ViewStyle,
    ActivityIndicator,
    View,
    TextStyle,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants';
import { SHADOWS_LIGHT as SHADOWS } from '../../constants/shadows';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
    title?: string;
    /** @deprecated use title */
    label?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'outlined';
    size?: 'default' | 'small' | 'large' | 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    /** Element rendered left of the title */
    leftElement?: React.ReactNode;
    /** Element rendered right of the title */
    rightElement?: React.ReactNode;
    /** @deprecated use leftElement / rightElement */
    icon?: React.ReactNode;
    /** @deprecated use leftElement / rightElement */
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    /** Pill (borderRadius.full) shape */
    rounded?: boolean;
    /** Optional second line below title — useful for "Start Workout / 6 exercises" */
    subtitle?: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    /** Skip haptic for silent actions */
    noHaptic?: boolean;
}

export function Button({
    title,
    label,
    onPress,
    variant = 'primary',
    size = 'default',
    disabled = false,
    loading = false,
    leftElement,
    rightElement,
    icon,
    iconPosition = 'right',
    fullWidth = false,
    rounded = false,
    subtitle,
    style,
    textStyle,
    noHaptic = false,
}: ButtonProps) {
    const colors = useColors();
    const isDisabled = disabled || loading;
    const resolvedTitle = title ?? label ?? '';

    // Map aliases to core variants
    const activeVariant = (variant === 'ghost' || variant === 'outlined') ? 'tertiary' : variant;

    // Resolve icon backward compat
    const resolvedLeft  = leftElement  ?? (icon && iconPosition === 'left'  ? icon : undefined);
    const resolvedRight = rightElement ?? (icon && iconPosition !== 'left' ? icon : undefined);

    // ── Reanimated spring press-scale ──────────────────────
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 20, stiffness: 350 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1.0, { damping: 20, stiffness: 350 });
    };
    const handlePress = () => {
        if (!noHaptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    };

    // ── Size ───────────────────────────────────────────────
    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case 'small':
            case 'sm':
                return { paddingVertical: spacing[2], paddingHorizontal: spacing[4], minHeight: 36 };
            case 'large':
            case 'lg':
                return { paddingVertical: subtitle ? spacing[3] : spacing[4], paddingHorizontal: spacing[8], minHeight: subtitle ? 64 : 56 };
            case 'md':
            default:
                return { paddingVertical: subtitle ? spacing[2] : spacing[3], paddingHorizontal: spacing[6], minHeight: subtitle ? 56 : 48 };
        }
    };

    // ── Text color ─────────────────────────────────────────
    const getTextColor = (): string => {
        if (isDisabled) return colors.text.tertiary;
        switch (activeVariant) {
            case 'primary':
            case 'destructive':
                return '#FFFFFF';
            case 'secondary':
            case 'tertiary':
                return colors.primary.main;
            default:
                return colors.text.primary;
        }
    };

    const sizeStyle = getSizeStyle();
    const textColor = getTextColor();
    const radius = rounded ? borderRadius.full : borderRadius.md;

    // ── Content ────────────────────────────────────────────
    const content = (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator
                    color={activeVariant === 'secondary' || activeVariant === 'tertiary'
                        ? colors.primary.main : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <>
                    {resolvedLeft && <View style={styles.iconLeft}>{resolvedLeft}</View>}
                    <View style={subtitle ? styles.textColumn : undefined}>
                        <Text
                            style={[
                                styles.text,
                                size === 'small' && styles.textSmall,
                                size === 'large' && styles.textLarge,
                                { color: textColor },
                                textStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {resolvedTitle}
                        </Text>
                        {subtitle && (
                            <Text style={[styles.subtitleText, { color: textColor + 'B3' }]} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                    {resolvedRight && <View style={styles.iconRight}>{resolvedRight}</View>}
                </>
            )}
        </View>
    );

    // ── Gradient primary / destructive ─────────────────────
    if ((activeVariant === 'primary' || activeVariant === 'destructive') && !isDisabled) {
        const gradientColors: [string, string] =
            activeVariant === 'primary'
                ? ['#2563EB', '#7C3AED']   // blue → violet — premium brand gradient
                : ['#EF4444', '#DC2626'];   // warm red gradient

        const glowShadow: ViewStyle = activeVariant === 'primary'
            ? (SHADOWS.coloredLg as ViewStyle)
            : { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.30, shadowRadius: 20, elevation: 10 };

        return (
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                style={[
                    animatedStyle,
                    styles.base,
                    { borderRadius: radius },
                    sizeStyle,
                    fullWidth && styles.fullWidth,
                    glowShadow,
                    style,
                ]}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
                {content}
            </AnimatedPressable>
        );
    }

    // ── Secondary / Tertiary / Disabled ───────────────────
    const flatStyle: ViewStyle = (() => {
        if (isDisabled) return { backgroundColor: colors.neutral[100], opacity: 0.55 };
        if (activeVariant === 'secondary') {
            return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary.main };
        }
        // tertiary / ghost
        return { backgroundColor: (colors as any).surfaceHover ?? colors.neutral[100] };
    })();

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            style={[
                animatedStyle,
                styles.base,
                { borderRadius: radius },
                flatStyle,
                sizeStyle,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {content}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textColumn: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    text: {
        ...typography.button,
        textAlign: 'center',
        letterSpacing: 0.1,
    },
    textSmall: {
        fontSize: 14,
        fontWeight: '500' as const,
    },
    textLarge: {
        fontSize: 18,
        fontWeight: '700' as const,
    },
    subtitleText: {
        fontSize: 12,
        fontWeight: '400' as const,
        marginTop: 1,
        textAlign: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
