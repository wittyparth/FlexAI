import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// OPTIONS
// ============================================================
export const GOALS = [
    { id: 'muscle', label: 'Build Muscle', icon: 'arm-flex', color: '#6366F1' },
    { id: 'strength', label: 'Get Stronger', icon: 'weight-lifter', color: '#EC4899' },
    { id: 'fat', label: 'Lose Fat', icon: 'fire', color: '#EF4444' },
    { id: 'endurance', label: 'Endurance', icon: 'run-fast', color: '#10B981' },
    { id: 'general', label: 'General Fitness', icon: 'heart-pulse', color: '#F59E0B' },
];

const DURATIONS = [
    { value: 30, label: 'Quick', emoji: '⚡' },
    { value: 45, label: 'Standard', emoji: '💪' },
    { value: 60, label: 'Full', emoji: '🔥' },
    { value: 90, label: 'Extended', emoji: '🏆' },
];

const MUSCLE_FOCUS = [
    { id: 'full', label: 'Full Body', icon: 'human' },
    { id: 'upper', label: 'Upper Body', icon: 'human-handsup' },
    { id: 'lower', label: 'Lower Body', icon: 'human-handsdown' },
    { id: 'push', label: 'Push', icon: 'arrow-up-bold' },
    { id: 'pull', label: 'Pull', icon: 'arrow-down-bold' },
    { id: 'core', label: 'Core', icon: 'circle-outline' },
];

const EQUIPMENT = [
    { id: 'full', label: 'Full Gym', icon: 'dumbbell' },
    { id: 'dumbbells', label: 'Dumbbells', icon: 'dumbbell' },
    { id: 'bodyweight', label: 'Bodyweight', icon: 'human' },
    { id: 'minimal', label: 'Minimal', icon: 'home' },
];

