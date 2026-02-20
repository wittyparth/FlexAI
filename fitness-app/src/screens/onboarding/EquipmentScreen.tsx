import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useColors } from '../../hooks/useColors';

type EquipmentScreenNavigationProp = StackNavigationProp<OnboardingStackParamList, 'Equipment'>;

interface Props {
    navigation: EquipmentScreenNavigationProp;
}

const EQUIPMENT_OPTIONS = [
    { id: 'dumbbells', label: 'Dumbbells', icon: 'barbell-outline' },
    { id: 'barbell', label: 'Barbell', icon: 'remove-outline' }, // closest match
    { id: 'kettlebell', label: 'Kettlebell', icon: 'fitness-outline' },
    { id: 'pull_up_bar', label: 'Pull-up Bar', icon: 'download-outline' }, // closest match
    { id: 'bench', label: 'Bench', icon: 'list-outline' }, // abstract, maybe 'bed' or similar? using list for now or custom
    { id: 'bands', label: 'Bands', icon: 'infinite-outline' },
    { id: 'medicine_ball', label: 'Med Ball', icon: 'basketball-outline' },
    { id: 'none', label: 'None', icon: 'close-circle-outline' },
];

export const EquipmentScreen: React.FC<Props> = ({ navigation }) => {
    const { mode: theme } = useTheme();
    const colors = useColors();
    const { user, updatedUser, setUpdatedUser } = useAuthStore();
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
        updatedUser?.equipmentAvailable || []
    );

    const isFullGym = selectedEquipment.length === EQUIPMENT_OPTIONS.length - 1 && !selectedEquipment.includes('none');

    const toggleEquipment = (id: string) => {
        if (id === 'none') {
            setSelectedEquipment(['none']);
            return;
        }

        let nextSelection = [...selectedEquipment.filter((item) => item !== 'none')];
        if (nextSelection.includes(id)) {
            nextSelection = nextSelection.filter((item) => item !== id);
        } else {
            nextSelection.push(id);
        }
        setSelectedEquipment(nextSelection);
    };

    const toggleFullGym = () => {
        if (isFullGym) {
            setSelectedEquipment([]);
        } else {
            const allEquipment = EQUIPMENT_OPTIONS.filter((item) => item.id !== 'none').map((item) => item.id);
            setSelectedEquipment(allEquipment);
        }
    };

    const handleContinue = () => {
        setUpdatedUser({ equipmentAvailable: selectedEquipment });
        navigation.navigate('Units');
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
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.stepText, { color: colors.mutedForeground }]}>Step 8 of 10</Text>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.muted }]}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressBarFill, { backgroundColor: colors.primary.main, width: '80%' }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.foreground }]}>What equipment do you have?</Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Select all that apply so we can build your perfect workout.
                    </Text>
                </View>

                {/* Master Toggle */}
                <TouchableOpacity
                    onPress={toggleFullGym}
                    style={[
                        styles.masterToggle,
                        {
                            backgroundColor: colors.card,
                            borderColor: isFullGym ? colors.primary.main : colors.border,
                        },
                    ]}
                >
                    <View style={styles.masterToggleContent}>
                        <View style={[styles.masterIconContainer, { backgroundColor: `${colors.primary.main}15` }]}>
                            <Ionicons name="barbell" size={24} color={colors.primary.main} />
                        </View>
                        <View>
                            <Text style={[styles.masterTitle, { color: colors.foreground }]}>Full Gym Access</Text>
                            <Text style={[styles.masterSubtitle, { color: colors.mutedForeground }]}>Includes all equipment</Text>
                        </View>
                    </View>
                    <View
                        style={[
                            styles.switch,
                            { backgroundColor: isFullGym ? colors.primary.main : colors.muted },
                        ]}
                    >
                        <View
                            style={[
                                styles.switchThumb,
                                { transform: [{ translateX: isFullGym ? 20 : 2 }] },
                            ]}
                        />
                    </View>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Equipment Grid */}
                <View style={styles.grid}>
                    {EQUIPMENT_OPTIONS.map((item) => {
                        const isSelected = selectedEquipment.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleEquipment(item.id)}
                                style={[
                                    styles.card,
                                    isSelected
                                        ? { backgroundColor: colors.primary.main, borderColor: 'transparent' }
                                        : {
                                            backgroundColor: colors.card,
                                            borderColor: colors.border,
                                        },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.cardIconContainer,
                                        {
                                            backgroundColor: isSelected
                                                ? 'rgba(255,255,255,0.2)'
                                                : colors.muted,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color={isSelected ? '#ffffff' : colors.mutedForeground}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.cardLabel,
                                        { color: isSelected ? '#ffffff' : colors.foreground },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: 'transparent',
                    },
                ]}
            >
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, opacity: 0.9 }]} />
                <TouchableOpacity onPress={handleContinue}>
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
        marginBottom: 24,
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
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    textContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    masterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    masterToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    masterIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    masterTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    masterSubtitle: {
        fontSize: 12,
    },
    switch: {
        width: 48,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 2,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
    },
    checkIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        shadowColor: '#134dec',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
});
