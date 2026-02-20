import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Platform,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

interface ResetPasswordScreenProps {
    navigation: any;
    route: { params: { email: string; otp: string } };
}

export function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { email, otp } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    // Password validation criteria
    const criteria = useMemo(() => ({
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
    }), [password]);

    const strengthScore = useMemo(() => {
        let score = 0;
        if (criteria.length) score++;
        if (criteria.upper) score++;
        if (criteria.lower) score++;
        if (criteria.number) score++;
        return score;
    }, [criteria]);

    const getStrengthLabel = () => {
        if (strengthScore === 0) return 'Very Weak';
        if (strengthScore === 1) return 'Weak';
        if (strengthScore <= 3) return 'Fair';
        return 'Strong';
    };

    const getStrengthColor = () => {
        if (strengthScore <= 1) return '#EF4444'; // Red
        if (strengthScore <= 3) return '#F59E0B'; // Orange
        return '#10B981'; // Green
    };

    const { resetPasswordMutation } = useAuthQueries();

    // Handle reset password
    const handleReset = async () => {
        let hasError = false;

        if (!criteria.length || !criteria.upper || !criteria.lower || !criteria.number) {
            setPasswordError('Password does not meet requirements');
            hasError = true;
        }

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            hasError = true;
        }

        if (hasError) return;

        setPasswordError('');
        setConfirmError('');

        resetPasswordMutation.mutate({
            email,
            otp,
            newPassword: password,
        }, {
            onSuccess: () => {
                Alert.alert(
                    'Password Updated',
                    'Your password has been successfully reset. You can now log in with your new password.',
                    [
                        {
                            text: 'Log In',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            },
            onError: (error: any) => {
                console.error('Reset password error:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';

                if (errorMessage.toLowerCase().includes('otp') || errorMessage.toLowerCase().includes('code')) {
                    Alert.alert('Invalid Code', 'The verification code is invalid or has expired. Please request a new code.');
                } else {
                    Alert.alert('Error', errorMessage);
                }
            }
        });
    };

    const loading = resetPasswordMutation.isPending;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { backgroundColor: colors.muted }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Reset Password</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Instruction Text */}
                <View style={styles.instructionContainer}>
                    <Text style={[styles.instructionTitle, { color: colors.foreground }]}>
                        Create New Password
                    </Text>
                    <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
                        Your new password must be different from previously used passwords.
                    </Text>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.foreground }]}>New Password</Text>
                    <Input
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setPasswordError('');
                        }}
                        placeholder="Enter new password"
                        secureTextEntry={!showPassword}
                        error={passwordError}
                        leftIcon="lock-closed-outline"
                        rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
                    <Input
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setConfirmError('');
                        }}
                        placeholder="Re-enter new password"
                        secureTextEntry={!showConfirmPassword}
                        error={confirmError}
                        leftIcon="lock-closed-outline"
                        rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                </View>

                {/* Password Strength Indicator */}
                <View style={styles.strengthContainer}>
                    <View style={styles.strengthHeader}>
                        <Text style={[styles.strengthTitle, { color: colors.mutedForeground }]}>Password Strength</Text>
                        <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
                            {getStrengthLabel()}
                        </Text>
                    </View>
                    <View style={[styles.strengthBarContainer, { backgroundColor: colors.muted }]}>
                        <View
                            style={[
                                styles.strengthBar,
                                {
                                    width: `${(strengthScore / 4) * 100}%`,
                                    backgroundColor: getStrengthColor()
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.strengthHint, { color: colors.mutedForeground }]}>
                        Must be at least 8 characters with uppercase, lowercase, and a number.
                    </Text>
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                    onPress={handleReset}
                    disabled={loading}
                    style={[styles.button, { opacity: loading ? 0.7 : 1 }]}
                >
                    <View
                        style={styles.gradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Reset Password</Text>
                        )}
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.lg,
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    instructionContainer: {
        marginBottom: spacing.xl,
    },
    instructionTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize.xl,
        marginBottom: spacing.xs,
    },
    instructionText: {
        fontFamily: fonts.regular,
        fontSize: fontSize.md,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    label: {
        fontFamily: fonts.medium,
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    strengthContainer: {
        marginBottom: spacing.xl,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    strengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    strengthTitle: {
        fontFamily: fonts.medium,
        fontSize: fontSize.xs,
    },
    strengthLabel: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.xs,
    },
    strengthBarContainer: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    strengthBar: {
        height: '100%',
        borderRadius: 2,
    },
    strengthHint: {
        fontFamily: fonts.regular,
        fontSize: 10,
    },
    button: {
        height: 56,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontFamily: fonts.semiBold,
        fontSize: fontSize.md,
    },
});
