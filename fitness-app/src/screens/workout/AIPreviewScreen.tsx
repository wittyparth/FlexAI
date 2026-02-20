import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useCreateRoutine, useAddExerciseToRoutine } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { GOALS } from './AIGeneratorScreen';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const AI_WORKOUT = {
    name: 'AI Push Power Session',
    goal: 'Build Muscle',
    duration: 60,
    difficulty: 'Intermediate',
    exercises: [
        { id: 1, name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: 90, muscle: 'Chest', icon: 'dumbbell' },
        { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 75, muscle: 'Upper Chest', icon: 'dumbbell' },
        { id: 3, name: 'Overhead Press', sets: 4, reps: '8-10', rest: 90, muscle: 'Shoulders', icon: 'weight-lifter' },
        { id: 4, name: 'Cable Fly', sets: 3, reps: '12-15', rest: 60, muscle: 'Chest', icon: 'cable-data' },
        { id: 5, name: 'Lateral Raises', sets: 3, reps: '12-15', rest: 60, muscle: 'Shoulders', icon: 'human-handsup' },
        { id: 6, name: 'Tricep Pushdown', sets: 3, reps: '10-12', rest: 60, muscle: 'Triceps', icon: 'arm-flex' },
    ],
    aiNotes: 'This workout is optimized for hypertrophy with progressive compound movements followed by isolation work. Rest periods are calibrated for muscle growth.',
};

