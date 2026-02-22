import React, { useState, useRef, useEffect } from 'react';
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
import { NavigationBar } from '../../components/ui';
import { useColors } from '../../hooks';
import { useTemplateAIGeneration } from '../../hooks/useAIGeneration';
import type { AITemplateResult } from '../../store/types/ai.types';
import { Alert } from 'react-native';
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

const MUSCLE_FOCUS = [
    { id: 'full', label: 'Full Body', icon: 'human' },
    { id: 'upper', label: 'Upper Body', icon: 'human-handsup' },
    { id: 'lower', label: 'Lower Body', icon: 'human-handsdown' },
    { id: 'push', label: 'Push', icon: 'arrow-up-bold' },
    { id: 'pull', label: 'Pull', icon: 'arrow-down-bold' },
    { id: 'core', label: 'Core', icon: 'circle-outline' },
];

const DURATIONS = [
    { value: 30, label: 'Quick', emoji: '⚡' },
    { value: 45, label: 'Standard', emoji: '💪' },
    { value: 60, label: 'Full', emoji: '🔥' },
    { value: 90, label: 'Extended', emoji: '🏆' },
];

const DAYS_OF_WEEK = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
    { id: 7, label: 'Sun' },
];

const EQUIPMENT = [
    { id: 'full', label: 'Full Gym', icon: 'dumbbell' },
    { id: 'dumbbells', label: 'Dumbbells', icon: 'dumbbell' },
    { id: 'bodyweight', label: 'Bodyweight', icon: 'human' },
    { id: 'minimal', label: 'Minimal', icon: 'home' },
];

