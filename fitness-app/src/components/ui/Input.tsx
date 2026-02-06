/**
 * Input Component (Theme-Aware)
 * 
 * Premium Design System Inputs
 * Style: Clean, accessible, focus states matching Premium Guide
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { typography, borderRadius, spacing, sizing } from '../../constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    secureTextEntry,
    ...textInputProps
}: InputProps) {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry !== undefined;
    const actualSecureTextEntry = isPassword && !showPassword;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                    {label}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                { 
                    backgroundColor: colors.inputBackground,
                    borderColor: error 
                        ? colors.error 
                        : isFocused 
                            ? colors.ring 
                            : colors.border,
                },
                isFocused && styles.inputFocused,
            ]}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={isFocused ? colors.primary[500] : colors.text.tertiary}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    {...textInputProps}
                    secureTextEntry={actualSecureTextEntry}
                    style={[
                        styles.input,
                        { color: colors.text.primary },
                        leftIcon && styles.inputWithLeftIcon,
                        (rightIcon || isPassword) && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.text.tertiary}
                    onFocus={(e) => {
                        setIsFocused(true);
                        textInputProps.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        textInputProps.onBlur?.(e);
                    }}
                />

                {isPassword ? (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.rightIconButton}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={colors.text.tertiary}
                        />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIconButton}
                        disabled={!onRightIconPress}
                    >
                        <Ionicons
                            name={rightIcon}
                            size={22}
                            color={colors.text.tertiary}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Error or Helper Text */}
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
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[4],
    },
    label: {
        ...typography.label,
        marginBottom: spacing[1], // 4px
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: sizing.inputHeight || 48,
        borderRadius: borderRadius.md, // 12px
        borderWidth: 1,
        overflow: 'hidden',
    },
    inputFocused: {
        borderWidth: 1.5,
        // Shadow handled by color prop logic usually, or here if needed
    },
    input: {
        flex: 1,
        height: '100%',
        ...typography.bodyLarge,
        paddingHorizontal: spacing[4],
    },
    inputWithLeftIcon: {
        paddingLeft: 0,
    },
    inputWithRightIcon: {
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
    },
    helperText: {
        ...typography.caption,
        marginTop: spacing[1],
    },
    errorText: {
        ...typography.caption,
        marginTop: spacing[1],
    },
});
