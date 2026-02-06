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
import { SecondaryGoal } from '../../types/user';

interface GoalOption {
    id: SecondaryGoal;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const SECONDARY_GOALS: GoalOption[] = [
    { id: 'strength', title: 'Pure Strength', icon: 'barbell-outline' },
    { id: 'mass', title: 'Muscle Mass', icon: 'fitness-outline' },
    { id: 'toning', title: 'Muscle Toning', icon: 'body-outline' },
    { id: 'endurance', title: 'Cardio Endurance', icon: 'walk-outline' },
    { id: 'flexibility', title: 'Flexibility', icon: 'infinite-outline' },
    { id: 'health', title: 'Better Health', icon: 'heart-outline' },
    { id: 'speed', title: 'Speed & Power', icon: 'flash-outline' },
    { id: 'balance', title: 'Balance & Stability', icon: 'leaf-outline' },
];

// ... imports remain same ...

import { useAuthStore } from '../../store/authStore';

export function SecondaryGoalsScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();
    const [selectedGoals, setSelectedGoals] = useState<SecondaryGoal[]>([]);

    const toggleGoal = (id: SecondaryGoal) => {
        if (selectedGoals.includes(id)) {
            setSelectedGoals(selectedGoals.filter(g => g !== id));
        } else if (selectedGoals.length < 3) {
            setSelectedGoals([...selectedGoals, id]);
        }
    };

    const handleContinue = () => {
        setUpdatedUser({ secondaryGoals: selectedGoals });
        navigation.navigate('WorkoutInterests');
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
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>STEP 4 OF 10</Text>
                    </View>

                    <TouchableOpacity onPress={handleContinue}>
                        <Text style={[styles.skipText, { color: colors.primary.main }]}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <ProgressBar progress={0.4} style={styles.progressBar} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        Any <Text style={{ color: colors.primary.main }}>secondary goals?</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Select up to 3 topics you'd like to focus on in addition to your main goal.
                    </Text>
                </View>

                <View style={styles.grid}>
                    {SECONDARY_GOALS.map((goal) => {
                        const isSelected = selectedGoals.includes(goal.id);
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                onPress={() => toggleGoal(goal.id)}
                                activeOpacity={0.8}
                                style={[
                                    styles.goalCard,
                                    {
                                        backgroundColor: isSelected
                                            ? (isDark ? colors.primary.main + '20' : colors.primary.main + '08')
                                            : colors.card,
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                    },
                                ]}
                            >
                                <View style={[
                                    styles.iconBox,
                                    { backgroundColor: isSelected ? colors.primary.main : colors.muted }
                                ]}>
                                    <Ionicons
                                        name={goal.icon}
                                        size={24}
                                        color={isSelected ? '#FFF' : colors.mutedForeground}
                                    />
                                </View>
                                <Text style={[
                                    styles.goalTitle,
                                    { color: isSelected ? colors.primary.main : colors.foreground }
                                ]}>
                                    {goal.title}
                                </Text>
                                <View style={[
                                    styles.checkbox,
                                    {
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                        backgroundColor: isSelected ? colors.primary.main : 'transparent'
                                    }
                                ]}>
                                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <LinearGradient
                    colors={[colors.background + '00', colors.background]}
                    style={styles.footerGradient}
                    pointerEvents="none"
                />
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={selectedGoals.length === 0}
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[4],
    },
    goalCard: {
        width: '47%',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        padding: spacing[4],
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        ...shadows.sm,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    goalTitle: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    checkbox: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
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
