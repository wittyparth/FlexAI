/**
 * Register Screen - Fully Functional
 * 
 * Backend Integration:
 * - POST /auth/register with { email, password, firstName, lastName }
 * - Returns: { data: { message, userId } }
 * - Navigates to email verification
 * 
 * Only uses data that backend accepts - no placeholder images
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const { height } = Dimensions.get('window');

interface RegisterScreenProps {
    navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();

    // Form fields - matching backend exactly
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string
    }>({});

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { level: 0, label: '', color: colors.slate[400] };

        let score = 0;
        if (pass.length >= 8) score++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^a-zA-Z0-9]/.test(pass)) score++;

        if (score <= 1) return { level: 1, label: 'Weak', color: colors.error };
        if (score === 2) return { level: 2, label: 'Fair', color: colors.warning };
        if (score === 3) return { level: 3, label: 'Good', color: colors.primary.main };
        return { level: 4, label: 'Strong', color: colors.success };
    };

    const passwordStrength = getPasswordStrength(password);

    // Validation - matches backend requirements
    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (passwordStrength.level < 2) {
            newErrors.password = 'Password is too weak';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { registerMutation } = useAuthQueries();

    // Handle registration
    const handleRegister = async () => {
        if (!validateForm()) return;

        setErrors({});

        registerMutation.mutate({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password,
        }, {
            onSuccess: () => {
                // Navigate to verify email on success
                navigation.navigate('VerifyEmail', { email: email.toLowerCase().trim() });
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || (error as Error).message || 'Registration failed';

                if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
                    setErrors({ email: 'This email is already registered' });
                } else if (errorMessage.toLowerCase().includes('email')) {
                    setErrors({ email: errorMessage });
                } else if (errorMessage.toLowerCase().includes('password')) {
                    setErrors({ password: errorMessage });
                } else {
                    Alert.alert('Registration Failed', errorMessage);
                }
            }
        });
    };

    const loading = registerMutation.isPending;

    // Clear error on field change
    const clearError = (field: keyof typeof errors) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <SafeAreaViewCompat>
                        <TouchableOpacity
                            style={[styles.backButton, { backgroundColor: colors.muted }]}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                        </TouchableOpacity>
                    </SafeAreaViewCompat>

                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        {/* Registration Badge */}
                        <View style={[styles.badge, { backgroundColor: colors.primary.main + '15' }]}>
                            <View style={[styles.badgeDot, { backgroundColor: colors.primary.main }]} />
                            <Text style={[styles.badgeText, { color: colors.primary.main }]}>
                                REGISTRATION
                            </Text>
                        </View>

                        {/* Headlines */}
                        <Text style={[styles.headline, { color: colors.foreground }]}>
                            Create Account
                        </Text>
                        <Text style={[styles.subheadline, { color: colors.mutedForeground }]}>
                            Start your fitness journey today
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* First Name - Backend field: firstName */}
                        <Input
                            label="First Name"
                            placeholder="John"
                            value={firstName}
                            onChangeText={(text) => {
                                setFirstName(text);
                                clearError('firstName');
                            }}
                            autoCapitalize="words"
                            leftIcon="person-outline"
                            error={errors.firstName}
                            editable={!loading}
                        />

                        {/* Last Name - Backend field: lastName */}
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            value={lastName}
                            onChangeText={(text) => {
                                setLastName(text);
                                clearError('lastName');
                            }}
                            autoCapitalize="words"
                            leftIcon="person-outline"
                            error={errors.lastName}
                            editable={!loading}
                        />

                        {/* Email - Backend field: email */}
                        <Input
                            label="Email Address"
                            placeholder="hello@example.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                clearError('email');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            leftIcon="mail-outline"
                            error={errors.email}
                            editable={!loading}
                        />

                        {/* Password - Backend field: password */}
                        <Input
                            label="Password"
                            placeholder="Create a strong password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                clearError('password');
                            }}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                            editable={!loading}
                        />

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthHeader}>
                                    <Text style={[styles.strengthLabel, { color: colors.mutedForeground }]}>
                                        Password strength
                                    </Text>
                                    <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
                                        {passwordStrength.label}
                                    </Text>
                                </View>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3, 4].map((level) => (
                                        <View
                                            key={level}
                                            style={[
                                                styles.strengthBar,
                                                {
                                                    backgroundColor: level <= passwordStrength.level
                                                        ? passwordStrength.color
                                                        : colors.border,
                                                },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.9}
                            style={[styles.signUpButton, shadows.accent, loading && styles.buttonDisabled]}
                        >
                            <LinearGradient
                                colors={(loading ? ['#94A3B8', '#94A3B8'] : (colors.primary.gradient || [colors.primary.main || '#0052FF', colors.primary.light || '#4D7CFF'])) as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.signUpButtonGradient}
                            >
                                <Text style={styles.signUpButtonText}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                        >
                            <Text style={[styles.footerLink, { color: colors.primary.main }]}>
                                Log In
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={[styles.terms, { color: colors.slate[400] }]}>
                        By creating an account, you agree to our{' '}
                        <Text style={{ color: colors.primary.main }}>Terms</Text>
                        {' '}and{' '}
                        <Text style={{ color: colors.primary.main }}>Privacy Policy</Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// Safe area helper for Android
function SafeAreaViewCompat({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ paddingTop: Platform.OS === 'android' ? 50 : 60 }}>
            {children}
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[8],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSection: {
        alignItems: 'center',
        paddingTop: spacing[6],
        paddingBottom: spacing[8],
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        marginBottom: spacing[5],
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing[2],
    },
    badgeText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.xs,
        letterSpacing: 2,
    },
    headline: {
        fontFamily: fonts.display,
        fontSize: fontSize['4xl'],
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    subheadline: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        textAlign: 'center',
    },
    formSection: {
        flex: 1,
    },
    strengthContainer: {
        marginTop: -spacing[2],
        marginBottom: spacing[4],
    },
    strengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[2],
    },
    strengthLabel: {
        fontFamily: fonts.body,
        fontSize: fontSize.xs,
    },
    strengthValue: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.xs,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    strengthBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    signUpButton: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginTop: spacing[4],
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    signUpButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpButtonText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing[8],
    },
    footerText: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
    },
    footerLink: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
    },
    terms: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
        textAlign: 'center',
        paddingTop: spacing[4],
        lineHeight: 20,
    },
});
