import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationBar, Button } from '../../components/ui';
import { useColors, useCreateRoutine, useAddExerciseToRoutine } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { GOALS } from './AIGeneratorScreen';
import { useWorkoutStore } from '../../store/workoutStore';

export function AIPreviewScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [saving, setSaving] = useState(false);
    const [starting, setStarting] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { workout: generatedWorkout, input } = route.params || {};

    const createRoutineMutation = useCreateRoutine();
    const addExerciseMutation = useAddExerciseToRoutine();

    const totalSets =
        (generatedWorkout?.warmup?.length || 0) +
        (generatedWorkout?.main?.length || 0) +
        (generatedWorkout?.cooldown?.length || 0);

    const exerciseCount = totalSets;

    const displayGoal = input?.goal ? GOALS.find((g: any) => g.id === input.goal)?.label : 'Generated Workout';
    const displayDuration = input?.duration || 60;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const parseReps = (repsValue: string | number) => {
        const value = String(repsValue || '');
        if (value.includes('-')) {
            const [min, max] = value.split('-').map((part) => Number(part.trim()));
            return {
                min: Number.isFinite(min) ? min : 0,
                max: Number.isFinite(max) ? max : 0,
            };
        }

        const asNumber = Number.parseInt(value, 10);
        return {
            min: Number.isFinite(asNumber) ? asNumber : 0,
            max: Number.isFinite(asNumber) ? asNumber : 0,
        };
    };

    const extractGeneratedExercises = () => {
        if (!generatedWorkout) return [];
        const sections = [
            ...(generatedWorkout.warmup || []),
            ...(generatedWorkout.main || []),
            ...(generatedWorkout.cooldown || []),
        ];

        return sections.filter((exerciseItem: any) => {
            const exerciseId = Number(exerciseItem.exerciseId || exerciseItem.exercise?.id);
            return Number.isInteger(exerciseId) && exerciseId > 0;
        });
    };

    const renderExerciseSection = (title: string, exercises: any[], startIndex: number) => {
        if (!Array.isArray(exercises) || exercises.length === 0) return null;

        return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
                {exercises.map((exerciseItem: any, index: number) => {
                    const exercise = exerciseItem.exercise || {};
                    return (
                        <Animated.View
                            key={`${exerciseItem.exerciseId || index}`}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20 + index * 5, 0],
                                    }),
                                }],
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
                                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>
                                        {exercise.name || `Exercise ${exerciseItem.exerciseId}`}
                                    </Text>
                                    <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>
                                        {exercise.targetMuscle || 'General'}
                                    </Text>
                                </View>
                                <View style={styles.exerciseMeta}>
                                    <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                                        <Text style={[styles.metaText, { color: colors.foreground }]}>{exerciseItem.sets}x{exerciseItem.reps}</Text>
                                    </View>
                                    <View style={[styles.restBadge, { backgroundColor: `${colors.success}15` }]}>
                                        <Ionicons name="time-outline" size={12} color={colors.success} />
                                        <Text style={[styles.restText, { color: colors.success }]}>{exerciseItem.rest}s</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
        );
    };

    const handleSave = async () => {
        if (!generatedWorkout || !generatedWorkout.workoutName) {
            Alert.alert('Error', 'No workout data to save');
            return;
        }

        setSaving(true);

        try {
            const goalMapping: Record<string, string> = {
                muscle: 'muscle_gain',
                fat: 'fat_loss',
                strength: 'strength',
                endurance: 'endurance',
                general: 'general',
            };

            const selectedGoal = input?.goal || 'general';
            const backendGoal = goalMapping[selectedGoal] || 'general';

            const routinePayload = {
                name: generatedWorkout.workoutName || 'AI Generated Workout',
                description: generatedWorkout.description || 'Generated by FlexAI',
                difficulty: (input?.experienceLevel || 'intermediate').toLowerCase(),
                goal: backendGoal,
                isPublic: false,
                estimatedDuration: input?.duration || 60,
            };

            const routineResult = await createRoutineMutation.mutateAsync(routinePayload as any);
            const routineId = Number(routineResult?.data?.id);

            const allExercises = extractGeneratedExercises();
            if (allExercises.length === 0) {
                Alert.alert('Unable to save', 'Generated workout has no valid exercises.');
                return;
            }

            let addedCount = 0;
            let failedCount = 0;
            let orderIndex = 0;
            for (const exerciseItem of allExercises) {
                const exerciseId = Number(exerciseItem.exerciseId || exerciseItem.exercise?.id);
                if (!exerciseId) continue;

                const reps = parseReps(exerciseItem.reps);
                try {
                    await addExerciseMutation.mutateAsync({
                        routineId,
                        data: {
                            exerciseId,
                            orderIndex: orderIndex++,
                            targetSets: Number(exerciseItem.sets || 3),
                            targetRepsMin: reps.min,
                            targetRepsMax: reps.max,
                            restSeconds: Number(exerciseItem.rest || 60),
                            notes: exerciseItem.notes || '',
                        },
                    });
                    addedCount += 1;
                } catch {
                    failedCount += 1;
                }
            }

            if (addedCount === 0) {
                Alert.alert('Unable to save', 'No valid exercises could be added to the routine.');
                return;
            }

            if (failedCount > 0) {
                Alert.alert('Saved with warnings', `Routine saved with ${addedCount} exercises. ${failedCount} exercises failed to add.`);
            } else {
                Alert.alert('Saved', 'Workout saved to your routines.');
            }
            navigation.navigate('RoutineDetail', { routineId });
        } catch (error) {
            console.error('Failed to save generated workout:', error);
            Alert.alert('Error', 'Failed to save workout. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleStartWorkout = async () => {
        if (!generatedWorkout || !generatedWorkout.workoutName) {
            Alert.alert('Error', 'No workout data to start');
            return;
        }

        if (starting) return;
        setStarting(true);

        try {
            const exercises = extractGeneratedExercises();
            if (exercises.length === 0) {
                Alert.alert('Unable to start', 'Generated workout has no valid exercises.');
                return;
            }

            const store = useWorkoutStore.getState();
            await store.startWorkout({
                name: generatedWorkout.workoutName || 'AI Generated Workout',
                notes: generatedWorkout.description || undefined,
            });

            let addedCount = 0;
            let failedCount = 0;

            for (const exerciseItem of exercises) {
                const exerciseId = Number(exerciseItem.exerciseId || exerciseItem.exercise?.id);
                if (!exerciseId) {
                    failedCount += 1;
                    continue;
                }

                try {
                    await store.addExercise(exerciseId, exerciseItem.notes || undefined);
                    addedCount += 1;
                } catch {
                    failedCount += 1;
                }
            }

            if (addedCount === 0) {
                await store.cancelWorkout();
                Alert.alert('Unable to start', 'No exercises could be added to this workout.');
                return;
            }

            if (failedCount > 0) {
                Alert.alert('Workout started', `Started with ${addedCount} exercises. ${failedCount} exercises could not be added.`);
            }

            navigation.navigate('ActiveWorkout');
        } catch (error: any) {
            const message = String(error?.message || 'Unable to start workout.');
            if (message.toLowerCase().includes('already have a workout in progress')) {
                Alert.alert(
                    'Workout in progress',
                    'You already have a workout in progress.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Resume', onPress: () => navigation.navigate('ActiveWorkout') },
                    ],
                );
                return;
            }

            Alert.alert('Unable to start workout', message);
        } finally {
            setStarting(false);
        }
    };

    if (!generatedWorkout || !generatedWorkout.workoutName) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <NavigationBar title="AI Preview" onBack={() => navigation.goBack()} />
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={40} color={colors.mutedForeground} />
                    <Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>No generated workout found</Text>
                    <Text style={[styles.emptyStateSubtitle, { color: colors.mutedForeground }]}>Generate a workout first to preview and save it.</Text>
                    <Button title="Generate Workout" variant="primary" onPress={() => navigation.navigate('AIGenerator')} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <NavigationBar
                title="AI Preview"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'refresh', onPress: () => navigation.navigate('AIGenerator', { presetGoal: displayGoal, presetDuration: displayDuration, customPrompt: input?.preferences }), label: 'Refresh' }]}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.aiCard}>
                        <View style={styles.aiBadge}>
                            <MaterialCommunityIcons name="robot-excited" size={20} color={colors.primary.main} />
                            <Text style={[styles.aiBadgeText, { color: colors.primary.main }]}>AI Generated</Text>
                        </View>
                        <Text style={styles.aiTitle}>{generatedWorkout.workoutName}</Text>
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
                                <Text style={styles.aiStatText}>{input?.experienceLevel || 'intermediate'}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

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

                <View style={styles.section}>
                    <View style={[styles.notesCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <View style={styles.notesHeader}>
                            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.primary.main} />
                            <Text style={[styles.notesTitle, { color: colors.primary.main }]}>AI Insights</Text>
                        </View>
                        <Text style={[styles.notesText, { color: colors.foreground }]}>{generatedWorkout.description}</Text>
                    </View>
                </View>

                {renderExerciseSection('Warm Up', generatedWorkout.warmup, 0)}
                {renderExerciseSection('Main Workout', generatedWorkout.main, (generatedWorkout.warmup?.length || 0))}
                {renderExerciseSection('Cool Down', generatedWorkout.cooldown, (generatedWorkout.warmup?.length || 0) + (generatedWorkout.main?.length || 0))}

                <View style={{ height: 180 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}> 
                <TouchableOpacity
                    style={[styles.saveBtn, { borderColor: colors.primary.main }]}
                    onPress={handleSave}
                    disabled={saving || starting}
                >
                    <Ionicons name="bookmark-outline" size={20} color={colors.primary.main} />
                    <Text style={[styles.saveBtnText, { color: colors.primary.main }]}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={handleStartWorkout}
                    disabled={saving || starting}
                    activeOpacity={0.9}
                >
                    <View style={styles.startGradient}>
                        <Ionicons name="play" size={22} color="#FFF" />
                        <Text style={styles.startText}>{starting ? 'Starting...' : 'Start Workout'}</Text>
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

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 10 },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
    emptyStateSubtitle: { fontSize: 14, textAlign: 'center' },
    emptyStateButton: { marginTop: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
    emptyStateButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

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
