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
import { Workout, WorkoutExercise, WorkoutSet } from '../../types/backend.types';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';

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

function buildWorkoutMuscleSets(workout: Workout): Record<string, number> {
    const distribution: Record<string, number> = {};

    workout.exercises?.forEach((workoutExercise: WorkoutExercise) => {
        const primary = workoutExercise.exercise?.muscleGroup;
        if (!primary) return;

        const performedSets = (workoutExercise.sets || []).length;
        const targetSets = Number(workoutExercise.targetSets || 0);
        const baseScore = Math.max(1, performedSets, targetSets);

        distribution[primary] = (distribution[primary] ?? 0) + baseScore;

        const secondary = workoutExercise.exercise?.secondaryMuscleGroups || [];
        secondary.forEach((muscle) => {
            distribution[muscle] = (distribution[muscle] ?? 0) + baseScore * 0.5;
        });
    });

    return distribution;
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
    const workoutMuscleSets = workout ? buildWorkoutMuscleSets(workout) : {};

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

                <View style={styles.muscleMapSection}>
                    <MuscleHighlighterCard
                        title="Muscles Stimulated"
                        subtitle="Estimated from the completed set count for this workout."
                        muscleSets={workoutMuscleSets}
                        compact
                    />
                </View>

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
    muscleMapSection: {
        marginHorizontal: 16,
        marginBottom: 24,
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