export function AIGeneratorScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const { presetGoal, presetDuration, customPrompt: initPrompt } = route.params || {};

    const presetGoalId = presetGoal ? GOALS.find(g => g.label === presetGoal)?.id || 'muscle' : 'muscle';
    
    const [goal, setGoal] = useState(presetGoalId);
    const [duration, setDuration] = useState(presetDuration || 60);
    const [focus, setFocus] = useState('full');
    const [equipment, setEquipment] = useState('full');
    const [customPrompt, setCustomPrompt] = useState(initPrompt || '');

    const [loading, setLoading] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;

    const startLoadingAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
        ).start();
    };

    const stopLoadingAnimation = () => {
        pulseAnim.stopAnimation();
        spinAnim.stopAnimation();
        pulseAnim.setValue(1);
        spinAnim.setValue(0);
    };

    const generate = () => {
        setLoading(true);
        startLoadingAnimation();

        const input = {
            goal,
            duration,
            equipment: [equipment], // Pass as array
            experienceLevel: 'intermediate', // Default for now
            preferences: `Focus area: ${focus}. ${customPrompt}`, // Combine focus and custom prompt
        };

        // Simulate API taking some time then returning dummy elegant data
        setTimeout(() => {
            const selectedGoalLabel = GOALS.find(g => g.id === goal)?.label || 'Workout';
            
            const dummyWorkout = {
                workoutName: `AI ${selectedGoalLabel} Session`,
                goal: input.goal,
                duration: input.duration,
                difficulty: 'Intermediate',
                description: `A highly optimized ${input.duration} min workout focusing on ${focus.toUpperCase()} with ${equipment.toUpperCase()}. ${customPrompt ? 'Tailored to your specific requests.' : ''}`,
                warmup: [
                    { id: 'temp-1', notes: '', reps: '1', rest: 0, sets: 1, exercise: { id: 1, name: 'Jumping Jacks', muscle: 'Full Body' } },
                    { id: 'temp-2', notes: '', reps: '10', rest: 0, sets: 2, exercise: { id: 2, name: 'Arm Circles', muscle: 'Shoulders' } },
                ],
                main: [
                    { id: 'temp-3', notes: '', reps: '8-12', rest: 60, sets: 3, exercise: { id: 3, name: 'Dumbbell Bench Press', muscle: 'Chest' } },
                    { id: 'temp-4', notes: '', reps: '10-15', rest: 60, sets: 3, exercise: { id: 4, name: 'Dumbbell Row', muscle: 'Back' } },
                    { id: 'temp-5', notes: '', reps: '12-15', rest: 60, sets: 3, exercise: { id: 5, name: 'Lateral Raises', muscle: 'Shoulders' } },
                ],
                cooldown: [
                    { id: 'temp-6', notes: '', reps: '30s', rest: 0, sets: 1, exercise: { id: 6, name: 'Childs Pose', muscle: 'Back' } },
                ]
            };

            setLoading(false);
            stopLoadingAnimation();

            navigation.navigate('RoutineEditor', {
                mode: 'create',
                routineData: dummyWorkout
            });
        }, 2000);
    };

    const selectedGoal = GOALS.find(g => g.id === goal);
    const selectedDuration = DURATIONS.find(d => d.value === duration);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    AI Generator
                </Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('AIPrompts')}>
                    <MaterialCommunityIcons name="lightning-bolt" size={22} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 140 }]}>

                {/* Goal Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What's your goal?</Text>
                    <View style={styles.goalGrid}>
                        {GOALS.map((g) => (
                            <TouchableOpacity
                                key={g.id}
                                style={[
                                    styles.goalCard,
                                    { backgroundColor: colors.card, borderColor: goal === g.id ? g.color : colors.border },
                                    goal === g.id && { borderWidth: 2 }
                                ]}
                                onPress={() => setGoal(g.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.goalIcon, { backgroundColor: `${g.color}15` }]}>
                                    <MaterialCommunityIcons name={g.icon as any} size={24} color={g.color} />
                                </View>
                                <Text style={[styles.goalLabel, { color: colors.foreground }]}>{g.label}</Text>
                                {goal === g.id && (
                                    <View style={[styles.goalCheck, { backgroundColor: g.color }]}>
                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Duration Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How long?</Text>
                    <View style={styles.durationRow}>
                        {DURATIONS.map((d) => (
                            <TouchableOpacity
                                key={d.value}
                                style={[
                                    styles.durationCard,
                                    duration === d.value
                                        ? { backgroundColor: colors.primary.main, borderColor: colors.primary.main, borderWidth: 1 }
                                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setDuration(d.value)}
                            >
                                <Text style={[
                                    styles.durationValue,
                                    { color: duration === d.value ? '#FFF' : colors.foreground }
                                ]}>{d.value}</Text>
                                <Text style={[
                                    styles.durationLabel,
                                    { color: duration === d.value ? 'rgba(255,255,255,0.8)' : colors.mutedForeground }
                                ]}>min</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Muscle Focus */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Focus Area</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.focusScroll}>
                        {MUSCLE_FOCUS.map((f) => (
                            <TouchableOpacity
                                key={f.id}
                                style={[
                                    styles.focusChip,
                                    focus === f.id
                                        ? { backgroundColor: colors.primary.main, borderColor: colors.primary.main, borderWidth: 1 }
                                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setFocus(f.id)}
                            >
                                <MaterialCommunityIcons
                                    name={f.icon as any}
                                    size={18}
                                    color={focus === f.id ? '#FFF' : colors.foreground}
                                />
                                <Text style={[
                                    styles.focusLabel,
                                    { color: focus === f.id ? '#FFF' : colors.foreground }
                                ]}>{f.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Equipment */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Equipment</Text>
                    <View style={styles.equipmentGrid}>
                        {EQUIPMENT.map((e) => (
                            <TouchableOpacity
                                key={e.id}
                                style={[
                                    styles.equipmentCard,
                                    equipment === e.id
                                        ? { backgroundColor: colors.primary.main, borderColor: colors.primary.main, borderWidth: 1 }
                                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setEquipment(e.id)}
                            >
                                <MaterialCommunityIcons
                                    name={e.icon as any}
                                    size={22}
                                    color={equipment === e.id ? '#FFF' : colors.foreground}
                                />
                                <Text style={[
                                    styles.equipmentLabel,
                                    { color: equipment === e.id ? '#FFF' : colors.foreground }
                                ]}>{e.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Custom Instructions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Special Instructions</Text>
                    <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textArea, { color: colors.foreground }]}
                            placeholder="e.g. I have a shoulder injury, avoid overhead movements..."
                            placeholderTextColor={colors.mutedForeground}
                            value={customPrompt}
                            onChangeText={setCustomPrompt}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

            </ScrollView>

            {/* Generate Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.generateBtn, { backgroundColor: loading ? colors.muted : colors.primary.main }]}
                    onPress={generate}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    <View style={styles.generateContent}>
                        {loading ? (
                            <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                                <MaterialCommunityIcons name="loading" size={24} color="#FFF" />
                            </Animated.View>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="auto-fix" size={24} color="#FFF" />
                                <Text style={styles.generateText}>Generate My Workout</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={[styles.footerHint, { color: colors.mutedForeground }]}>
                    {selectedGoal?.label} • {selectedDuration?.value} min • {focus.charAt(0).toUpperCase() + focus.slice(1)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    scroll: {
        padding: 16,
    },
    heroCard: {
        borderRadius: 28,
        padding: 28,
        alignItems: 'center',
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    heroIconContainer: {
        marginBottom: 16,
    },
    heroIconRing: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 14,
    },
    goalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    goalCard: {
        width: (width - 44) / 2,
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        alignItems: 'center',
        position: 'relative',
    },
    goalIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    goalLabel: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    goalCheck: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationRow: {
        flexDirection: 'row',
        gap: 12,
    },
    durationCard: {
        flex: 1,
        borderRadius: 18,
        padding: 16,
        alignItems: 'center',
    },
    durationEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    durationValue: {
        fontSize: 24,
        fontWeight: '800',
        fontFamily: fontFamilies.mono,
    },
    durationLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    focusScroll: {
        gap: 10,
    },
    focusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    focusLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    equipmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    equipmentCard: {
        width: (width - 44) / 2,
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    equipmentLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    textAreaContainer: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 4,
    },
    textArea: {
        minHeight: 100,
        padding: 14,
        fontSize: 15,
        lineHeight: 22,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    generateBtn: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    generateContent: {
        flexDirection: 'row',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    generateText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    footerHint: {
        fontSize: 13,
        marginTop: 10,
    },
});
