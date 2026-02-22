/**
 * Card Component — Production Grade
 *
 * Variants: default | elevated | flat | glass | feature
 * Features:
 *  - `gradient?: [string, string]` — LinearGradient background
 *  - `accentLeft?: string` — 4px colored left-border stripe
 *  - `bordered?: boolean` — subtle 1px outline
 *  - `glass` variant uses expo-blur BlurView for real frosted glass
 *  - Reanimated spring press-scale (damping: 20, stiffness: 350)
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
    /** LinearGradient colors — overrides variant background */
    gradient?: [string, string];
    /** Colored left-side accent stripe (width: 4) */
    accentLeft?: string;
    /** Add a subtle 1px border outline */
    bordered?: boolean;
    /** When provided, card becomes pressable with spring scale feedback */
    onPress?: () => void;
}

export function Card({
    children,
    variant = 'default',
    padding = 'md',
    style,
    gradient,
    accentLeft,
    bordered = false,
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
        if (onPress) scale.value = withSpring(0.97, { damping: 20, stiffness: 350 });
    };
    const handlePressOut = () => {
        if (onPress) scale.value = withSpring(1, { damping: 20, stiffness: 350 });
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
                    borderColor: (colors as any).cardBorder ?? colors.border,
                    elevation: 0,
                    shadowOpacity: 0,
                };
            case 'glass':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                    ...shadows.md,
                    overflow: 'hidden',
                };
            case 'feature':
                return {
                    backgroundColor: colors.primary.light + '18',
                    borderColor: colors.primary.main + '30',
                    borderWidth: 1,
                    ...shadows.colored,
                };
            case 'default':
            default:
                return {
                    backgroundColor: colors.card,
                    ...shadows.md,
                    borderWidth: bordered ? 0 : 0, // handled below
                };
        }
    };

    const variantStyle = getVariantStyle();

    // Bordered override
    if (bordered && variant !== 'flat' && variant !== 'glass') {
        variantStyle.borderWidth = 1;
        variantStyle.borderColor = (colors as any).cardBorder ?? colors.border;
    }

    const cardStyle: StyleProp<ViewStyle> = [
        styles.base,
        { borderRadius: borderRadius['2xl'] },
        variantStyle,
        { padding: paddingValue },
        style,
    ];

    // ── Glass variant uses BlurView ──
    const renderGlassContent = () => (
        <BlurView
            intensity={isDark ? 20 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
        />
    );

    const renderInner = () => (
        <>
            {variant === 'glass' && renderGlassContent()}
            {gradient && (
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {accentLeft && (
                <View
                    style={[
                        styles.accentStripe,
                        { backgroundColor: accentLeft, borderTopLeftRadius: borderRadius['2xl'], borderBottomLeftRadius: borderRadius['2xl'] },
                    ]}
                />
            )}
            <View style={accentLeft ? styles.accentContent : undefined}>
                {children}
            </View>
        </>
    );

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[cardStyle, animatedStyle]}
            >
                {renderInner()}
            </AnimatedPressable>
        );
    }

    return (
        <View style={cardStyle}>
            {renderInner()}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        width: '100%',
        overflow: 'hidden',
    },
    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    accentContent: {
        marginLeft: 12,
    },
});
