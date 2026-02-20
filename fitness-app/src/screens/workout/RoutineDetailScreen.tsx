import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useRoutine } from '../../hooks';
import { useWorkoutStore } from '../../store/workoutStore';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { Routine } from '../../types/backend.types';

const { width } = Dimensions.get('window');

// Extended Mock Data for "Usage" stats which isn't in backend type yet
const MOCK_STATS = {
    usageCount: 24,
    lastPerformed: '2 days ago'
};

export function RoutineDetailScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { routineId, isPublic } = route.params || { routineId: 0 };

    const { data: routineData, isLoading, error } = useRoutine(routineId);
    // Cast to expected type, ensuring we handle the response structure
    const routine = routineData?.data as Routine;

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error || !routine) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.foreground }}>Failed to load routine details.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary.main }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const exercises = routine.exercises || [];
    const exerciseCount = exercises.length;

    // Derived state
    const isSingleSession = !routine.daysPerWeek || routine.daysPerWeek === 1;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Top Navigation - Transparent/Blurred feel */}
            <View style={[
                styles.topBar,
                {
                    paddingTop: insets.top + 12,
                    backgroundColor: colors.background + 'E6', // 90% opacity
                }
            ]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.foreground} />
                </TouchableOpacity>

                <View style={styles.topBarActions}>
                    {!isPublic && (
                        <TouchableOpacity
                            style={[styles.circleButton, { backgroundColor: 'transparent' }]}
                            onPress={() => navigation.navigate('RoutineEditor', { routineId: routine.id, mode: 'edit' })}
                        >
                            <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
            >
                {/* Header Content */}
                <View style={styles.headerSection}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: colors.primary.main + '1A', borderColor: colors.primary.main + '33' }]}>
                            <Text style={[styles.badgeText, { color: colors.primary.main }]}>
                                {isSingleSession ? 'SINGLE SESSION' : `${routine.daysPerWeek} DAY SPLIT`}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.title, { color: colors.foreground }]}>
                        {routine.name}
                    </Text>

                    {routine.description ? (
                        <Text style={[styles.description, { color: colors.mutedForeground }]}>
                            {routine.description}
                        </Text>
                    ) : (
                        <Text style={[styles.description, { color: colors.mutedForeground }]}>
                            Focus on compound movements to build raw strength and muscle density.
                        </Text>
                    )}
                </View>

                {/* Stats Row */}
                <View style={styles.statsGrid}>
                    {/* Stat 1: Total Work */}
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.statHeader}>
                            <MaterialCommunityIcons name="dumbbell" size={18} color={colors.mutedForeground} />
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>TOTAL WORK</Text>
                        </View>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{exerciseCount} Exercises</Text>
                    </View>

                    {/* Stat 2: Usage */}
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.statHeader}>
                            <MaterialCommunityIcons name="history" size={18} color={colors.mutedForeground} />
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>USAGE</Text>
                        </View>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{MOCK_STATS.usageCount} Times</Text>
                    </View>
                </View>

                {/* Exercise List Header */}
                <View style={styles.listHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Routine</Text>
                    <Text style={[styles.durationText, { color: colors.mutedForeground }]}>
                        Est. {routine.estimatedDuration || 60} mins
                    </Text>
                </View>

                {/* Exercise List */}
                <View style={styles.exerciseList}>
                    {exercises.map((exerciseItem: any, index: number) => {
                        const exercise = exerciseItem.exercise || exerciseItem;
                        const sets = exerciseItem.targetSets || exerciseItem.sets || 3;
                        const reps = exerciseItem.targetReps || exerciseItem.reps || '8-12';
                        // Default muscle groups if missing
                        const primaryMuscle = exercise.muscleGroup || 'Full Body';
                        const type = exercise.exerciseType || 'Strength';

                        return (
                            <TouchableOpacity
                                key={exercise.id + '-' + index}
                                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.95}
                                onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })}
                            >
                                {/* Left Column: Number & Icon */}
                                <View style={styles.exerciseLeftCol}>
                                    <Text style={[styles.indexText, { color: colors.mutedForeground }]}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </Text>
                                    <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
                                        <MaterialCommunityIcons
                                            name={getIconForMuscle(primaryMuscle)}
                                            size={24}
                                            color={colors.mutedForeground}
                                        />
                                    </View>
                                </View>

                                {/* Right Content */}
                                <View style={styles.exerciseContent}>
                                    <View style={styles.exerciseHeader}>
                                        <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                                            {exercise.name}
                                        </Text>
                                        <MaterialCommunityIcons name="drag-horizontal" size={20} color={colors.border} />
                                    </View>

                                    {/* Tags */}
                                    <View style={styles.tagsRow}>
                                        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{primaryMuscle}</Text>
                                        </View>
                                        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{type}</Text>
                                        </View>
                                    </View>

                                    {/* Stats (Sets/Reps) */}
                                    <View style={styles.exerciseStatsRow}>
                                        <View style={[styles.statPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <MaterialCommunityIcons name="replay" size={14} color={colors.primary.main} />
                                            <Text style={[styles.statPillText, { color: colors.foreground }]}>{sets} Sets</Text>
                                        </View>
                                        <View style={[styles.statPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <MaterialCommunityIcons name="pound" size={14} color={colors.primary.main} />
                                            <Text style={[styles.statPillText, { color: colors.foreground }]}>{reps} Reps</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Sticky Footer CTA */}
            <View style={styles.footerContainer}>
                {/* Gradient Fade */}
                <LinearGradient
                    colors={[
                        colors.background + '00', // Transparent
                        colors.background // Solid background color
                    ]}
                    style={styles.gradientOverlay}
                    pointerEvents="none"
                />

                <View style={styles.footerContent}>
                    <TouchableOpacity
                        style={[styles.startButton, {
                            backgroundColor: colors.primary.main,
                            shadowColor: colors.primary.main
                        }]}
                        activeOpacity={0.9}
                        onPress={() => {
                            // Use mock workout mode for demo (no backend needed)
                            // Build exercises from routine data
                            const exercises = routine.exercises?.map((item: any, i: number) => {
                                const ex = item.exercise || item;
                                return {
                                    id: item.id || i + 1,
                                    orderIndex: i,
                                    targetSets: item.targetSets || 3,
                                    targetRepsMin: item.targetRepsMin || 8,
                                    targetRepsMax: item.targetRepsMax || 12,
                                    targetWeight: item.targetWeight || 0,
                                    restSeconds: item.restSeconds || 90,
                                    notes: item.notes,
                                    exercise: {
                                        id: ex.id || i + 1,
                                        name: ex.name || 'Exercise',
                                        muscleGroup: ex.muscleGroup || 'Full Body',
                                        exerciseType: ex.exerciseType || 'Strength',
                                    }
                                };
                            });
                            useWorkoutStore.getState().startMockWorkout(routine.name, exercises);
                            navigation.navigate('ActiveWorkout');
                        }}
                    >
                        <MaterialCommunityIcons name="play-circle-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.startButtonText}>START SESSION</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// Helper to get icon
function getIconForMuscle(muscle: string): keyof typeof MaterialCommunityIcons.glyphMap {
    const lower = muscle.toLowerCase();
    if (lower.includes('chest')) return 'human-male-height-variant'; // Approx
    if (lower.includes('leg') || lower.includes('quad') || lower.includes('glute')) return 'human-male-height'; // Approx
    if (lower.includes('warmup') || lower.includes('cardio')) return 'run';
    if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) return 'arm-flex';
    if (lower.includes('back')) return 'rowing';
    return 'dumbbell';
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        zIndex: 10,
        position: 'absolute', // Sticky header feel
        top: 0,
        left: 0,
        right: 0,
    },
    topBarActions: {
        flexDirection: 'row',
        gap: 8,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent', // Overridden in render
    },
    scrollContent: {
        paddingTop: 80, // Space for header
    },
    headerSection: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        fontFamily: fontFamilies.mono,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 36, // ~text-4xl
        lineHeight: 40,
        fontFamily: fontFamilies.display,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        maxWidth: '90%',
    },
    statsGrid: {
        paddingHorizontal: 24,
        marginBottom: 32,
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 4,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    listHeader: {
        paddingHorizontal: 24,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fontFamilies.display,
    },
    durationText: {
        fontSize: 12,
        fontWeight: '500',
    },
    exerciseList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    exerciseCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    exerciseLeftCol: {
        alignItems: 'center',
        gap: 8,
        paddingTop: 4,
    },
    indexText: {
        fontSize: 12,
        fontFamily: fontFamilies.mono,
        fontWeight: '700',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseContent: {
        flex: 1,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    exerciseStatsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statPillText: {
        fontSize: 12,
        fontFamily: fontFamilies.mono,
        fontWeight: '700',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
    },
    gradientOverlay: {
        height: 128, // ~h-32
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerContent: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Safe area
    },
    startButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
