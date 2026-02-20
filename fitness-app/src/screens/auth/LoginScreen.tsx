/**
 * Login Screen - Fully Functional
 * 
 * Backend Integration:
 * - POST /auth/login with { email, password }
 * - Returns { accessToken, refreshToken, user }
 * - Stores tokens and navigates to main app
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
    navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();

    const { loginMutation } = useAuthQueries();

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // Validation
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle login
    const handleLogin = async () => {
        if (!validateForm()) return;

        setErrors({});

        loginMutation.mutate({
            email: email.toLowerCase().trim(),
            password,
        }, {
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || (error as Error).message || 'Login failed';

                if (errorMessage.toLowerCase().includes('email')) {
                    setErrors({ email: errorMessage });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setErrors({ password: errorMessage });
                } else {
                    Alert.alert('Login Failed', errorMessage);
                }
            }
        });
    };

    const loading = loginMutation.isPending;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header Section - Dark with gradient */}
                <View style={styles.headerSection}>
                    <View
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Gradient Glow */}
                    <View style={[styles.glowEffect, { backgroundColor: colors.primary.main }]} />

                    <SafeAreaView style={styles.headerContent}>
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Ionicons name="flash" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.brandName}>FitTrack</Text>
                    </SafeAreaView>
                </View>

                {/* Form Bottom Sheet */}
                <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
                    <ScrollView
                        contentContainerStyle={styles.bottomSheetContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Welcome Text */}
                        <View style={styles.welcomeContainer}>
                            <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
                                Welcome Back
                            </Text>
                            <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
                                Enter your details to access your workout plan.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <Input
                                label="Email Address"
                                placeholder="hello@example.com"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                leftIcon="mail-outline"
                                error={errors.email}
                                editable={!loading}
                            />

                            <Input
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                                error={errors.password}
                                editable={!loading}
                            />

                            {/* Forgot Password */}
                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                                disabled={loading}
                            >
                                <Text style={[styles.forgotPasswordText, { color: colors.primary.main }]}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.9}
                                style={[styles.loginButton, shadows.accent, loading && styles.buttonDisabled]}
                            >
                                <View
                                    style={styles.loginButtonGradient}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? 'Logging in...' : 'Log In'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Register')}
                                disabled={loading}
                            >
                                <Text style={[styles.footerLink, { color: colors.primary.main }]}>
                                    Sign up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    keyboardView: {
        flex: 1,
    },
    headerSection: {
        height: height * 0.35,
        minHeight: 260,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glowEffect: {
        position: 'absolute',
        top: '-50%',
        left: '-20%',
        width: '140%',
        height: '140%',
        borderRadius: 999,
        opacity: 0.25,
    },
    headerContent: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: spacing[6],
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: borderRadius['2xl'],
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    brandName: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    bottomSheet: {
        flex: 1,
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...shadows.xl,
    },
    bottomSheetContent: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[10],
        paddingBottom: spacing[6],
    },
    welcomeContainer: {
        marginBottom: spacing[8],
        alignItems: 'center',
    },
    welcomeTitle: {
        fontFamily: fonts.display,
        fontSize: fontSize['2xl'],
        marginBottom: spacing[2],
    },
    welcomeSubtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
    },
    form: {},
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing[6],
        marginTop: -spacing[2],
        paddingVertical: spacing[1],
    },
    forgotPasswordText: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.sm,
    },
    loginButton: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing[10],
        paddingBottom: spacing[4],
    },
    footerText: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
    },
    footerLink: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
    },
});