export function AITemplateGeneratorScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const { customPrompt: initPrompt } = route.params || {};

    const [goal, setGoal] = useState('muscle');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Default Mon, Wed, Fri
    const [duration, setDuration] = useState(60);
    const [focus, setFocus] = useState('full');
    const [equipment, setEquipment] = useState('full');
    const [customPrompt, setCustomPrompt] = useState(initPrompt || '');

    // ── FSM-backed AI generation ────────────────────────────────────────────────
    const { phase, result, error: genError, generate } = useTemplateAIGeneration();
    const loading = phase === 'generating';

    // When generation reaches 'preview', navigate to TemplateEditor with FSM result
    useEffect(() => {
        if (phase === 'preview' && result) {
            // Map AITemplateResult → TemplateEditor format
            const templateDays = result.days.map((d) => ({
                dayId: d.dayId,
                isRestDay: d.isRestDay,
                routineData: d.isRestDay ? undefined : {
                    id: `ai_gen_${d.dayId}`,
                    name: d.focus ? `${d.focus} Day` : 'Training Day',
                    description: `AI-generated ${duration} min session`,
                    estimatedDuration: duration,
                    exercises: d.exercises.map((e, i) => ({
                        exerciseId: e.exerciseId || 0,
                        orderIndex: i,
                        targetSets: e.sets,
                        targetRepsMin: parseInt(e.reps) || 8,
                        targetRepsMax: parseInt(e.reps.split('-')[1] || e.reps) || 12,
                        restSeconds: parseInt(e.rest) || 60,
                        exercise: { id: e.exerciseId || 0, name: e.exerciseName, muscleGroup: 'General' },
                    })),
                },
            }));
            const mappedTemplate = {
                id: `t_ai_${Date.now()}`,
                name: result.name,
                description: result.description ?? '',
                color: '#6366F1',
                days: templateDays,
            };
            navigation.navigate('TemplateEditor', { templateData: mappedTemplate });
        }
    }, [phase, result, navigation, duration]);

    // Surface FSM error as an Alert
    useEffect(() => {
        if (phase === 'error' && genError) {
            Alert.alert('Generation failed', genError);
        }
    }, [phase, genError]);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const loopRefs = useRef<Animated.CompositeAnimation[]>([]);

    const startLoadingAnimation = () => {
        const l1 = Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]));
        const l2 = Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 2000, useNativeDriver: true }));
        loopRefs.current = [l1, l2];
        l1.start();
        l2.start();
    };

    const stopLoadingAnimation = () => {
        loopRefs.current.forEach((l) => l.stop());
        pulseAnim.setValue(1);
        spinAnim.setValue(0);
    };

    // Sync animation with FSM loading state
    useEffect(() => {
        if (loading) startLoadingAnimation();
        else stopLoadingAnimation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    const generate_template = async () => {
        const selectedGoalLabel = GOALS.find(g => g.id === goal)?.label || 'Workout';
        const prompt = `Goal: ${selectedGoalLabel}, Duration: ${duration}min, Focus: ${focus}, Equipment: ${equipment}, Days: ${selectedDays.length}, Instructions: ${customPrompt}`.trim();

        await generate(prompt, async (_prompt, _signal): Promise<AITemplateResult> => {
            // Build a structured template result from local config
            // (Production: replace with real AI API call)
            await new Promise<void>((resolve) => setTimeout(resolve, 1500));
            const days: AITemplateResult['days'] = Array.from({ length: 7 }, (_, i) => {
                const dayId = i + 1;
                const isTrainingDay = selectedDays.includes(dayId);
                return {
                    dayId,
                    isRestDay: !isTrainingDay,
                    focus: isTrainingDay ? focus.toUpperCase() : undefined,
                    exercises: isTrainingDay ? [
                        { exerciseId: 1, exerciseName: 'Barbell Bench Press', sets: 3, reps: '8-12', rest: '60s' },
                        { exerciseId: 2, exerciseName: 'Dumbbell Row', sets: 3, reps: '10-15', rest: '60s' },
                    ] : [],
                };
            });
            return {
                name: `AI Template: ${selectedGoalLabel} (${focus.toUpperCase()})`,
                description: `Optimised ${duration} min template for ${selectedDays.length} day(s) per week.`,
                durationWeeks: 4,
                days,
            };
        });
    };

    const selectedGoal = GOALS.find(g => g.id === goal);
    const selectedDuration = DURATIONS.find(d => d.value === duration);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar title="Template Generator" onBack={() => navigation.goBack()} />

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

                {/* Duration */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Average Duration</Text>
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

                {/* Equipment */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Equipment</Text>
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

                {/* Which Days */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Workout Days</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.focusScroll}>
                        {DAYS_OF_WEEK.map((d) => {
                            const isSelected = selectedDays.includes(d.id);
                            return (
                                <TouchableOpacity
                                    key={d.id}
                                    style={[
                                        styles.focusChip,
                                        isSelected
                                            ? { backgroundColor: colors.primary.main, borderColor: colors.primary.main, borderWidth: 1 }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                    ]}
                                    onPress={() => {
                                        if (isSelected) {
                                            setSelectedDays(selectedDays.filter(id => id !== d.id));
                                        } else {
                                            setSelectedDays([...selectedDays, d.id].sort());
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.focusLabel,
                                        { color: isSelected ? '#FFF' : colors.foreground }
                                    ]}>{d.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Custom Instructions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Special Instructions</Text>
                    <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textArea, { color: colors.foreground }]}
                            placeholder="e.g. Include supersets, keep rest periods under 60 seconds..."
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
                    onPress={generate_template}
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
                                <Text style={styles.generateText}>Generate Template</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={[styles.footerHint, { color: colors.mutedForeground }]}>
                    {selectedGoal?.label} • {selectedDays.length} Day{selectedDays.length !== 1 ? 's' : ''} • {selectedDuration?.value} min
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    scroll: { padding: 16 },
    heroCard: { borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 24, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    heroIconContainer: { marginBottom: 16 },
    heroIconRing: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    heroSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    goalCard: { width: (width - 44) / 2, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: 'center', position: 'relative' },
    goalIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    goalLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
    goalCheck: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    durationRow: { flexDirection: 'row', gap: 12 },
    durationCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: 'center' },
    durationEmoji: { fontSize: 24, marginBottom: 8 },
    durationValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    durationLabel: { fontSize: 12, marginTop: 2 },
    focusScroll: { gap: 10 },
    focusChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, gap: 8 },
    focusLabel: { fontSize: 14, fontWeight: '600' },
    equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    equipmentCard: { width: (width - 44) / 2, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
    equipmentLabel: { fontSize: 14, fontWeight: '600' },
    textAreaContainer: { borderRadius: 18, borderWidth: 1, padding: 4 },
    textArea: { minHeight: 100, padding: 14, fontSize: 15, lineHeight: 22 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1, alignItems: 'center' },
    generateBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
    generateContent: { flexDirection: 'row', paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 12 },
    generateText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    footerHint: { fontSize: 13, marginTop: 10 },
});
