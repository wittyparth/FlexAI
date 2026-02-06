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

const FREQUENCY_OPTIONS = [
    { value: 1, label: '1 day', description: 'Just starting out' },
    { value: 2, label: '2 days', description: 'Steady pace' },
    { value: 3, label: '3 days', description: 'Balanced routine' },
    { value: 4, label: '4 days', description: 'Fitness enthusiast' },
    { value: 5, label: '5 days', description: 'Dedicated athlete' },
    { value: 6, label: '6 days', description: 'Maximum effort' },
    { value: 7, label: '7 days', description: 'No rest days' },
];

import { useAuthStore } from '../../store/authStore';

export function WorkoutFrequencyScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();
    const [selectedFrequency, setSelectedFrequency] = useState<number | null>(4);

    const handleContinue = () => {
        if (selectedFrequency) {
            setUpdatedUser({ trainingDaysPerWeek: selectedFrequency });
            navigation.navigate('WorkoutDuration');
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
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>STEP 6 OF 10</Text>
                    </View>

                    <View style={{ width: 44 }} />
                </View>

                <ProgressBar progress={0.6} style={styles.progressBar} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        How many <Text style={{ color: colors.primary.main }}>days a week?</Text>
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Choose how many days you can realistically commit to training.
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    {FREQUENCY_OPTIONS.map((option) => {
                        const isSelected = selectedFrequency === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setSelectedFrequency(option.value)}
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
                                        { color: isSelected ? '#FFF' : colors.foreground }
                                    ]}>
                                        {option.value}
                                    </Text>
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.optionLabel, { color: colors.foreground }]}>{option.label}</Text>
                                    <Text style={[styles.optionDescription, { color: colors.mutedForeground }]}>{option.description}</Text>
                                </View>
                                <View style={[
                                    styles.radioCircle,
                                    {
                                        borderColor: isSelected ? colors.primary.main : colors.border,
                                        backgroundColor: isSelected ? colors.primary.main : 'transparent'
                                    }
                                ]}>
                                    {isSelected && <View style={styles.radioInner} />}
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
                    disabled={selectedFrequency === null}
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
        gap: spacing[3],
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        ...shadows.sm,
    },
    valueBox: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[4],
    },
    valueText: {
        fontFamily: fonts.display,
        fontSize: fontSize.xl,
    },
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.base,
    },
    optionDescription: {
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
        backgroundColor: '#FFF',
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
