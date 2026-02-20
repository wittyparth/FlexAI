import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useColors } from '../../hooks/useColors';
import { UnitSystem } from '../../types/user';
import { fontFamilies } from '../../theme/typography';

type UnitsScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Units'>;

interface Props {
    navigation: UnitsScreenNavigationProp;
}

export const UnitsScreen: React.FC<Props> = ({ navigation }) => {
    const { mode: theme } = useTheme();
    const colors = useColors();
    const { updatedUser, setUpdatedUser } = useAuthStore();

    // Default to metric if not set
    const [unitSystem, setUnitSystem] = useState<UnitSystem>(updatedUser?.units || 'metric');

    const handleSystemChange = (system: UnitSystem) => {
        setUnitSystem(system);
    };

    const handleContinue = () => {
        setUpdatedUser({ units: unitSystem });
        navigation.navigate('Notification');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.iconButton, { backgroundColor: colors.muted }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>Step 9 of 10</Text>
                        <View style={[styles.miniProgressBarBg, { backgroundColor: colors.muted }]}>
                            <View style={[styles.miniProgressBarFill, { backgroundColor: colors.primary.main, width: '90%' }]} />
                        </View>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.foreground }]}>Preferred Units</Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Choose how you want to measure your progress.
                    </Text>
                </View>

                <View style={styles.toggleContainer}>
                    {/* Weight Toggle */}
                    <View style={styles.toggleGroup}>
                        <Text style={[styles.label, { color: colors.mutedForeground }]}>WEIGHT</Text>
                        <View style={[styles.toggleBackground, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.toggleOption, unitSystem === 'metric' && styles.activeOption]}
                                onPress={() => handleSystemChange('metric')}
                            >
                                {unitSystem === 'metric' && (
                                    <View
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[styles.optionText, { color: unitSystem === 'metric' ? '#fff' : colors.mutedForeground }]}>kg</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleOption, unitSystem === 'imperial' && styles.activeOption]}
                                onPress={() => handleSystemChange('imperial')}
                            >
                                {unitSystem === 'imperial' && (
                                    <View
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[styles.optionText, { color: unitSystem === 'imperial' ? '#fff' : colors.mutedForeground }]}>lbs</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Height Toggle (synced for now) */}
                    <View style={styles.toggleGroup}>
                        <Text style={[styles.label, { color: colors.mutedForeground }]}>HEIGHT & DISTANCE</Text>
                        <View style={[styles.toggleBackground, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.toggleOption, unitSystem === 'metric' && styles.activeOption]}
                                onPress={() => handleSystemChange('metric')}
                            >
                                {unitSystem === 'metric' && (
                                    <View
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[styles.optionText, { color: unitSystem === 'metric' ? '#fff' : colors.mutedForeground }]}>cm / km</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleOption, unitSystem === 'imperial' && styles.activeOption]}
                                onPress={() => handleSystemChange('imperial')}
                            >
                                {unitSystem === 'imperial' && (
                                    <View
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Text style={[styles.optionText, { color: unitSystem === 'imperial' ? '#fff' : colors.mutedForeground }]}>ft / mi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, minHeight: 40 }} />

                {/* Data Preview Card */}
                <View style={styles.previewContainer}>
                    <View style={[styles.previewBadge, { backgroundColor: colors.background, borderColor: `${colors.primary.main}20` }]}>
                        <Text style={[styles.previewBadgeText, { color: colors.primary.main }]}>Data Preview</Text>
                    </View>
                    <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.previewRow}>
                            <View style={styles.previewItem}>
                                <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>WEIGHT</Text>
                                <Text style={[styles.previewValue, { color: colors.foreground }]}>
                                    {unitSystem === 'metric' ? '80.0' : '176.4'}
                                    <Text style={{ fontSize: 14, fontWeight: '400', color: colors.mutedForeground }}> {unitSystem === 'metric' ? 'kg' : 'lbs'}</Text>
                                </Text>
                            </View>
                            <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.previewItem}>
                                <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>HEIGHT</Text>
                                <Text style={[styles.previewValue, { color: colors.foreground }]}>
                                    {unitSystem === 'metric' ? '180' : '5\'11"'}
                                    <Text style={{ fontSize: 14, fontWeight: '400', color: colors.mutedForeground }}> {unitSystem === 'metric' ? 'cm' : ''}</Text>
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.previewFooter, { borderTopColor: colors.border }]}>
                            <View style={[styles.infoIcon, { backgroundColor: colors.primary.main + '20' }]}>
                                <Ionicons name="information" size={16} color={colors.primary.main} />
                            </View>
                            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                                We use these units to calculate your metabolic rate and personalized plans.
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleContinue} style={styles.buttonContainer}>
                    <View
                        style={styles.continueButton}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                    </View>
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
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerCenter: {
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    miniProgressBarBg: {
        height: 4,
        borderRadius: 2,
        width: 96,
        overflow: 'hidden',
    },
    miniProgressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        flexGrow: 1,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: fontFamilies.display,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    toggleContainer: {
        gap: 32,
    },
    toggleGroup: {
        alignItems: 'center',
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    toggleBackground: {
        flexDirection: 'row',
        padding: 6,
        borderRadius: 999,
        borderWidth: 1,
        width: '100%',
        maxWidth: 280,
    },
    toggleOption: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    activeOption: {
        // styles handled by child Views/Gradients mostly
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        zIndex: 1,
    },
    previewContainer: {
        width: '100%',
        maxWidth: 340,
        alignSelf: 'center',
        marginTop: 20,
    },
    previewBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        zIndex: 10,
    },
    previewBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    previewCard: {
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewItem: {
        flex: 1,
        alignItems: 'center',
    },
    previewDivider: {
        width: 1,
        height: 40,
        marginHorizontal: 16,
    },
    previewLabel: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600',
    },
    previewValue: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    previewFooter: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    buttonContainer: {
        shadowColor: '#134dec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
});
