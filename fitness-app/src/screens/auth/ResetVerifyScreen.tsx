/**
 * Reset Verify Screen - OTP Input for Password Reset
 * 
 * Backend Integration:
 * - Navigate from ForgotPassword with email
 * - Collect OTP and navigate to ResetPassword with { email, otp }
 * 
 * Design: email_otp_verification
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
import { authApi } from '../../api/auth.api';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

const OTP_LENGTH = 6;

interface ResetVerifyScreenProps {
    navigation: any;
    route: { params: { email: string } };
}

export function ResetVerifyScreen({ navigation, route }: ResetVerifyScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { email } = route.params;

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const [error, setError] = useState('');

    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    // Format time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
            handleContinue(newOtp.join(''));
        }
    };

    // Handle backspace
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Continue to next screen
    const handleContinue = (code?: string) => {
        const otpCode = code || otp.join('');

        if (otpCode.length !== OTP_LENGTH) {
            setError('Please enter the complete verification code');
            return;
        }

        // Navigate to Reset Password Screen with email and OTP
        navigation.navigate('ResetPassword', { email, otp: otpCode });
    };

    // Resend verification code (uses the same forgotPassword endpoint to trigger new OTP)
    const handleResend = async () => {
        if (resendCountdown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);

            setResendCountdown(60); // 60 second cooldown
            Alert.alert('Code Sent', 'A new password reset code has been sent to your email.');

        } catch (error: any) {
            console.error('Resend error:', error);
            Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Background Decoration */}
            <View style={[styles.decorationTop, { backgroundColor: colors.primary + '15' }]} />
            <View style={[styles.decorationBottom, { backgroundColor: colors.primary + '10' }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title */}
                    <Text style={[styles.title, { color: colors.text }]}>
                        Check Your Inbox
                    </Text>

                    {/* Subtitle */}
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        We sent a code to{'\n'}
                        <Text style={[styles.emailText, { color: colors.text }]}>{email}</Text>
                    </Text>

                    {/* OTP Input Section */}
                    <View style={styles.otpSection}>
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <View key={index} style={styles.otpInputWrapper}>
                                    {/* Active background glow for current focused or filled input */}
                                    {(digit !== '' || (otp.findIndex(d => d === '') === index)) && (
                                        <View style={[styles.otpActiveGlow, { backgroundColor: colors.primary + '20' }]} />
                                    )}
                                    <TextInput
                                        ref={(ref) => { inputRefs.current[index] = ref; }}
                                        style={[
                                            styles.otpInput,
                                            {
                                                backgroundColor: colors.backgroundSecondary,
                                                color: colors.text,
                                                borderColor: error ? colors.error : (digit ? colors.primary : colors.border),
                                            },
                                        ]}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                        autoFocus={index === 0}
                                        placeholder="•"
                                        placeholderTextColor={isDark ? '#4A5568' : '#D1D5DB'}
                                    />
                                </View>
                            ))}
                        </View>

                        {/* Error Text */}
                        {error ? (
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {error}
                            </Text>
                        ) : null}
                    </View>

                    {/* Timer Section */}
                    <View style={styles.timerSection}>
                        <View style={[styles.timerBadge, { backgroundColor: isDark ? colors.backgroundSecondary : '#F3F4F6' }]}>
                            <View style={styles.timerDot}>
                                <View style={[styles.timerDotInner, { backgroundColor: colors.primary }]} />
                                <View style={[styles.timerDotPulse, { backgroundColor: colors.primary + '50' }]} />
                            </View>
                            <Text style={[styles.timerText, { color: colors.text }]}>
                                {formatTime(resendCountdown)}
                            </Text>
                        </View>
                        <Text style={[styles.timerLabel, { color: colors.textTertiary }]}>
                            Time remaining
                        </Text>
                    </View>

                    {/* Resend Action */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={handleResend}
                            disabled={resendLoading || resendCountdown > 0}
                            style={[
                                styles.resendButton,
                                { borderColor: colors.border }
                            ]}
                        >
                            <Ionicons
                                name="refresh"
                                size={20}
                                color={resendCountdown > 0 ? colors.textTertiary : colors.textSecondary}
                            />
                            <Text style={[
                                styles.resendButtonText,
                                { color: resendCountdown > 0 ? colors.textTertiary : colors.textSecondary }
                            ]}>
                                Resend Code
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
    decorationTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    decorationBottom: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
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
        paddingTop: spacing[8],
        alignItems: 'center',
    },
    title: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        textAlign: 'center',
        marginBottom: spacing[4],
        letterSpacing: 0.5,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing[12],
    },
    emailText: {
        fontFamily: fonts.bodyMedium,
        textDecorationLine: 'underline',
    },
    otpSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing[12],
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
    },
    otpInputWrapper: {
        position: 'relative',
        width: 48,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpActiveGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: borderRadius.xl,
    },
    otpInput: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        textAlign: 'center',
        fontFamily: fonts.mono,
        fontSize: fontSize['2xl'],
    },
    errorText: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
        marginTop: spacing[4],
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: spacing[12],
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.lg,
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    timerDot: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 1,
    },
    timerDotPulse: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    timerText: {
        fontFamily: fonts.mono,
        fontSize: fontSize.lg,
        letterSpacing: 1,
    },
    timerLabel: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.xs,
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: spacing[10],
        width: '100%',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        gap: spacing[2],
    },
    resendButtonText: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.base,
    },
});
