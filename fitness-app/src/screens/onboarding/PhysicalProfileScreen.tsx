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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { Button, ProgressBar } from '../../components/ui';
import { fonts, fontSize, spacing, borderRadius, shadows } from '../../constants';
import { Gender, UnitSystem } from '../../types/user';

interface PhysicalProfileScreenProps {
    navigation: any;
}

import { useAuthStore } from '../../store/authStore';

export function PhysicalProfileScreen({ navigation }: PhysicalProfileScreenProps) {
    const colors = useColors();
    const { isDark } = useTheme();
    const { setUpdatedUser } = useAuthStore();

    // State
    const [gender, setGender] = useState<Gender>('male');
    const [age, setAge] = useState(24);
    const [height, setHeight] = useState(175); // cm
    const [weight, setWeight] = useState(165); // lbs
    const [heightUnit, setHeightUnit] = useState<UnitSystem>('metric');
    const [weightUnit, setWeightUnit] = useState<UnitSystem>('imperial');

    const handleContinue = () => {
        setUpdatedUser({
            gender,
            age,
            height,
            weight
        });
        navigation.navigate('SecondaryGoals');
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
                <Text style={[styles.stepText, { color: colors.mutedForeground }]}>Step 3 of 10</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <ProgressBar progress={0.3} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleSection}>
                    <Text style={[styles.headline, { color: colors.foreground }]}>
                        Tell us about{'\n'}yourself
                    </Text>
                    <Text style={[styles.subheadline, { color: colors.mutedForeground }]}>
                        This helps us tailor your plan.
                    </Text>
                </View>

                {/* Gender Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Gender</Text>
                    <View style={[styles.genderContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {(['male', 'female', 'other'] as const).map((g) => {
                            const isSelected = gender === g;
                            return (
                                <TouchableOpacity
                                    key={g}
                                    style={styles.genderOption}
                                    onPress={() => setGender(g)}
                                    activeOpacity={0.8}
                                >
                                    {isSelected ? (
                                        <LinearGradient
                                            colors={(colors.primary.gradient || [colors.primary.main, colors.primary.light]) as any}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.genderActiveBg}
                                        />
                                    ) : null}
                                    <View style={styles.genderLabelContainer}>
                                        {g !== 'other' && (
                                            <Ionicons
                                                name={g as any}
                                                size={18}
                                                color={isSelected ? '#FFF' : colors.mutedForeground}
                                            />
                                        )}
                                        <Text style={[
                                            styles.genderText,
                                            { color: isSelected ? '#FFF' : colors.mutedForeground }
                                        ]}>
                                            {g.charAt(0).toUpperCase() + g.slice(1)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Age Selector */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Age</Text>
                        <View style={styles.valueContainer}>
                            <Text style={[styles.valueText, { color: colors.foreground }]}>{age}</Text>
                            <Text style={[styles.valueUnit, { color: colors.mutedForeground }]}>years</Text>
                        </View>
                    </View>
                    <View style={styles.sliderContainer}>
                        {/* Custom Simple Slider implementation or use an external library */}
                        {/* For now using a simple placeholder scroll or input if needed, but following Stitch design */}
                        <View style={styles.sliderTrackPlaceholder}>
                            <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                                <View style={[styles.sliderFill, { backgroundColor: colors.primary.main, width: `${((age - 16) / (99 - 16)) * 100}%` }]} />
                            </View>
                            <View style={[styles.sliderThumb, {
                                borderColor: colors.primary.main,
                                backgroundColor: '#FFF',
                                left: `${((age - 16) / (99 - 16)) * 100}%`,
                                marginLeft: -14
                            }]} />
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLimit}>16</Text>
                            <Text style={styles.sliderLimit}>99</Text>
                        </View>
                    </View>
                </View>

                {/* Height Selector */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Height</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                onPress={() => setHeightUnit('metric')}
                                style={[styles.toggleBtn, heightUnit === 'metric' && { backgroundColor: isDark ? colors.muted : '#FFF' }]}
                            >
                                <Text style={[styles.toggleText, heightUnit === 'metric' ? { color: colors.foreground } : { color: colors.mutedForeground }]}>cm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setHeightUnit('imperial')}
                                style={[styles.toggleBtn, heightUnit === 'imperial' && { backgroundColor: isDark ? colors.muted : '#FFF' }]}
                            >
                                <Text style={[styles.toggleText, heightUnit === 'imperial' ? { color: colors.foreground } : { color: colors.mutedForeground }]}>ft</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.valueRow}>
                        <Text style={[styles.valueTextLarge, { color: colors.foreground }]}>{height}</Text>
                        <Text style={[styles.valueUnitLarge, { color: colors.mutedForeground }]}>{heightUnit === 'metric' ? 'cm' : 'ft'}</Text>
                    </View>
                    {/* Slider Placeholder */}
                    <View style={styles.sliderTrackPlaceholder}>
                        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                            <View style={[styles.sliderFill, { backgroundColor: colors.primary.main, width: '60%' }]} />
                        </View>
                        <View style={[styles.sliderThumb, {
                            borderColor: colors.primary.main,
                            backgroundColor: '#FFF',
                            left: '60%',
                            marginLeft: -14
                        }]} />
                    </View>
                </View>

                {/* Weight Selector */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Weight</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                onPress={() => setWeightUnit('metric')}
                                style={[styles.toggleBtn, weightUnit === 'metric' && { backgroundColor: isDark ? colors.muted : '#FFF' }]}
                            >
                                <Text style={[styles.toggleText, weightUnit === 'metric' ? { color: colors.foreground } : { color: colors.mutedForeground }]}>kg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setWeightUnit('imperial')}
                                style={[styles.toggleBtn, weightUnit === 'imperial' && { backgroundColor: isDark ? colors.muted : '#FFF' }]}
                            >
                                <Text style={[styles.toggleText, weightUnit === 'imperial' ? { color: colors.foreground } : { color: colors.mutedForeground }]}>lbs</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.valueRow}>
                        <Text style={[styles.valueTextLarge, { color: colors.foreground }]}>{weight}</Text>
                        <Text style={[styles.valueUnitLarge, { color: colors.mutedForeground }]}>{weightUnit === 'metric' ? 'kg' : 'lbs'}</Text>
                    </View>
                    {/* Slider Placeholder */}
                    <View style={styles.sliderTrackPlaceholder}>
                        <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
                            <View style={[styles.sliderFill, { backgroundColor: colors.primary.main, width: '40%' }]} />
                        </View>
                        <View style={[styles.sliderThumb, {
                            borderColor: colors.primary.main,
                            backgroundColor: '#FFF',
                            left: '40%',
                            marginLeft: -14
                        }]} />
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Action */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <LinearGradient
                    colors={[colors.background + '00', colors.background] as any}
                    style={styles.footerGradient}
                    pointerEvents="none"
                />
                <Button
                    title="Continue"
                    onPress={handleContinue}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    progressContainer: {
        paddingHorizontal: spacing[6],
        marginTop: spacing[2],
    },
    scrollContent: {
        paddingHorizontal: spacing[6],
        paddingTop: spacing[4],
    },
    titleSection: {
        marginBottom: spacing[8],
        alignItems: 'center',
    },
    headline: {
        fontFamily: fonts.display,
        fontSize: fontSize['3xl'],
        lineHeight: 40,
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    subheadline: {
        fontFamily: fonts.body,
        fontSize: fontSize.sm,
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        fontFamily: fonts.display,
        fontSize: fontSize.lg,
        marginBottom: spacing[3],
        marginLeft: spacing[1],
    },
    genderContainer: {
        flexDirection: 'row',
        padding: spacing[1],
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    genderOption: {
        flex: 1,
        height: 48,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    genderActiveBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    genderLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    genderText: {
        fontFamily: fonts.bodySemibold,
        fontSize: fontSize.sm,
    },
    card: {
        borderRadius: borderRadius.lg * 2,
        padding: spacing[6],
        marginBottom: spacing[6],
        borderWidth: 1,
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[6],
    },
    cardTitle: {
        fontFamily: fonts.display,
        fontSize: fontSize.xl,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[1],
    },
    valueText: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize['3xl'],
        letterSpacing: -1,
    },
    valueUnit: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.sm,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: spacing[4],
    },
    valueTextLarge: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize['4xl'],
        letterSpacing: -2,
    },
    valueUnitLarge: {
        fontFamily: fonts.bodyMedium,
        fontSize: fontSize.base,
        marginLeft: spacing[1],
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9', // Default light bg for toggle
        padding: 4,
        borderRadius: borderRadius.full,
    },
    toggleBtn: {
        paddingHorizontal: spacing[3],
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    toggleText: {
        fontFamily: fonts.bodyBold,
        fontSize: fontSize.xs,
        textTransform: 'lowercase',
    },
    sliderContainer: {
        marginTop: spacing[2],
    },
    sliderTrackPlaceholder: {
        height: 28,
        justifyContent: 'center',
        position: 'relative',
    },
    sliderTrack: {
        height: 6,
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
    },
    sliderThumb: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 4,
        ...shadows.sm,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing[2],
    },
    sliderLimit: {
        fontFamily: fonts.bodyBold,
        fontSize: 10,
        color: '#94A3B8',
        textTransform: 'uppercase',
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