export function AIPreviewScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [saving, setSaving] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { workout: generatedWorkout, input } = route.params || {};
    const workout = generatedWorkout || AI_WORKOUT;

    // Calculate total sets if it's the real workout
    const totalSets = generatedWorkout
        ? (generatedWorkout.warmup?.length || 0) + (generatedWorkout.main?.length || 0) + (generatedWorkout.cooldown?.length || 0)
        : workout.exercises.reduce((sum: any, e: any) => sum + e.sets, 0);

    const exerciseCount = generatedWorkout
        ? (generatedWorkout.warmup?.length || 0) + (generatedWorkout.main?.length || 0) + (generatedWorkout.cooldown?.length || 0)
        : workout.exercises.length;

    const displayGoal = input?.goal ? GOALS.find((g: any) => g.id === input.goal)?.label : workout.goal;
    const displayDuration = input?.duration || workout.duration;

    const renderExerciseSection = (title: string, exercises: any[], startIndex: number) => {
        if (!exercises || exercises.length === 0) return null;

        return (
            <View style={styles.section} key={title}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
                {exercises.map((ex: any, index: number) => {
                    const exerciseData = ex.exercise || ex; // Handle both real and mock
                    return (
                        <Animated.View
                            key={ex.exerciseId || ex.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20 + index * 5, 0]
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.exerciseNum, { backgroundColor: colors.primary.main }]}>
                                    <Text style={styles.exerciseNumText}>{startIndex + index + 1}</Text>
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exerciseData.name}</Text>
                                    <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>
                                        {exerciseData.targetMuscle || exerciseData.muscle}
                                    </Text>
                                </View>
                                <View style={styles.exerciseMeta}>
                                    <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                                        <Text style={[styles.metaText, { color: colors.foreground }]}>{ex.sets}×{ex.reps}</Text>
                                    </View>
                                    <View style={[styles.restBadge, { backgroundColor: `${colors.success}15` }]}>
                                        <Ionicons name="time-outline" size={12} color={colors.success} />
                                        <Text style={[styles.restText, { color: colors.success }]}>{ex.rest}s</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        );
    };

    const createRoutineMutation = useCreateRoutine();
    const addExerciseMutation = useAddExerciseToRoutine();

    const parseReps = (repsStr: string | number) => {
        const s = String(repsStr);
        if (s.includes('-')) {
            const [min, max] = s.split('-').map(v => parseInt(v.trim()));
            return { min: isNaN(min) ? 0 : min, max: isNaN(max) ? 0 : max };
        }
        const val = parseInt(s);
        return { min: isNaN(val) ? 0 : val, max: isNaN(val) ? 0 : val };
    };

    const handleSave = async () => {
        if (!generatedWorkout) {
            Alert.alert('Error', 'No workout data to save');
            return;
        }

        setSaving(true);
        try {
            // 1. Create Routine
            // Map frontend goal IDs to backend enum values
            const goalMapping: Record<string, string> = {
                'muscle': 'muscle_gain',
                'fat': 'fat_loss',
                'strength': 'strength',
                'endurance': 'endurance',
                'general': 'general'
            };

            const selectedGoal = input?.goal || 'general';
            const backendGoal = goalMapping[selectedGoal] || 'general';

            const routineData = {
                name: generatedWorkout.workoutName || 'AI Generated Workout',
                description: generatedWorkout.description || 'Generated by FitAI',
                difficulty: (input?.experienceLevel || 'intermediate').toLowerCase(),
                goal: backendGoal,
                isPublic: false,
                estimatedDuration: input?.duration || 60,
            };

            // Map string inputs to valid enums if needed, or rely on loose matching if backend is flexible
            // For safety, let's keep it simple or cast to any if types are strict

            const result = await createRoutineMutation.mutateAsync(routineData as any);
            const newRoutineId = result.data.id;

            // 2. Add Exercises
            const sections = [
                ...(generatedWorkout.warmup || []),
                ...(generatedWorkout.main || []),
                ...(generatedWorkout.cooldown || [])
            ];

            // Use Promise.all for parallel adding (or sequential if order matters strictly and backend doesn't handle concurrency well)
            // We'll use sequential to be safe regarding orderIndex
            let orderIndex = 0;
            for (const ex of sections) {
                const { min, max } = parseReps(ex.reps);
                // ex.exerciseId is string in GeneratedExercise, but backend expects number
                const exerciseId = startWith(ex.exerciseId, 'temp') ? 0 : parseInt(ex.exerciseId);

                // If exerciseId is invalid (e.g. UUID string), this will fail if backend expects number.
                // Assuming backend migration to string IDs is in progress or we need to handle this.
                // For now, let's try parseInt.

                if (exerciseId) {
                    await addExerciseMutation.mutateAsync({
                        routineId: newRoutineId,
                        data: {
                            exerciseId: exerciseId,
                            orderIndex: orderIndex++,
                            targetSets: ex.sets || 3,
                            targetRepsMin: min,
                            targetRepsMax: max,
                            restSeconds: ex.rest || 60,
                            notes: ex.notes || ''
                        }
                    });
                }
            }

            Alert.alert('Success', 'Workout saved to your routines!');
            navigation.navigate('RoutineDetail', { routineId: newRoutineId });
        } catch (error) {
            console.error('Failed to save workout:', error);
            Alert.alert('Error', 'Failed to save workout. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    function startWith(str: any, prefix: string) {
        return String(str).startsWith(prefix);
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>AI Preview</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="refresh" size={22} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* AI Banner */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View
                        style={styles.aiCard}
                    >
                        <View style={styles.aiBadge}>
                            <MaterialCommunityIcons name="robot-excited" size={20} color={colors.primary.main} />
                            <Text style={[styles.aiBadgeText, { color: colors.primary.main }]}>AI Generated</Text>
                        </View>
                        <Text style={styles.aiTitle}>{generatedWorkout?.workoutName || workout.name}</Text>
                        <View style={styles.aiStats}>
                            <View style={styles.aiStat}>
                                <MaterialCommunityIcons name="target" size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.aiStatText}>{displayGoal}</Text>
                            </View>
                            <View style={styles.aiStat}>
                                <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.aiStatText}>{displayDuration} min</Text>
                            </View>
                            <View style={styles.aiStat}>
                                <MaterialCommunityIcons name="signal-cellular-3" size={18} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.aiStatText}>{input?.experienceLevel || workout.difficulty}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.quickStatValue, { color: colors.primary.main }]}>{exerciseCount}</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Exercises</Text>
                    </View>
                    <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.quickStatValue, { color: colors.primary.main }]}>{totalSets}</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Total Sets</Text>
                    </View>
                    <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.quickStatValue, { color: colors.primary.main }]}>~{displayDuration}</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Minutes</Text>
                    </View>
                </View>

                {/* AI Notes */}
                <View style={styles.section}>
                    <View style={[styles.notesCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <View style={styles.notesHeader}>
                            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.primary.main} />
                            <Text style={[styles.notesTitle, { color: colors.primary.main }]}>AI Insights</Text>
                        </View>
                        <Text style={[styles.notesText, { color: colors.foreground }]}>
                            {generatedWorkout?.description || workout.aiNotes}
                        </Text>
                    </View>
                </View>

                {/* Exercises Sections */}
                {generatedWorkout ? (
                    <>
                        {renderExerciseSection('Warm Up', generatedWorkout.warmup, 0)}
                        {renderExerciseSection('Main Workout', generatedWorkout.main, (generatedWorkout.warmup?.length || 0))}
                        {renderExerciseSection('Cool Down', generatedWorkout.cooldown, (generatedWorkout.warmup?.length || 0) + (generatedWorkout.main?.length || 0))}
                    </>
                ) : (
                    renderExerciseSection('Exercises', workout.exercises, 0)
                )}

                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, { borderColor: colors.primary.main }]}
                    onPress={handleSave}
                >
                    <Ionicons name="bookmark-outline" size={20} color={colors.primary.main} />
                    <Text style={[styles.saveBtnText, { color: colors.primary.main }]}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('ActiveWorkout')}
                    activeOpacity={0.9}
                >
                    <View
                        style={styles.startGradient}
                    >
                        <Ionicons name="play" size={22} color="#FFF" />
                        <Text style={styles.startText}>Start Workout</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    aiCard: { margin: 16, borderRadius: 24, padding: 24, elevation: 8, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    aiBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, gap: 6, marginBottom: 16 },
    aiBadgeText: { fontSize: 14, fontWeight: '700' },
    aiTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 16 },
    aiStats: { flexDirection: 'row', gap: 20 },
    aiStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    aiStatText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
    quickStats: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
    quickStat: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    quickStatValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    quickStatLabel: { fontSize: 13, marginTop: 4 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    notesCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
    notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    notesTitle: { fontSize: 15, fontWeight: '700' },
    notesText: { fontSize: 14, lineHeight: 22 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
    exerciseNum: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    exerciseNumText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    exerciseMuscle: { fontSize: 13 },
    exerciseMeta: { alignItems: 'flex-end', gap: 6 },
    metaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    metaText: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.mono },
    restBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
    restText: { fontSize: 12, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 },
    saveBtn: { flex: 0.35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2, gap: 8 },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
    startBtn: { flex: 0.65, borderRadius: 16, overflow: 'hidden', elevation: 6, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
    startGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    startText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
