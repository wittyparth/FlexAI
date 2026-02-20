import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';
import { Button, ProgressBar } from '../../components/ui';
import { WorkoutInterest } from '../../types/user';

interface InterestOption {
    id: WorkoutInterest;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const INTEREST_OPTIONS: InterestOption[] = [
    { id: 'gym', title: 'Gym Training', icon: 'barbell-outline' },
    { id: 'home', title: 'Home Workouts', icon: 'home-outline' },
    { id: 'yoga', title: 'Yoga & Pilates', icon: 'body-outline' },
    { id: 'running', title: 'Running', icon: 'walk-outline' },
    { id: 'swimming', title: 'Swimming', icon: 'water-outline' },
    { id: 'cycling', title: 'Cycling', icon: 'bicycle-outline' },
    { id: 'calisthenics', title: 'Bodyweight', icon: 'man-outline' },
    { id: 'sports', title: 'Sports', icon: 'basketball-outline' },
];

import { useAuthStore } from '../../store/authStore';

export function WorkoutInterestsScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();
    const [selectedInterests, setSelectedInterests] = useState<WorkoutInterest[]>([]);

    const toggleInterest = (id: WorkoutInterest) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(i => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    const handleContinue = () => {
        setUpdatedUser({ workoutInterests: selectedInterests });
        navigation.navigate('WorkoutFrequency');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: colors.muted }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <View style={[styles.stepChip, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>STEP 5 OF 10</Text>
                    </View>

                    <TouchableOpacity onPress={handleContinue}>
                        <Text style={[styles.skipText, { color: colors.primary.main }]}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <ProgressBar progress={0.5} style={styles.progressBar} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        What are your {'\n'}
                        <Text style={{ color: colors.primary.main }}>fitness interests?</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        This helps us recommend the best routines and challenges for you.
                    </Text>
                </View>

                <View style={styles.interestsContainer}>
                    {INTEREST_OPTIONS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.id);
                        return (
                            <TouchableOpacity
                                key={interest.id}
                                onPress={() => toggleInterest(interest.id)}
                                activeOpacity={0.8}
                                style={[
                                    styles.interestChip,
                                    {
                                        backgroundColor: isSelected ? colors.primary.main : colors.card,
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={interest.icon}
                                    size={18}
                                    color={isSelected ? '#FFF' : colors.mutedForeground}
                                />
                                <Text style={[
                                    styles.interestText,
                                    { color: isSelected ? '#FFF' : colors.foreground }
                                ]}>
                                    {interest.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <View
                    style={styles.footerGradient}
                    pointerEvents="none"
                />
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={selectedInterests.length === 0}
                    variant="primary"
                    size="large"
                    icon={<Ionicons name="arrow-forward" size={20} color="#FFF" />}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[4],
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
    },
    stepText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.xs,
        letterSpacing: 0.5,
    },
    skipText: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.sm,
    },
    progressBar: {
        marginTop: spacing[2],
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[4],
        paddingBottom: 120,
    },
    headlineSection: {
        marginBottom: spacing[8],
    },
    title: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        lineHeight: 40,
        marginBottom: spacing[2],
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: fontSize.base,
        lineHeight: 24,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    interestChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        gap: spacing[2],
    },
    interestText: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.base,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing[6],
        paddingBottom: Platform.OS === 'ios' ? spacing[10] : spacing[6],
    },
    footerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: spacing[12],
    },
});
