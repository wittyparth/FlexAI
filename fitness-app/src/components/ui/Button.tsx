/**
 * Button Component (Theme-Aware)
 *
 * Production upgrades:
 *  - Reanimated spring press-scale (replaces activeOpacity flicker)
 *  - expo-linear-gradient fills primary & destructive variants
 *  - expo-haptics light impact on every press
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
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
    size?: 'default' | 'small' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    /** Skip haptic for silent actions */
    noHaptic?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'default',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'right',
    fullWidth = false,
    style,
    noHaptic = false,
}: ButtonProps) {
    const colors = useColors();
    const isDisabled = disabled || loading;

    // Map 'ghost' to 'tertiary' for backward compatibility
    const activeVariant = variant === 'ghost' ? 'tertiary' : variant;

    // ---- Reanimated press-scale ----
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };
    const handlePress = () => {
        if (!noHaptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    };

    // ---- Size ----
    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case 'small':
                return { paddingVertical: spacing[2], paddingHorizontal: spacing[4], minHeight: 36 };
            case 'large':
                return { paddingVertical: spacing[4], paddingHorizontal: spacing[8], minHeight: 56 };
            default:
                return { paddingVertical: spacing[3], paddingHorizontal: spacing[6], minHeight: 48 };
        }
    };

    // ---- Text color ----
    const getTextColor = (): string => {
        switch (activeVariant) {
            case 'primary':
            case 'destructive':
                return (colors as any).text?.inverse ?? '#FFFFFF';
            case 'secondary':
            case 'tertiary':
                return colors.primary.main;
            default:
                return (colors as any).text?.primary ?? '#0F172A';
        }
    };

    const sizeStyle = getSizeStyle();
    const textColor = getTextColor();

    // ---- Content ----
    const content = (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator
                    color={activeVariant === 'secondary' || activeVariant === 'tertiary' ? colors.primary.main : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text
                        style={[
                            styles.text,
                            size === 'small' && styles.textSmall,
                            { color: textColor },
                            isDisabled && { color: (colors as any).text?.tertiary ?? '#94A3B8' },
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </>
            )}
        </View>
    );

    // ---- Gradient primary / destructive ----
    if ((activeVariant === 'primary' || activeVariant === 'destructive') && !isDisabled) {
        const gradientColors: [string, string] =
            activeVariant === 'primary'
                ? [colors.primary.main, colors.primary.light ?? '#4D7CFF']
                : ['#EF4444', '#F87171'];

        return (
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                style={[
                    animatedStyle,
                    styles.base,
                    sizeStyle,
                    fullWidth && styles.fullWidth,
                    (SHADOWS.md as ViewStyle),
                    style,
                ]}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
                {content}
            </AnimatedPressable>
        );
    }

    // ---- Secondary / Tertiary ----
    const flatStyle: ViewStyle =
        activeVariant === 'secondary'
            ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary.main }
            : { backgroundColor: 'transparent' };

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            style={[
                animatedStyle,
                styles.base,
                flatStyle,
                sizeStyle,
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
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
        overflow: 'hidden', // clips LinearGradient to border radius
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#E2E8F0',
        borderWidth: 0,
        elevation: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...typography.button,
        textAlign: 'center',
    },
    textSmall: {
        fontSize: 14,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
