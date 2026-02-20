import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { Button, ProgressBar } from '../../components/ui';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';
import { ExperienceLevel } from '../../types/user';

interface ExperienceLevelScreenProps {
    navigation: any;
}

interface ExperienceOption {
    id: ExperienceLevel;
    title: string;
    description: string;
}

const EXPERIENCE_OPTIONS: ExperienceOption[] = [
    {
        id: 'beginner',
        title: 'Beginner',
        description: "I'm new to fitness training.",
    },
    {
        id: 'intermediate',
        title: 'Intermediate',
        description: 'I train a few times a week.',
    },
    {
        id: 'advanced',
        title: 'Advanced',
        description: 'Fitness is a key part of my life.',
    },
    {
        id: 'elite',
        title: 'Elite',
        description: 'I am a competitive athlete or pro.',
    },
];

import { useAuthStore } from '../../store/authStore';

export function ExperienceLevelScreen({ navigation }: ExperienceLevelScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();
    const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);

    const handleContinue = () => {
        if (selectedLevel) {
            setUpdatedUser({ experienceLevel: selectedLevel });
            navigation.navigate('PhysicalProfile');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Top Navigation */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.muted }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressStep, { color: colors.mutedForeground }]}>
                        Step 2 of 10
                    </Text>
                </View>
                <ProgressBar progress={0.2} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.headline, { color: colors.foreground }]}>
                    How experienced are you?
                </Text>

                <View style={styles.optionsContainer}>
                    {EXPERIENCE_OPTIONS.map((option) => {
                        const isSelected = selectedLevel === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                activeOpacity={0.8}
                                onPress={() => setSelectedLevel(option.id)}
                            >
                                <View style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: isSelected ? colors.primary.main : colors.border
                                    },
                                    isSelected && shadows.accent
                                ]}>
                                    {isSelected && (
                                        <View
                                            style={styles.gradientBorder}
                                        />
                                    )}
                                    <View style={[
                                        styles.optionInner,
                                        { backgroundColor: colors.card }
                                    ]}>
                                        <View style={styles.optionTextContainer}>
                                            <Text style={[
                                                styles.optionTitle,
                                                { color: isSelected ? colors.primary.main : colors.foreground }
                                            ]}>
                                                {option.title}
                                            </Text>
                                            <Text style={[
                                                styles.optionDescription,
                                                { color: colors.mutedForeground }
                                            ]}>
                                                {option.description}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.indicator,
                                            {
                                                borderColor: isSelected ? colors.primary.main : colors.border,
                                                backgroundColor: isSelected ? colors.primary.main : 'transparent'
                                            }
                                        ]}>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={16} color="#FFF" />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <View
                    style={styles.footerGradient}
                    pointerEvents="none"
                />
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedLevel}
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
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: spacing[4],
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        paddingHorizontal: spacing[6],
        marginTop: spacing[4],
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[2],
    },
    progressStep: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[6],
        paddingBottom: 120,
    },
    headline: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        lineHeight: 40,
        marginBottom: spacing[8],
    },
    optionsContainer: {
        gap: spacing[4],
    },
    optionCard: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    gradientBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    optionInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing[5],
        margin: 2, // Width of gradient border
        borderRadius: borderRadius.lg - 2,
    },
    optionTextContainer: {
        flex: 1,
        marginRight: spacing[4],
    },
    optionTitle: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.lg,
        marginBottom: 4,
    },
    optionDescription: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
    },
    indicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing[6],
        paddingTop: spacing[12],
    },
    footerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: spacing[12],
    },
});
