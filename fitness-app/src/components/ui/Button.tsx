/**
 * Button Component (Theme-Aware)
 * 
 * Variants:
 * - primary: Gradient background with accent shadow
 * - secondary: Outline style with border
 * - ghost: No background, minimal style
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fonts, fontSize, borderRadius, shadows, sizing } from '../../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'default' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
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
}: ButtonProps) {
    const colors = useColors();
    const isDisabled = disabled || loading;

    const content = (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? '#FFFFFF' : colors.primary.main}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        size === 'large' && styles.textLarge,
                        variant === 'secondary' && { color: colors.foreground },
                        variant === 'ghost' && { color: colors.mutedForeground },
                        isDisabled && { color: colors.slate[400] },
                    ]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </>
            )}
        </View>
    );

    const baseStyle: ViewStyle[] = [
        styles.base,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.9}
                style={[...baseStyle, shadows.accent]}
            >
                <LinearGradient
                    colors={(isDisabled ? ['#94A3B8', '#94A3B8'] : (colors.primary.gradient || [colors.primary.main || '#0052FF', colors.primary.light || '#4D7CFF'])) as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[
                    ...baseStyle,
                    styles.secondary,
                    { borderColor: colors.border },
                ]}
            >
                {content}
            </TouchableOpacity>
        );
    }

    // Ghost variant
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[...baseStyle, styles.ghost]}
        >
            {content}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.6,
    },
    gradient: {
        height: sizing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    secondary: {
        height: sizing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    ghost: {
        height: sizing.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.base,
        color: '#FFFFFF',
    },
    textLarge: {
        fontSize: fontSize.lg,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
