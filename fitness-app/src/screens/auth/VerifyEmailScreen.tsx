/**
 * Email Verification Screen - OTP Input
 * 
 * Backend Integration:
 * - POST /auth/verify-email with { email, otp }
 * - POST /auth/resend-verification with { email }
 * 
 * Only uses data from backend - no placeholder content
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const OTP_LENGTH = 6;

interface VerifyEmailScreenProps {
    navigation: any;
    route: { params: { email: string } };
}

export function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { email } = route.params;

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [resendCountdown, setResendCountdown] = useState(0);
    const [error, setError] = useState('');

    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Handle OTP input
    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only last digit
        setOtp(newOtp);
        setError('');

        // Auto-advance to next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (newOtp.every(digit => digit) && newOtp.join('').length === OTP_LENGTH) {
            handleVerify(newOtp.join(''));
        }
    };

    // Handle backspace
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const { verifyEmailMutation, resendVerificationMutation } = useAuthQueries();

    // Verify OTP with backend
    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join('');

        if (otpCode.length !== OTP_LENGTH) {
            setError('Please enter the complete verification code');
            return;
        }

        setError('');

        verifyEmailMutation.mutate({ email, otp: otpCode }, {
            onError: (error: any) => {
                console.error('Verification error:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
                setError(errorMessage);
            }
        });
    };

    // Resend verification code
    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setError('');

        resendVerificationMutation.mutate(email, {
            onSuccess: () => {
                setResendCountdown(60); // 60 second cooldown
                Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
            },
            onError: (error: any) => {
                console.error('Resend error:', error);
                Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
            }
        });
    };

    const loading = verifyEmailMutation.isPending;
    const resendLoading = resendVerificationMutation.isPending;

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
                        <Ionicons name="mail-open-outline" size={48} color={colors.primary.main} />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        Verify Your Email
                    </Text>

                    {/* Subtitle - shows actual email from backend */}
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={{ color: colors.foreground, fontFamily: fonts.bodyMedium }}>{email}</Text>
                    </Text>

                    {/* OTP Input */}
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        color: colors.foreground,
                                        borderColor: error ? '#ef4444' : (digit ? colors.primary.main : colors.border),
                                    },
                                ]}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                editable={!loading}
                            />
                        ))}
                    </View>

                    {/* Error */}
                    {error ? (
                        <Text style={[styles.errorText, { color: colors.error }]}>
                            {error}
                        </Text>
                    ) : null}

                    {/* Verify Button */}
                    <TouchableOpacity
                        onPress={() => handleVerify()}
                        disabled={loading || otp.join('').length !== OTP_LENGTH}
                        activeOpacity={0.9}
                        style={[
                            styles.verifyButton,
                            shadows.accent,
                            (loading || otp.join('').length !== OTP_LENGTH) && styles.buttonDisabled
                        ]}
                    >
                        <LinearGradient
                            colors={(loading ? ['#94A3B8', '#94A3B8'] : (colors.primary.gradient || [colors.primary.main, colors.primary.light])) as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.verifyButtonGradient}
                        >
                            <Text style={styles.verifyButtonText}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Resend */}
                    <View style={styles.resendContainer}>
                        <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
                            Didn't receive the code?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={resendLoading || resendCountdown > 0}
                        >
                            <Text style={[
                                styles.resendLink,
                                { color: resendCountdown > 0 ? colors.mutedForeground : colors.primary.main }
                            ]}>
                                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    otpInput: {
        width: 50,
        height: 56,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        textAlign: 'center',
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize['2xl'],
    },
    errorText: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    verifyButton: {
        width: '100%',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginTop: spacing[4],
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    verifyButtonGradient: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifyButtonText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
        color: '#FFFFFF',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing[6],
    },
    resendText: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
    },
    resendLink: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.base,
    },
});
