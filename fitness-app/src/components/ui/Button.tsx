/**
 * Button Component (Theme-Aware)
 * 
 * Premium Design System Buttons
 * Variants match style guide: primary, secondary, tertiary (ghost), destructive
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    ActivityIndicator,
    View,
    TextStyle
} from 'react-native';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing } from '../../constants';
// shadows import might be needed if not using colors.shadow
import { SHADOWS_LIGHT as SHADOWS } from '../../constants/shadows';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost'; // ghost alias for tertiary
    size?: 'default' | 'small' | 'large';
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

    // Map 'ghost' to 'tertiary' for backward compatibility
    const activeVariant = variant === 'ghost' ? 'tertiary' : variant;

    // Dynamic Styles based on variant
    const getVariantStyle = (): ViewStyle => {
        switch (activeVariant) {
            case 'primary':
                return {
                    backgroundColor: colors.primary[500],
                    ...SHADOWS.md, // Use token shadow directly
                };
            case 'secondary':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colors.primary[500],
                };
            case 'tertiary':
                return {
                    backgroundColor: 'transparent',
                };
            case 'destructive':
                return {
                    backgroundColor: colors.error,
                    ...SHADOWS.md, // Use token shadow directly
                };
            default:
                return {};
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (activeVariant) {
            case 'primary':
            case 'destructive':
                return { 
                    color: colors.text.inverse 
                };
            case 'secondary':
            case 'tertiary':
                return { 
                    color: colors.primary[500] 
                };
            default:
                return { color: colors.text.primary };
        }
    };

    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: spacing[2], // 8px
                    paddingHorizontal: spacing[4], // 16px
                    minHeight: 36,
                };
            case 'large':
                return {
                    paddingVertical: spacing[4], // 16px
                    paddingHorizontal: spacing[8], // 32px
                    minHeight: 56,
                };
            case 'default':
            default:
                return {
                    paddingVertical: spacing[3], // 12px
                    paddingHorizontal: spacing[6], // 24px
                    minHeight: 48,
                };
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[
                styles.base,
                getVariantStyle(),
                getSizeStyle(),
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator
                        color={activeVariant === 'secondary' || activeVariant === 'tertiary' ? colors.primary[500] : '#FFFFFF'}
                        size="small"
                    />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                        <Text style={[
                            styles.text,
                            size === 'small' && styles.textSmall,
                            getTextStyle(),
                            isDisabled && { color: colors.text.tertiary },
                        ]}>
                            {title}
                        </Text>
                        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.md, // Match Premium Guide (12px)
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#E2E8F0', // Slate 200 fallback
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
