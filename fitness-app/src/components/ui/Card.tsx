/**
 * Card Component (Theme-Aware)
 *
 * Premium Design System Cards
 * Variants: default, elevated, flat, glass, feature
 * Upgrade: optional onPress with Reanimated spring press-scale
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useColors } from '../../hooks';
import { borderRadius, spacing } from '../../constants';
import { SHADOWS_LIGHT, SHADOWS_DARK } from '../../constants/shadows';
import { useTheme } from '../../contexts';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'flat' | 'glass' | 'feature';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    style?: StyleProp<ViewStyle>;
    /** When provided, card becomes pressable with spring scale feedback */
    onPress?: () => void;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    style,
    onPress,
}: CardProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const shadows = isDark ? SHADOWS_DARK : SHADOWS_LIGHT;

    // Press-scale animation
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));
    const handlePressIn = () => {
        if (onPress) scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };
    const handlePressOut = () => {
        if (onPress) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

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

    const cardStyle = [
        styles.base,
        { borderRadius: borderRadius.xl },
        getVariantStyle(),
        { padding: paddingValue },
        style,
    ];

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[cardStyle, animatedStyle]}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <View style={cardStyle}>
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
