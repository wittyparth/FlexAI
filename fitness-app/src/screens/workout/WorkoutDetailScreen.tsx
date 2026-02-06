import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useWorkout, useDeleteWorkout } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Workout, WorkoutExercise, WorkoutSet, Exercise } from '../../types/backend.types';

// ============================================================================
// MOCK DATA (Matches Backend Response Structure Exactly)
// ============================================================================
const MOCK_WORKOUTS: Workout[] = [
    {
        id: 1,
        userId: 1,
        name: 'Push Day - Chest & Triceps',
        notes: 'Felt strong today! Increased bench press by 5lbs.',
        startTime: '2026-02-03T08:30:00.000Z',
        endTime: '2026-02-03T09:45:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 101,
                workoutId: 1,
                exerciseId: 1,
                orderIndex: 0,
                notes: 'Warm up properly before heavy sets',
                exercise: {
                    id: 1,
                    name: 'Barbell Bench Press',
                    muscleGroup: 'Chest',
                    equipment: 'Barbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '1001', workoutExerciseId: 101, weight: 95, reps: 12, rpe: 5, setType: 'warmup', completedAt: '2026-02-03T08:35:00.000Z' },
                    { id: '1002', workoutExerciseId: 101, weight: 135, reps: 10, rpe: 6, setType: 'warmup', completedAt: '2026-02-03T08:38:00.000Z' },
                    { id: '1003', workoutExerciseId: 101, weight: 185, reps: 8, rpe: 7, setType: 'working', completedAt: '2026-02-03T08:42:00.000Z' },
                    { id: '1004', workoutExerciseId: 101, weight: 205, reps: 6, rpe: 8, setType: 'working', completedAt: '2026-02-03T08:47:00.000Z' },
                    { id: '1005', workoutExerciseId: 101, weight: 225, reps: 4, rpe: 9, setType: 'working', completedAt: '2026-02-03T08:52:00.000Z' },
                ],
            },
            {
                id: 102,
                workoutId: 1,
                exerciseId: 2,
                orderIndex: 1,
                exercise: {
                    id: 2,
                    name: 'Incline Dumbbell Press',
                    muscleGroup: 'Chest',
                    equipment: 'Dumbbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '1006', workoutExerciseId: 102, weight: 60, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:00:00.000Z' },
                    { id: '1007', workoutExerciseId: 102, weight: 65, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:05:00.000Z' },
                    { id: '1008', workoutExerciseId: 102, weight: 65, reps: 7, rpe: 9, setType: 'working', completedAt: '2026-02-03T09:10:00.000Z' },
                ],
            },
            {
                id: 103,
                workoutId: 1,
                exerciseId: 3,
                orderIndex: 2,
                exercise: {
                    id: 3,
                    name: 'Cable Flyes',
                    muscleGroup: 'Chest',
                    equipment: 'Cable',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '1009', workoutExerciseId: 103, weight: 30, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:18:00.000Z' },
                    { id: '1010', workoutExerciseId: 103, weight: 30, reps: 12, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:22:00.000Z' },
                    { id: '1011', workoutExerciseId: 103, weight: 30, reps: 10, rpe: 9, setType: 'failure', completedAt: '2026-02-03T09:26:00.000Z' },
                ],
            },
            {
                id: 104,
                workoutId: 1,
                exerciseId: 4,
                orderIndex: 3,
                exercise: {
                    id: 4,
                    name: 'Tricep Rope Pushdown',
                    muscleGroup: 'Triceps',
                    equipment: 'Cable',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '1012', workoutExerciseId: 104, weight: 40, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-03T09:32:00.000Z' },
                    { id: '1013', workoutExerciseId: 104, weight: 45, reps: 10, rpe: 8, setType: 'working', completedAt: '2026-02-03T09:36:00.000Z' },
                    { id: '1014', workoutExerciseId: 104, weight: 45, reps: 8, rpe: 9, setType: 'working', completedAt: '2026-02-03T09:40:00.000Z' },
                ],
            },
        ],
    },
    {
        id: 2,
        userId: 1,
        name: 'Pull Day - Back & Biceps',
        notes: 'Lower back felt tight, took extra rest between deadlift sets.',
        startTime: '2026-02-02T17:00:00.000Z',
        endTime: '2026-02-02T18:20:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 201,
                workoutId: 2,
                exerciseId: 5,
                orderIndex: 0,
                exercise: {
                    id: 5,
                    name: 'Deadlift',
                    muscleGroup: 'Back',
                    equipment: 'Barbell',
                    difficulty: 'advanced',
                },
                sets: [
                    { id: '2001', workoutExerciseId: 201, weight: 135, reps: 10, rpe: 5, setType: 'warmup', completedAt: '2026-02-02T17:05:00.000Z' },
                    { id: '2002', workoutExerciseId: 201, weight: 225, reps: 5, rpe: 6, setType: 'warmup', completedAt: '2026-02-02T17:10:00.000Z' },
                    { id: '2003', workoutExerciseId: 201, weight: 315, reps: 5, rpe: 7, setType: 'working', completedAt: '2026-02-02T17:18:00.000Z' },
                    { id: '2004', workoutExerciseId: 201, weight: 365, reps: 3, rpe: 8, setType: 'working', completedAt: '2026-02-02T17:26:00.000Z' },
                    { id: '2005', workoutExerciseId: 201, weight: 405, reps: 1, rpe: 10, setType: 'working', completedAt: '2026-02-02T17:35:00.000Z' },
                ],
            },
            {
                id: 202,
                workoutId: 2,
                exerciseId: 6,
                orderIndex: 1,
                exercise: {
                    id: 6,
                    name: 'Pull-ups',
                    muscleGroup: 'Back',
                    equipment: 'Bodyweight',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '2006', workoutExerciseId: 202, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-02T17:45:00.000Z' },
                    { id: '2007', workoutExerciseId: 202, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-02T17:50:00.000Z' },
                    { id: '2008', workoutExerciseId: 202, reps: 6, rpe: 9, setType: 'failure', completedAt: '2026-02-02T17:55:00.000Z' },
                ],
            },
            {
                id: 203,
                workoutId: 2,
                exerciseId: 7,
                orderIndex: 2,
                exercise: {
                    id: 7,
                    name: 'Barbell Curl',
                    muscleGroup: 'Biceps',
                    equipment: 'Barbell',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '2009', workoutExerciseId: 203, weight: 65, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-02T18:05:00.000Z' },
                    { id: '2010', workoutExerciseId: 203, weight: 75, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-02T18:10:00.000Z' },
                    { id: '2011', workoutExerciseId: 203, weight: 75, reps: 6, rpe: 9, setType: 'working', completedAt: '2026-02-02T18:15:00.000Z' },
                ],
            },
        ],
    },
    {
        id: 3,
        userId: 1,
        name: 'Leg Day',
        startTime: '2026-02-01T10:00:00.000Z',
        endTime: '2026-02-01T11:30:00.000Z',
        status: 'completed',
        exercises: [
            {
                id: 301,
                workoutId: 3,
                exerciseId: 8,
                orderIndex: 0,
                exercise: {
                    id: 8,
                    name: 'Barbell Squat',
                    muscleGroup: 'Quadriceps',
                    equipment: 'Barbell',
                    difficulty: 'advanced',
                },
                sets: [
                    { id: '3001', workoutExerciseId: 301, weight: 135, reps: 10, rpe: 5, setType: 'warmup', completedAt: '2026-02-01T10:08:00.000Z' },
                    { id: '3002', workoutExerciseId: 301, weight: 185, reps: 8, rpe: 6, setType: 'warmup', completedAt: '2026-02-01T10:14:00.000Z' },
                    { id: '3003', workoutExerciseId: 301, weight: 225, reps: 6, rpe: 7, setType: 'working', completedAt: '2026-02-01T10:22:00.000Z' },
                    { id: '3004', workoutExerciseId: 301, weight: 275, reps: 5, rpe: 8, setType: 'working', completedAt: '2026-02-01T10:30:00.000Z' },
                    { id: '3005', workoutExerciseId: 301, weight: 315, reps: 3, rpe: 9, setType: 'working', completedAt: '2026-02-01T10:40:00.000Z' },
                ],
            },
            {
                id: 302,
                workoutId: 3,
                exerciseId: 9,
                orderIndex: 1,
                exercise: {
                    id: 9,
                    name: 'Romanian Deadlift',
                    muscleGroup: 'Hamstrings',
                    equipment: 'Barbell',
                    difficulty: 'intermediate',
                },
                sets: [
                    { id: '3006', workoutExerciseId: 302, weight: 185, reps: 10, rpe: 7, setType: 'working', completedAt: '2026-02-01T10:55:00.000Z' },
                    { id: '3007', workoutExerciseId: 302, weight: 205, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:02:00.000Z' },
                    { id: '3008', workoutExerciseId: 302, weight: 205, reps: 8, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:09:00.000Z' },
                ],
            },
            {
                id: 303,
                workoutId: 3,
                exerciseId: 10,
                orderIndex: 2,
                exercise: {
                    id: 10,
                    name: 'Leg Press',
                    muscleGroup: 'Quadriceps',
                    equipment: 'Machine',
                    difficulty: 'beginner',
                },
                sets: [
                    { id: '3009', workoutExerciseId: 303, weight: 360, reps: 12, rpe: 7, setType: 'working', completedAt: '2026-02-01T11:18:00.000Z' },
                    { id: '3010', workoutExerciseId: 303, weight: 400, reps: 10, rpe: 8, setType: 'working', completedAt: '2026-02-01T11:24:00.000Z' },
                    { id: '3011', workoutExerciseId: 303, weight: 400, reps: 8, rpe: 9, setType: 'failure', completedAt: '2026-02-01T11:30:00.000Z' },
                ],
            },
        ],
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
interface WorkoutStats {
    totalVolume: number;
    durationMins: number;
    exerciseCount: number;
    setCount: number;
    topSet: { weight: number; reps: number; exerciseName: string } | null;
}

function calculateWorkoutStats(workout: Workout): WorkoutStats {
    let totalVolume = 0;
    let setCount = 0;
    let topSet: { weight: number; reps: number; exerciseName: string } | null = null;

    workout.exercises?.forEach((we: WorkoutExercise) => {
        we.sets?.forEach((set: WorkoutSet) => {
            if (set.weight && set.reps) {
                const setVolume = set.weight * set.reps;
                totalVolume += setVolume;

                if (!topSet || (set.weight > topSet.weight)) {
                    topSet = {
                        weight: set.weight,
                        reps: set.reps,
                        exerciseName: we.exercise?.name || 'Unknown',
                    };
                }
            }
            setCount++;
        });
    });

    let durationMins = 0;
    if (workout.startTime && workout.endTime) {
        const start = new Date(workout.startTime).getTime();
        const end = new Date(workout.endTime).getTime();
        durationMins = Math.round((end - start) / 1000 / 60);
    }

    return {
        totalVolume,
        durationMins,
        exerciseCount: workout.exercises?.length || 0,
        setCount,
        topSet,
    };
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function getIconForMuscle(muscle: string): keyof typeof MaterialCommunityIcons.glyphMap {
    const lower = muscle.toLowerCase();
    if (lower.includes('chest')) return 'human-male-height-variant';
    if (lower.includes('back') || lower.includes('lat')) return 'rowing';
    if (lower.includes('shoulder') || lower.includes('delt')) return 'human-handsup';
    if (lower.includes('leg') || lower.includes('quad') || lower.includes('glute') || lower.includes('hamstring')) return 'human-male-height';
    if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) return 'arm-flex';
    if (lower.includes('core') || lower.includes('ab')) return 'yoga';
    if (lower.includes('cardio')) return 'run';
    return 'dumbbell';
}

function getSetTypeLabel(setType: string): string {
    switch (setType) {
        case 'warmup': return 'W';
        case 'working': return '';
        case 'drop': return 'D';
        case 'failure': return 'F';
        case 'amrap': return 'A';
        default: return '';
    }
}

// ============================================================================
// COMPONENT
// ============================================================================
export function WorkoutDetailScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { workoutId } = route.params || { workoutId: 1 };

    const { data: workoutResponse, isLoading, error } = useWorkout(workoutId);
    const deleteWorkout = useDeleteWorkout();

    const workout = workoutResponse?.data;
    const stats = workout ? calculateWorkoutStats(workout) : null;

    const handleShare = async () => {
        if (!workout || !stats) return;

        try {
            const message = `🏋️ Just completed "${workout.name}"!\n\n` +
                `📊 Stats:\n` +
                `• ${stats.exerciseCount} exercises\n` +
                `• ${stats.setCount} sets\n` +
                `• ${stats.totalVolume.toLocaleString()} lbs volume\n` +
                `• ${stats.durationMins} minutes\n\n` +
                `#FitAI #Workout #Fitness`;

            await Share.share({ message });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteWorkout.mutate(workoutId, {
                            onSuccess: () => {
                                navigation.goBack();
                            },
                        });
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                    Loading workout...
                </Text>
            </View>
        );
    }

    if (error || !workout) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                    Workout Not Found
                </Text>
                <Text style={[styles.errorSubtitle, { color: colors.mutedForeground }]}>
                    Unable to load workout details.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.errorButton, { backgroundColor: colors.primary.main }]}
                >
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isCompleted = workout.status === 'completed';
    const statusColor = isCompleted ? colors.success : colors.warning;
    const statusLabel = isCompleted ? 'COMPLETED' : workout.status?.toUpperCase() || 'IN PROGRESS';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Navigation */}
            <View
                style={[
                    styles.topBar,
                    {
                        paddingTop: insets.top + 12,
                        backgroundColor: colors.background + 'E6',
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.foreground} />
                </TouchableOpacity>

                <View style={styles.topBarActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                        <Ionicons name="share-outline" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    {/* Status Badge */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '40' }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.foreground }]}>
                        {workout.name || 'Workout Session'}
                    </Text>

                    {/* Date & Time */}
                    <View style={styles.dateTimeRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.dateTimeText, { color: colors.mutedForeground }]}>
                            {formatDate(workout.startTime)} • {formatTime(workout.startTime)}
                        </Text>
                    </View>

                    {/* Notes */}
                    {workout.notes && (
                        <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="document-text-outline" size={16} color={colors.mutedForeground} />
                            <Text style={[styles.notesText, { color: colors.foreground }]}>
                                {workout.notes}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Stats Grid */}
                {stats && (
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {stats.durationMins}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>mins</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {stats.exerciseCount}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>exercises</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="replay" size={20} color={colors.primary.main} />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {stats.setCount}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>sets</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="weight" size={20} color={colors.primary.main} />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {stats.totalVolume >= 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>lbs</Text>
                        </View>
                    </View>
                )}

                {/* Top Set Highlight */}
                {stats?.topSet && (
                    <View style={[styles.topSetCard, { backgroundColor: colors.primary.main + '15', borderColor: colors.primary.main + '30' }]}>
                        <MaterialCommunityIcons name="trophy-outline" size={20} color={colors.primary.main} />
                        <View style={styles.topSetContent}>
                            <Text style={[styles.topSetLabel, { color: colors.primary.main }]}>TOP SET</Text>
                            <Text style={[styles.topSetValue, { color: colors.foreground }]}>
                                {stats.topSet.exerciseName}: {stats.topSet.weight}lbs × {stats.topSet.reps}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Exercise List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Exercises</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                        {workout.exercises?.length || 0} total
                    </Text>
                </View>

                {/* Exercise List */}
                <View style={styles.exerciseList}>
                    {workout.exercises?.map((workoutExercise: WorkoutExercise, index: number) => {
                        const exercise = workoutExercise.exercise;
                        const sets = workoutExercise.sets || [];

                        return (
                            <View
                                key={workoutExercise.id}
                                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                {/* Exercise Header */}
                                <View style={styles.exerciseHeader}>
                                    <View style={styles.exerciseLeft}>
                                        <View style={[styles.indexBadge, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.indexText, { color: colors.mutedForeground }]}>
                                                {(index + 1).toString().padStart(2, '0')}
                                            </Text>
                                        </View>
                                        <View style={[styles.iconBox, { backgroundColor: colors.primary.main + '15' }]}>
                                            <MaterialCommunityIcons
                                                name={getIconForMuscle(exercise?.muscleGroup || '')}
                                                size={20}
                                                color={colors.primary.main}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                                            {exercise?.name || 'Unknown Exercise'}
                                        </Text>
                                        {exercise?.muscleGroup && (
                                            <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>
                                                {exercise.muscleGroup} • {exercise.equipment}
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise?.id })}
                                        style={styles.exerciseAction}
                                    >
                                        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>

                                {/* Sets Table */}
                                {sets.length > 0 && (
                                    <View style={styles.setsContainer}>
                                        <View style={[styles.setsHeader, { borderBottomColor: colors.border }]}>
                                            <Text style={[styles.setHeaderText, { color: colors.mutedForeground, width: 40 }]}>SET</Text>
                                            <Text style={[styles.setHeaderText, { color: colors.mutedForeground, flex: 1 }]}>WEIGHT</Text>
                                            <Text style={[styles.setHeaderText, { color: colors.mutedForeground, flex: 1 }]}>REPS</Text>
                                            <Text style={[styles.setHeaderText, { color: colors.mutedForeground, width: 50 }]}>RPE</Text>
                                        </View>

                                        {sets.map((set: WorkoutSet, setIndex: number) => {
                                            const typeLabel = getSetTypeLabel(set.setType);
                                            return (
                                                <View
                                                    key={set.id}
                                                    style={[
                                                        styles.setRow,
                                                        setIndex !== sets.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                                    ]}
                                                >
                                                    <View style={{ width: 40, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Text style={[styles.setNumber, { color: colors.mutedForeground }]}>
                                                            {setIndex + 1}
                                                        </Text>
                                                        {typeLabel !== '' && (
                                                            <Text style={[styles.setType, { color: colors.primary.main }]}>{typeLabel}</Text>
                                                        )}
                                                    </View>
                                                    <Text style={[styles.setValue, { color: colors.foreground, flex: 1 }]}>
                                                        {set.weight ? `${set.weight} lbs` : '—'}
                                                    </Text>
                                                    <Text style={[styles.setValue, { color: colors.foreground, flex: 1 }]}>
                                                        {set.reps || '—'}
                                                    </Text>
                                                    <Text style={[styles.setValue, { color: colors.foreground, width: 50 }]}>
                                                        {set.rpe || '—'}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Exercise Notes */}
                                {workoutExercise.notes && (
                                    <View style={[styles.exerciseNotes, { backgroundColor: colors.muted }]}>
                                        <Text style={[styles.exerciseNotesText, { color: colors.mutedForeground }]}>
                                            {workoutExercise.notes}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* View Insights CTA */}
                <TouchableOpacity
                    style={[styles.insightsCta, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('SessionInsights', { workoutId: workout.id })}
                >
                    <MaterialCommunityIcons name="chart-line" size={22} color={colors.primary.main} />
                    <View style={styles.insightsCtaContent}>
                        <Text style={[styles.insightsCtaTitle, { color: colors.foreground }]}>
                            View Session Insights
                        </Text>
                        <Text style={[styles.insightsCtaSubtitle, { color: colors.mutedForeground }]}>
                            Performance analysis & recommendations
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    errorSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    errorButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    errorButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    topBarActions: {
        flexDirection: 'row',
        gap: 4,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 100,
    },
    headerSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
        marginBottom: 8,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateTimeText: {
        fontSize: 13,
    },
    notesCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    notesText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    topSetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    topSetContent: {
        flex: 1,
    },
    topSetLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    topSetValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
    },
    sectionSubtitle: {
        fontSize: 13,
    },
    exerciseList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    exerciseCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    exerciseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    indexBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
    },
    exerciseMuscle: {
        fontSize: 12,
        marginTop: 2,
    },
    exerciseAction: {
        padding: 4,
    },
    setsContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(150,150,150,0.1)',
    },
    setsHeader: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    setHeaderText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    setNumber: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: fontFamilies.mono,
    },
    setType: {
        fontSize: 10,
        fontWeight: '700',
    },
    setValue: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: fontFamilies.mono,
    },
    exerciseNotes: {
        margin: 12,
        marginTop: 0,
        padding: 10,
        borderRadius: 8,
    },
    exerciseNotesText: {
        fontSize: 12,
        lineHeight: 16,
    },
    insightsCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    insightsCtaContent: {
        flex: 1,
    },
    insightsCtaTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    insightsCtaSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
