/**
 * Input Component (Theme-Aware)
 * 
 * Form input with icon support and proper styling
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
import { fonts, fontSize, borderRadius, spacing, sizing } from '../../constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
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
                <Text style={[styles.label, { color: colors.text }]}>
                    {label}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                { backgroundColor: colors.inputBackground },
                isFocused && {
                    backgroundColor: colors.inputBackgroundFocused,
                    borderColor: colors.primary + '30',
                },
                error && { borderColor: colors.error + '50' },
            ]}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={isFocused ? colors.primary : colors.textTertiary}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    {...textInputProps}
                    secureTextEntry={actualSecureTextEntry}
                    style={[
                        styles.input,
                        { color: colors.text },
                        leftIcon && styles.inputWithLeftIcon,
                        (rightIcon || isPassword) && styles.inputWithRightIcon,
                    ]}
                    placeholderTextColor={colors.textTertiary}
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
                            color={colors.textTertiary}
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
                            color={colors.textTertiary}
                        />
                    </TouchableOpacity>
                ) : null}
            </View>

            {error && (
                <Text style={[styles.error, { color: colors.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[4],
    },
    label: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.sm,
        marginBottom: spacing[2],
        marginLeft: spacing[1],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: sizing.inputHeight,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: fonts.body,
        fontSize: fontSize.base,
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
    error: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
        marginTop: spacing[2],
        marginLeft: spacing[1],
    },
});
