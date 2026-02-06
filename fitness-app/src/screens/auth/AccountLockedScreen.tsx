/**
 * Account Locked Screen - Security State
 * 
 * Design: security_alert_locked_state
 * 
 * Used when too many failed login attempts have occurred.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';

interface AccountLockedScreenProps {
    navigation: any;
    route?: { params?: { waitTime?: number } };
}

export function AccountLockedScreen({ navigation, route }: AccountLockedScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();

    // Default wait time is 15 minutes (900 seconds) if not provided
    const [timeLeft, setTimeLeft] = useState(route?.params?.waitTime || 900);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Format time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@fittrack.com?subject=Account%20Locked');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Dot Pattern Overlay (Simulated with views or could be an image) */}
            <View style={styles.dotPatternContainer}>
                {Array.from({ length: 100 }).map((_, i) => (
                    <View key={i} style={styles.dot} />
                ))}
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Hero Visual */}
                <View style={styles.iconWrapper}>
                    <View style={[styles.iconGlow, { backgroundColor: colors.primary + '30' }]} />
                    <View style={styles.iconCircle}>
                        <Ionicons name="lock-closed" size={64} color={colors.primary} />
                        <View style={[styles.iconRing, { borderColor: colors.primary + '20' }]} />
                    </View>
                </View>

                {/* Headline */}
                <Text style={styles.title}>
                    Account Temporarily Locked
                </Text>

                {/* Body Text */}
                <Text style={styles.subtitle}>
                    For your security, we've paused access due to multiple failed login attempts. Please wait before trying again.
                </Text>

                {/* Countdown Timer */}
                <View style={styles.timerSection}>
                    <Text style={styles.timerLabel}>Try again in</Text>
                    <Text style={[styles.timerValue, { color: colors.primary }]}>
                        {formatTime(timeLeft)}
                    </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    onPress={handleContactSupport}
                    activeOpacity={0.8}
                    style={styles.actionButton}
                >
                    <View style={[styles.buttonInner, { borderColor: colors.primary }]}>
                        <Text style={styles.buttonText}>Contact Support</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.returnButton}
                >
                    <Ionicons name="arrow-back" size={18} color="#94A3B8" />
                    <Text style={styles.returnText}>Return to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B', // Slate deep from design
    },
    dotPatternContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        opacity: 0.1,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 1,
        backgroundColor: '#FFFFFF',
        margin: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
    iconWrapper: {
        width: 128,
        height: 128,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[8],
    },
    iconGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    iconCircle: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconRing: {
        position: 'absolute',
        width: 144,
        height: 144,
        borderRadius: 72,
        borderWidth: 1,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing[6],
        lineHeight: 40,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        color: '#CBD5E1', // Slate 300
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing[10],
        maxWidth: 300,
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: spacing[12],
    },
    timerLabel: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.sm,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing[2],
    },
    timerValue: {
        fontFamily: fonts.mono,
        fontSize: 40,
        letterSpacing: 2,
    },
    actionButton: {
        width: '100%',
        height: 56,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
    },
    buttonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: borderRadius.xl,
        backgroundColor: '#1E293B',
    },
    buttonText: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.lg,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    footer: {
        paddingBottom: spacing[10],
        alignItems: 'center',
    },
    returnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    returnText: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.sm,
        color: '#94A3B8',
    },
});
