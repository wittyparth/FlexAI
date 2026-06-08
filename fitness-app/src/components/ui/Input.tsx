/**
 * Input Component — Production Grade
 *
 * Variants: default | filled | underline
 * Sizes: sm | md | lg
 * Features:
 *  - Animated floating label (shrinks + floats on focus/value)
 *  - Animated border color on focus (Animated.Value)
 *  - Shake animation on error (Reanimated)
 *  - Character count display when maxLength is set
 *  - leftElement / rightElement for custom adornments
 *  - Password show/hide toggle
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    Text,
    Animated,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing, sizing } from '../../constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helperText?: string;
    /** Input visual variant */
    variant?: 'default' | 'filled' | 'underline';
    /** Input height size */
    size?: 'sm' | 'md' | 'lg';
    /** Ionicons icon name for left side */
    leftIcon?: keyof typeof Ionicons.glyphMap;
    /** Ionicons icon name for right side */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Custom element for left side (overrides leftIcon) */
    leftElement?: React.ReactNode;
    /** Custom element for right side (overrides rightIcon) */
    rightElement?: React.ReactNode;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    /** Show character count when maxLength is set */
    characterCount?: boolean;
}

export function Input({
    label,
    error,
    helperText,
    variant = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    leftElement,
    rightElement,
    onRightIconPress,
    containerStyle,
    secureTextEntry,
    characterCount = false,
    maxLength,
    value,
    ...textInputProps
}: InputProps) {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentLength, setCurrentLength] = useState(
        typeof value === 'string' ? value.length : 0
    );

    const isPassword = secureTextEntry !== undefined;
    const actualSecureTextEntry = isPassword && !showPassword;
    const hasValue = typeof value === 'string' ? value.length > 0 : false;
    const isFloating = isFocused || hasValue;

    // ── Floating label animation ──
    const labelAnim = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
    useEffect(() => {
        Animated.timing(labelAnim, {
            toValue: isFloating ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [isFloating]);

    // ── Border color animation ──
    const borderAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error ? colors.error : colors.border,
            error ? colors.error : colors.primary.main,
        ],
    });

    // ── Shake on error ──
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const prevError = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (error && error !== prevError.current) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
            ]).start();
        }
        prevError.current = error;
    }, [error]);

    // ── Size ──
    const inputHeight = { sm: 40, md: 52, lg: 60 }[size];
    const floatLabelTop = label ? { sm: -10, md: -11, lg: -12 }[size] : 0;

    // ── Variant container style ──
    const getContainerStyle = (): ViewStyle => {
        if (variant === 'filled') {
            return {
                backgroundColor: isFocused ? colors.inputBackgroundFocused : colors.inputBackground,
                borderWidth: 0,
                borderBottomWidth: 1.5,
                borderRadius: borderRadius.sm,
            };
        }
        if (variant === 'underline') {
            return {
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderBottomWidth: 1.5,
                borderRadius: 0,
            };
        }
        // default
        return {
            backgroundColor: isFocused ? colors.inputBackgroundFocused : colors.inputBackground,
            borderRadius: borderRadius.md,
        };
    };

    const leftAdornment = leftElement ?? (leftIcon ? (
        <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary.main : colors.text.tertiary}
            style={styles.leftIcon}
        />
    ) : null);

    const rightAdornment = rightElement ?? (rightIcon ? (
        <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
        >
            <Ionicons name={rightIcon} size={22} color={colors.text.tertiary} />
        </TouchableOpacity>
    ) : null);

    const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, floatLabelTop] });
    const labelFontSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
    const labelColor = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.text.tertiary, isFocused ? colors.primary.main : colors.text.secondary],
    });

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                {/* Static label (when no floating) */}
                {label && !isFloating && (
                    <Text style={[styles.staticLabel, { color: colors.text.secondary }]}>
                        {label}
                    </Text>
                )}

                {/* Floating label */}
                {label && isFloating && (
                    <Animated.Text
                        style={[
                            styles.floatingLabel,
                            {
                                top: labelTop,
                                fontSize: labelFontSize,
                                color: labelColor,
                                backgroundColor: variant === 'underline' ? 'transparent' :
                                    isFocused ? colors.inputBackgroundFocused : colors.inputBackground,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {label}
                    </Animated.Text>
                )}

                <Animated.View
                    style={[
                        styles.inputContainer,
                        { height: inputHeight, borderColor },
                        getContainerStyle(),
                        isFocused && variant === 'default' && styles.inputFocused,
                    ]}
                >
                    {leftAdornment}

                    <TextInput
                        {...textInputProps}
                        value={value}
                        maxLength={maxLength}
                        secureTextEntry={actualSecureTextEntry}
                        style={[
                            styles.input,
                            { color: colors.text.primary },
                            !!leftAdornment && styles.inputWithLeftAdornment,
                            !!(rightAdornment || isPassword) && styles.inputWithRightAdornment,
                            label && !isFloating && { paddingTop: 4 },
                        ]}
                        placeholderTextColor={label ? 'transparent' : colors.text.tertiary}
                        onFocus={(e) => {
                            setIsFocused(true);
                            textInputProps.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            textInputProps.onBlur?.(e);
                        }}
                        onChangeText={(text) => {
                            setCurrentLength(text.length);
                            textInputProps.onChangeText?.(text);
                        }}
                    />

                    {isPassword ? (
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.rightIconButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={isFocused ? colors.primary.main : colors.text.tertiary}
                            />
                        </TouchableOpacity>
                    ) : rightAdornment}
                </Animated.View>
            </Animated.View>

            {/* Footer row: error/helper + character count */}
            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    {error ? (
                        <Text style={[styles.errorText, { color: colors.error }]}>
                            {error}
                        </Text>
                    ) : helperText ? (
                        <Text style={[styles.helperText, { color: colors.text.tertiary }]}>
                            {helperText}
                        </Text>
                    ) : null}
                </View>
                {characterCount && maxLength && (
                    <Text style={[styles.charCount, { color: currentLength >= maxLength ? colors.error : colors.text.tertiary }]}>
                        {currentLength} / {maxLength}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[4],
    },
    staticLabel: {
        ...typography.label,
        marginBottom: spacing[1],
    },
    floatingLabel: {
        position: 'absolute',
        left: spacing[4],
        zIndex: 10,
        paddingHorizontal: 4,
        fontWeight: '500' as const,
        lineHeight: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
    },
    inputFocused: {
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        height: '100%',
        ...typography.bodyLarge,
        paddingHorizontal: spacing[4],
    },
    inputWithLeftAdornment: {
        paddingLeft: 0,
    },
    inputWithRightAdornment: {
        paddingRight: 0,
    },
    leftIcon: {
        marginLeft: spacing[4],
        marginRight: spacing[2],
    },
    rightIconButton: {
        paddingHorizontal: spacing[4],
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing[1],
    },
    footerLeft: {
        flex: 1,
    },
    helperText: {
        ...typography.caption,
    },
    errorText: {
        ...typography.caption,
    },
    charCount: {
        ...typography.caption,
        marginLeft: spacing[2],
    },
});
