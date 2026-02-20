import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../../App';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useColors } from '../../hooks/useColors';

type NotificationScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Notification'>;

interface Props {
    navigation: NotificationScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
    const { mode: theme } = useTheme();
    const colors = useColors();
    const { setUpdatedUser } = useAuthStore();
    const isDark = theme === 'dark';

    const handleEnableNotifications = async () => {
        // In a real app, request permission here
        // const { status } = await Notifications.requestPermissionsAsync();
        // if (status === 'granted') ...

        // For now, simulate success
        setUpdatedUser({ pushEnabled: true });
        navigation.navigate('AppTour');
    };

    const handleSkip = () => {
        setUpdatedUser({ pushEnabled: false });
        navigation.navigate('AppTour');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Progress Bar */}
            <View style={styles.header}>
                <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressBarFill, { backgroundColor: colors.primary.main, width: '100%' }]} />
                </View>
            </View>

            <View style={styles.content}>
                {/* Hero Section */}
                <View style={styles.imageContainer}>
                    <View
                        style={styles.blob}
                    />
                    <View style={[styles.imageCard, { shadowColor: colors.primary.main, backgroundColor: colors.card }]}>
                        {/* Placeholder for the 3D notification image - using a gradient/icon composition instead of external URL */}
                        <View
                            style={styles.imagePlaceholder}
                        >
                            <Ionicons name="notifications-outline" size={80} color={colors.primary.main} />
                            <View style={[styles.badge, { backgroundColor: colors.primary.main }]}>
                                <Text style={styles.badgeText}>1</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.foreground }]}>Stay on Track</Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Don't miss out on important updates about your fitness journey.
                    </Text>
                </View>

                {/* Benefits List */}
                <View style={styles.benefitsList}>
                    {[
                        'Workout Reminders',
                        'PR Alerts',
                        'AI Coach Tips'
                    ].map((item, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <View style={[styles.checkIcon, { backgroundColor: colors.primary.main + '20' }]}>
                                <Ionicons name="checkmark" size={18} color={colors.primary.main} />
                            </View>
                            <Text style={[styles.benefitText, { color: colors.foreground }]}>{item}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleEnableNotifications} style={styles.buttonContainer}>
                    <View
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>Enable Notifications</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSkip} style={styles.secondaryButton}>
                    <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>Maybe Later</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    blob: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        opacity: 0.5,
    },
    imageCard: {
        width: 240,
        height: 240,
        borderRadius: 40,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        padding: 8,
    },
    imagePlaceholder: {
        flex: 1,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 40,
        right: 50,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
    },
    benefitsList: {
        width: '100%',
        maxWidth: 300,
        gap: 20,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    checkIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitText: {
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        gap: 16,
        paddingBottom: 40,
    },
    buttonContainer: {
        shadowColor: '#134dec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    primaryButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    secondaryButton: {
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
});
