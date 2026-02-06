import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { RestTimerOverlay } from '../../components/active-workout/RestTimerOverlay';
import { useWorkoutStore } from '../../store/workoutStore';
import { useShallow } from 'zustand/react/shallow';
import { WorkoutExercise, WorkoutSet } from '../../types/backend.types';

const { width, height } = Dimensions.get('window');

// Placeholder images for exercises if none provided
const DEFAULT_EXERCISE_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop';

export function ActiveWorkoutScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // =========================================================================
    // STORE CONNECTION
    // =========================================================================
    const {
        activeWorkoutId,
        workoutName,
        exercisesMap,
        setsMap,
        elapsedSeconds,
        isLoading,
        logSet,
        completeWorkout,
        cancelWorkout,
        tick,
        minimize
    } = useWorkoutStore(useShallow(state => ({
        activeWorkoutId: state.activeWorkoutId,
        workoutName: state.workoutName,
        exercisesMap: state.exercises,
        setsMap: state.sets,
        elapsedSeconds: state.elapsedSeconds,
        isLoading: state.isLoading,
        logSet: state.logSet,
        completeWorkout: state.completeWorkout,
        cancelWorkout: state.cancelWorkout,
        tick: state.tick,
        minimize: state.minimize
    })));

    // Derived State
    const workoutExercises = useMemo(() => {
        return Object.values(exercisesMap).sort((a, b) => a.orderIndex - b.orderIndex);
    }, [exercisesMap]);

    // Group sets by workoutExerciseId
    const setsByExercise = useMemo(() => {
        const grouped: Record<number, WorkoutSet[]> = {};
        Object.values(setsMap).forEach(set => {
            if (!grouped[set.workoutExerciseId]) {
                grouped[set.workoutExerciseId] = [];
            }
            grouped[set.workoutExerciseId].push(set);
        });
        // Sort sets by completedAt or creation time if needed, usually insertion order/ID is okay
        // backend might return them sorted?
        return grouped;
    }, [setsMap]);

    // =========================================================================
    // LOCAL STATE
    // =========================================================================
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restDuration, setRestDuration] = useState(90);
    const [elapsedRest, setElapsedRest] = useState(0);
    const [showExerciseList, setShowExerciseList] = useState(false);

    // Input state
    const [weightInput, setWeightInput] = useState('');
    const [repsInput, setRepsInput] = useState('');
    const [rpeInput, setRpeInput] = useState<number | null>(null);

    // Timer Refs
    const restTimerRef = useRef<NodeJS.Timeout | null>(null);
    const workoutTimerRef = useRef<NodeJS.Timeout | null>(null); // managed by store usually, but let's sync

    // Current exercise data
    const currentExercise = workoutExercises[currentExerciseIndex];
    const nextExercise = workoutExercises[currentExerciseIndex + 1];

    const currentSets = currentExercise ? (setsByExercise[currentExercise.id] || []) : [];
    const currentSetNumber = currentSets.length + 1;

    // Progress
    // We calculate total *target* sets if available, else assume 3 per exercise?
    // Or just simple progress: Exercises Completed / Total Exercises
    const totalSetsTarget = useMemo(() => {
        return workoutExercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0);
    }, [workoutExercises]);

    const totalSetsCompleted = Object.values(setsMap).length;
    const progressPercent = totalSetsTarget > 0 ? (totalSetsCompleted / totalSetsTarget) * 100 : 0;

    // =========================================================================
    // EFFECTS
    // =========================================================================

    // Workout Timer (Global Tick)
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeWorkoutId) tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [activeWorkoutId, tick]);

    // Rest Timer
    useEffect(() => {
        if (isResting) {
            restTimerRef.current = setInterval(() => {
                setElapsedRest(prev => prev + 1);
            }, 1000);
        } else {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
            setElapsedRest(0);
        }
        return () => {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
        };
    }, [isResting]);

    // Pre-fill inputs when Exercise or Set changes
    useEffect(() => {
        if (currentExercise) {
            // Logic: Pre-fill with previous set data OR target data
            // For now, let's pre-fill with TARGET if available
            if (currentSetNumber === 1 && currentExercise.targetWeight) {
                setWeightInput(currentExercise.targetWeight.toString());
            } else if (currentSets.length > 0) {
                // Pre-fill with last performed set of THIS session
                const lastSet = currentSets[currentSets.length - 1];
                setWeightInput(lastSet.weight?.toString() || '');
                setRepsInput(lastSet.reps?.toString() || '');
            } else {
                // Reset if new exercise/no history
                // Maybe pre-fill with target weight/reps if it's the very first set
                setWeightInput(currentExercise.targetWeight?.toString() || '');
            }

            // Set targets for placeholder
            setRestDuration(currentExercise.restSeconds || 90);
        }
    }, [currentExerciseIndex, currentSetNumber]); // Dependency on SetNumber change (log success)

    // =========================================================================
    // HANDLERS
    // =========================================================================

    const handleLogSet = useCallback(async () => {
        if (!currentExercise) return;

        const weight = parseFloat(weightInput) || 0;
        const reps = parseInt(repsInput) || 0;

        if (reps === 0) {
            Alert.alert('Missing Reps', 'Please enter the number of reps performed.');
            return;
        }

        try {
            await logSet(currentExercise.id, {
                weight,
                reps,
                rpe: rpeInput || undefined,
                setType: 'working'
            });

            // Check if we should move to next exercise automatically?
            // If we hit target sets?
            const targetSets = currentExercise.targetSets || 3;
            // Note: currentSets is stale inside callback? No, re-render should update handler if dep array correct
            // Actually, we are using `currentSets` from render scope. 
            // Better to rely on the updated state count in effect/or manually check

            // Start Rest
            if (currentSetNumber >= targetSets) {
                // Maybe auto-advance after rest?
            }
            setIsResting(true);

        } catch (error) {
            Alert.alert('Error', 'Failed to log set');
        }

    }, [weightInput, repsInput, rpeInput, currentExercise, logSet, currentSetNumber]);

    const handleSkipRest = useCallback(() => {
        setIsResting(false);
        const targetSets = currentExercise?.targetSets || 3;

        if (currentSetNumber > targetSets) {
            // If we exceeded target sets, maybe suggest next exercise?
            if (currentExerciseIndex < workoutExercises.length - 1) {
                setCurrentExerciseIndex(prev => prev + 1);
            }
        }
    }, [currentSetNumber, currentExercise, currentExerciseIndex, workoutExercises.length]);

    const handleCompleteWorkout = useCallback(() => {
        Alert.alert(
            'Complete Workout?',
            `You've completed ${totalSetsCompleted} sets. Finish this workout?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    style: 'default',
                    onPress: async () => {
                        await completeWorkout({});
                        navigation.navigate('WorkoutDetail', { workoutId: activeWorkoutId });
                    },
                },
            ]
        );
    }, [totalSetsCompleted, activeWorkoutId, completeWorkout, navigation]);

    const handleCancelWorkout = useCallback(() => {
        Alert.alert(
            'Cancel Workout?',
            'Progress will be lost.',
            [
                { text: 'Back', style: 'cancel' },
                {
                    text: 'End Workout',
                    style: 'destructive',
                    onPress: async () => {
                        await cancelWorkout();
                        navigation.goBack();
                    }
                }
            ]
        );
    }, [cancelWorkout, navigation]);

    const handleJumpToExercise = (index: number) => {
        setCurrentExerciseIndex(index);
        setShowExerciseList(false);
    };

    // =========================================================================
    // HELPERS
    // =========================================================================
    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${mins}:${seconds.toString().padStart(2, '0')}`;
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    // Empty State
    if (!currentExercise) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.foreground, marginBottom: 20 }}>No exercises in this workout.</Text>
                <TouchableOpacity onPress={handleCancelWorkout}>
                    <Text style={{ color: colors.primary.main }}>Cancel Workout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentImage = DEFAULT_EXERCISE_IMAGE; // In real app, currentExercise.exercise.imageUrl

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Background */}
            <View style={StyleSheet.absoluteFill}>
                <Image
                    source={{ uri: currentImage }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', colors.background]}
                    locations={[0, 0.6]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Top Bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.timerBadge} onPress={() => setShowExerciseList(true)}>
                    <View style={styles.timerDot} />
                    <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleCancelWorkout}>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary.main }]} onPress={handleCompleteWorkout}>
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: colors.primary.main,
                                width: `${Math.min(progressPercent, 100)}%`
                            }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {totalSetsCompleted} / {totalSetsTarget} sets
                </Text>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseCounter}>
                        EXERCISE {currentExerciseIndex + 1} OF {workoutExercises.length}
                    </Text>

                    <View style={styles.setTagContainer}>
                        <Text style={[styles.exerciseSetTag, { color: colors.primary.main }]}>
                            SET {currentSetNumber} {currentExercise.targetSets ? `/ ${currentExercise.targetSets}` : ''}
                        </Text>
                        {currentExercise.targetRepsMin && (
                            <Text style={styles.targetReps}>
                                • {currentExercise.targetRepsMin}-{currentExercise.targetRepsMax} reps
                            </Text>
                        )}
                    </View>

                    <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>

                    {currentExercise.notes && (
                        <View style={styles.noteBadge}>
                            <Ionicons name="information-circle" size={14} color={colors.primary.main} />
                            <Text style={[styles.noteText, { color: 'rgba(255,255,255,0.8)' }]}>
                                {currentExercise.notes}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Logged Sets List */}
                <View style={styles.loggedSetsPreview}>
                    {currentSets.map((set, i) => (
                        <View key={set.id} style={styles.loggedSetChip}>
                            <Text style={styles.loggedSetText}>
                                {set.weight}×{set.reps}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Quick Actions (Visual Only for now) */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowExerciseList(true)}>
                        <MaterialCommunityIcons name="format-list-bulleted" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.quickActionText}>LIST</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Input Sheet */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.inputSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
            >
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>LBS</Text>
                        <TextInput
                            style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
                            placeholder={currentExercise.targetWeight?.toString() || "0"}
                            placeholderTextColor={colors.mutedForeground}
                            keyboardType="numeric"
                            value={weightInput}
                            onChangeText={setWeightInput}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>REPS</Text>
                        <TextInput
                            style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
                            placeholder={currentExercise.targetRepsMax?.toString() || "0"}
                            placeholderTextColor={colors.mutedForeground}
                            keyboardType="numeric"
                            value={repsInput}
                            onChangeText={setRepsInput}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>RPE</Text>
                        <TouchableOpacity
                            style={[styles.rpeButton, { backgroundColor: colors.background }]}
                            onPress={() => setRpeInput(curr => (curr === null || curr >= 10) ? 6 : curr + 1)}
                        >
                            <Text style={[styles.rpeText, { color: colors.foreground }]}>
                                {rpeInput ?? '-'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.logButton, { backgroundColor: colors.primary.main }]}
                    activeOpacity={0.8}
                    onPress={handleLogSet}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.logButtonText}>LOG SET</Text>
                            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                        </>
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>

            {/* REST TIMER */}
            <RestTimerOverlay
                isVisible={isResting}
                durationSeconds={restDuration}
                elapsedSeconds={elapsedRest}
                onAddFirst={() => setRestDuration(p => p + 15)}
                onAddSecond={() => setRestDuration(p => p + 30)}
                onSkip={handleSkipRest}
                nextExerciseName={nextExercise?.exercise.name}
                nextReps={nextExercise?.targetRepsMin ? `${nextExercise.targetRepsMin}-${nextExercise.targetRepsMax}` : undefined}
            />

            {/* Exercise List Modal */}
            {showExerciseList && (
                <View style={[StyleSheet.absoluteFill, styles.modalOverlay]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        onPress={() => setShowExerciseList(false)}
                        activeOpacity={1}
                    />
                    <View style={[styles.exerciseListModal, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
                        <Text style={[styles.modalTitle, { color: colors.foreground, marginBottom: 16 }]}>Exercises</Text>
                        <ScrollView>
                            {workoutExercises.map((ex, index) => {
                                const sets = setsByExercise[ex.id] || [];
                                const isCurrent = index === currentExerciseIndex;
                                return (
                                    <TouchableOpacity
                                        key={ex.id}
                                        style={[
                                            styles.exerciseListItem,
                                            { borderColor: isCurrent ? colors.primary.main : colors.border }
                                        ]}
                                        onPress={() => handleJumpToExercise(index)}
                                    >
                                        <Text style={[styles.exerciseListName, { color: colors.foreground }]}>
                                            {index + 1}. {ex.exercise.name}
                                        </Text>
                                        <Text style={{ color: colors.mutedForeground }}>
                                            {sets.length} sets done
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10, alignItems: 'center' },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.error },
    timerText: { color: '#FFFFFF', fontFamily: fontFamilies.mono, fontWeight: '700', fontSize: 16 },
    progressContainer: { paddingHorizontal: 20, marginTop: 16 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 2 },
    progressText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', textAlign: 'center' },
    mainContent: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    exerciseHeader: { gap: 8 },
    exerciseCounter: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
    setTagContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    exerciseSetTag: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    targetReps: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    exerciseName: { fontSize: 28, fontFamily: fontFamilies.display, color: '#FFFFFF', lineHeight: 34, marginTop: 4 },
    noteBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
    noteText: { fontSize: 12, fontWeight: '500' },
    loggedSetsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    loggedSetChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
    loggedSetText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 16 },
    quickActionButton: { alignItems: 'center', gap: 4 },
    quickActionText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    inputSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
    inputRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    inputGroup: { flex: 1, gap: 8 },
    inputLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },
    input: { height: 56, borderRadius: 16, textAlign: 'center', fontSize: 24, fontFamily: fontFamilies.mono, fontWeight: '700' },
    rpeButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    rpeText: { fontSize: 20, fontWeight: '700' },
    logButton: { height: 64, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
    logButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
    modalOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    exerciseListModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', fontFamily: fontFamilies.display },
    exerciseListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
    exerciseListName: { fontSize: 15, fontWeight: '600' },
});
