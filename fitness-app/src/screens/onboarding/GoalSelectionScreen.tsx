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
import { PrimaryGoal } from '../../types/user';

interface GoalOption {
    id: PrimaryGoal;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const GOAL_OPTIONS: GoalOption[] = [
    {
        id: 'muscle_gain',
        title: 'Muscle Gain',
        description: 'Build mass & strength',
        icon: 'barbell-outline',
    },
    {
        id: 'fat_loss',
        title: 'Fat Loss',
        description: 'Burn calories & tone up',
        icon: 'flame-outline',
    },
    {
        id: 'athletic',
        title: 'Endurance',
        description: 'Improve cardio & stamina',
        icon: 'walk-outline',
    },
    {
        id: 'general',
        title: 'Flexibility',
        description: 'Enhance mobility & balance',
        icon: 'body-outline',
    },
];

import { useAuthStore } from '../../store/authStore';

export function GoalSelectionScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark } = useTheme();

    const { setUpdatedUser, logout } = useAuthStore();
    const [selectedGoal, setSelectedGoal] = useState<PrimaryGoal | null>(null);

    const handleContinue = () => {
        if (selectedGoal) {
            setUpdatedUser({ primaryGoal: selectedGoal });
            navigation.navigate('ExperienceLevel');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={logout}
                        style={[styles.backButton, { backgroundColor: colors.muted }]}
                    >
                        <Ionicons name="log-out-outline" size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <View style={[styles.stepChip, { backgroundColor: isDark ? colors.card : colors.background }]}>
                        {/* Note: In previous screens we used simple Text. Keeping design consistent with provided HTML implies looking at chip styling. 
                            If 'stepChip' is just a background, colors.muted might be better?
                            Let's use colors.muted for consistency with back button if that's the intention, 
                            or colors.card if it's card-like. 
                            The original code had colors.backgroundSecondary.
                            I'll use colors.muted for secondary elements.
                        */}
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>STEP 1 OF 10</Text>
                    </View>

                    <View style={{ width: 44 }} />
                </View>

                <ProgressBar progress={0.1} style={styles.progressBar} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        What is your {'\n'}
                        <Text style={{ color: colors.primary.main }}>main goal?</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        This helps us build a personalized workout plan just for you.
                    </Text>
                </View>

                <View style={styles.goalsList}>
                    {GOAL_OPTIONS.map((goal) => {
                        const isSelected = selectedGoal === goal.id;
                        return (
                            <TouchableOpacity
                                key={goal.id}
                                onPress={() => setSelectedGoal(goal.id)}
                                activeOpacity={0.8}
                                style={[
                                    styles.goalCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                    },
                                    isSelected && styles.selectedCard,
                                ]}
                            >
                                {isSelected && (
                                    <View style={[styles.selectedBorder, { borderColor: colors.primary.main }]} />
                                )}

                                <View style={styles.cardContent}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            {
                                                backgroundColor: isSelected
                                                    ? colors.primary.main
                                                    : (isDark ? colors.muted : colors.primary.main + '10')
                                            }
                                        ]}
                                    >
                                        <Ionicons
                                            name={goal.icon}
                                            size={28}
                                            color={isSelected ? '#FFFFFF' : colors.primary.main}
                                        />
                                    </View>

                                    <View style={styles.textContainer}>
                                        <Text style={[
                                            styles.goalTitle,
                                            { color: isSelected ? colors.primary.main : colors.foreground }
                                        ]}>
                                            {goal.title}
                                        </Text>
                                        <Text style={[styles.goalDescription, { color: colors.mutedForeground }]}>
                                            {goal.description}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.radioCircle,
                                            {
                                                borderColor: isSelected ? colors.primary.main : colors.border,
                                                backgroundColor: isSelected ? colors.primary.main : 'transparent'
                                            }
                                        ]}
                                    >
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </View>
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
                    disabled={!selectedGoal}
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
    progressBar: {
        marginTop: spacing[2],
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[4],
        paddingBottom: 120, // Space for footer
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
    goalsList: {
        gap: spacing[4],
    },
    goalCard: {
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        padding: spacing[4],
        position: 'relative',
        overflow: 'hidden',
        ...shadows.sm,
    },
    selectedCard: {
        ...shadows.md,
    },
    selectedBorder: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderWidth: 2,
        borderRadius: borderRadius.xl,
        zIndex: -1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4],
    },
    textContainer: {
        flex: 1,
    },
    goalTitle: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.base,
        marginBottom: 2,
    },
    goalDescription: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing[6],
        paddingBottom: Platform.OS === 'ios' ? spacing[10] : spacing[6],
        // borderTopWidth: 1, // Removed border as we use gradient now or just clean footer
        // borderTopColor: 'transparent',
    },
    footerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: spacing[12],
    },
});
