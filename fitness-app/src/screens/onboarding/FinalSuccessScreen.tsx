import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Animated,
    Dimensions,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing } from '../../constants';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useUserQueries } from '../../hooks/queries/useUserQueries';

const { width } = Dimensions.get('window');

export function FinalSuccessScreen() {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setOnboardingCompleted, updatedUser } = useAuthStore();
    const { submitOnboardingMutation } = useUserQueries();

    const scaleAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(0);
    const translateYAnim = new Animated.Value(20);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleFinish = async () => {
        try {
            // Submit all onboarding data to the backend
            if (updatedUser && Object.keys(updatedUser).length > 0) {
                await submitOnboardingMutation.mutateAsync(updatedUser as any);
            }

            // Mark onboarding as completed (this also updates local state)
            setOnboardingCompleted(true);
        } catch (error: any) {
            console.error('Failed to complete onboarding:', error);

            // Still allow user to proceed even if API fails (offline-first UX)
            // But warn them
            Alert.alert(
                'Sync Issue',
                'We couldn\'t sync your profile to the cloud. Your data is saved locally and will sync when you reconnect.',
                [
                    {
                        text: 'Continue',
                        onPress: () => setOnboardingCompleted(true),
                    }
                ]
            );
        }
    };

    const loading = submitOnboardingMutation.isPending;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Background elements */}
            <View style={styles.ambientGlow}>
                <View style={[styles.glowBall, { backgroundColor: colors.primary.main + '30' }]} />
            </View>

            <View style={styles.centerContent}>
                <Animated.View style={[
                    styles.iconContainer,
                    {
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: colors.primary.main,
                    }
                ]}>
                    <Ionicons name="checkmark-done" size={60} color="#FFF" />
                </Animated.View>

                <Animated.View style={{
                    opacity: opacityAnim,
                    transform: [{ translateY: translateYAnim }],
                    alignItems: 'center'
                }}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        You're <Text style={{ color: colors.primary.main }}>All Set!</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Your personalized fitness journey is ready. Welcome to the community!
                    </Text>
                </Animated.View>

                <View style={styles.statsRow}>
                    <Animated.View style={[styles.statItem, { opacity: opacityAnim }]}>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>10/10</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Steps Done</Text>
                    </Animated.View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Animated.View style={[styles.statItem, { opacity: opacityAnim }]}>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>100%</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Ready</Text>
                    </Animated.View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Start My Journey"
                    onPress={handleFinish}
                    loading={loading}
                    variant="primary"
                    size="large"
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ambientGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowBall: {
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width,
        opacity: 0.15,
    },
    centerContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: fontSize['4xl'],
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xxl,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    statValue: {
        fontFamily: fonts.display,
        fontSize: fontSize['2xl'],
    },
    statLabel: {
        fontFamily: fonts.body,
        fontSize: fontSize.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    divider: {
        width: 1,
        height: 40,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.xl,
        paddingBottom: spacing['3xl'], // Extra padding for safe area
    },
});
