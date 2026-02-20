/**
 * Forgot Password Screen
 * 
 * Backend Integration:
 * - POST /auth/forgot-password with { email }
 * - Sends OTP to user's email
 * 
 * Only uses data backend accepts
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

interface ForgotPasswordScreenProps {
    navigation: any;
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { forgotPasswordMutation } = useAuthQueries();

    // Validation
    const validateEmail = (): boolean => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email');
            return false;
        }
        return true;
    };

    // Handle forgot password request
    const handleSubmit = async () => {
        if (!validateEmail()) return;

        setError('');

        forgotPasswordMutation.mutate(email.toLowerCase().trim(), {
            onSuccess: () => {
                // Navigate to reset password screen with email
                navigation.navigate('ResetVerify', { email: email.toLowerCase().trim() });
            },
            onError: (error: any) => {
                console.error('Forgot password error:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset code';

                if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('no user')) {
                    setError('No account found with this email');
                } else {
                    setError(errorMessage);
                }
            }
        });
    };

    const loading = forgotPasswordMutation.isPending;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.muted }]}
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary.main + '15' }]}>
                        <Ionicons name="key-outline" size={48} color={colors.primary.main} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        Forgot Password?
                    </Text>

                    {/* Subtitle */}
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        No worries! Enter your email and we'll send you a reset code.
                    </Text>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Input
                            label="Email Address"
                            placeholder="hello@example.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            leftIcon="mail-outline"
                            error={error}
                            editable={!loading}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.9}
                        style={[styles.submitButton, shadows.accent, loading && styles.buttonDisabled]}
                    >
                        <View
                            style={styles.submitButtonGradient}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <TouchableOpacity
                        style={styles.backToLogin}
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                    >
                        <Ionicons name="arrow-back" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.backToLoginText, { color: colors.mutedForeground }]}>
                            Back to Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing[6],
        paddingTop: Platform.OS === 'android' ? 50 : 60,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing[6],
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    title: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        textAlign: 'center',
        marginBottom: spacing[3],
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing[8],
        maxWidth: 300,
    },
    inputContainer: {
        width: '100%',
    },
    submitButton: {
        width: '100%',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginTop: spacing[2],
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    submitButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
        color: '#FFFFFF',
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing[6],
        gap: spacing[2],
    },
    backToLoginText: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.base,
    },
});
