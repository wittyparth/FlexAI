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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';
import { Button, ProgressBar } from '../../components/ui';

const DURATION_OPTIONS = [
    { value: 30, label: '30 mins', description: 'Quick HIIT or express flows' },
    { value: 45, label: '45 mins', description: 'Balanced strength & cardio' },
    { value: 60, label: '60 mins', description: 'Full functionality & endurance' },
    { value: 90, label: '75+ mins', description: 'Pro-level marathon sessions' },
];

import { useAuthStore } from '../../store/authStore';

export function WorkoutDurationScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();
    const [selectedDuration, setSelectedDuration] = useState<number | null>(45);

    const handleContinue = () => {
        if (selectedDuration) {
            setUpdatedUser({ workoutDuration: selectedDuration });
            navigation.navigate('Equipment');
        }
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
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>STEP 7 OF 10</Text>
                    </View>

                    <TouchableOpacity onPress={handleContinue}>
                        <Text style={[styles.skipText, { color: colors.primary.main }]}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <ProgressBar progress={0.7} style={styles.progressBar} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        How long are{'\n'}your <Text style={{ color: colors.primary.main }}>workouts?</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Choose your preferred workout duration for a balanced routine.
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    {DURATION_OPTIONS.map((option) => {
                        const isSelected = selectedDuration === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setSelectedDuration(option.value)}
                                activeOpacity={0.8}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                    }
                                ]}
                            >
                                <View style={[
                                    styles.valueBox,
                                    { backgroundColor: isSelected ? colors.primary.main : colors.muted }
                                ]}>
                                    <Text style={[
                                        styles.valueText,
                                        { color: isSelected ? '#FFF' : colors.foreground, fontFamily: fonts.display }
                                    ]}>
                                        {option.value === 90 ? '75+' : option.value}
                                    </Text>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.optionLabel, { color: colors.foreground }]}>{option.label}</Text>
                                    <Text style={[styles.optionDescription, { color: colors.mutedForeground }]}>{option.description}</Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <LinearGradient
                    colors={[colors.background + '00', colors.background] as any}
                    style={styles.footerGradient}
                    pointerEvents="none"
                />
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={selectedDuration === null}
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
    optionsContainer: {
        gap: spacing[4],
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[5],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        ...shadows.sm,
    },
    valueBox: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4],
    },
    valueText: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.base,
        marginBottom: 2,
    },
    optionDescription: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
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
