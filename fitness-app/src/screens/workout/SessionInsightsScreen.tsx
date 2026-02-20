import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useWorkout, useWorkouts } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const MUSCLE_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#14B8A6'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const getSetWeight = (setItem: any) => Number(setItem?.weight || 0);
const getSetReps = (setItem: any) => Number(setItem?.reps || 0);

const getWorkoutVolume = (workout: any) => {
    const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
    return exercises.reduce((totalVolume: number, exercise: any) => {
        const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
        const exerciseVolume = sets.reduce((setVolume: number, setItem: any) => {
            return setVolume + (getSetWeight(setItem) * getSetReps(setItem));
        }, 0);
        return totalVolume + exerciseVolume;
    }, 0);
};

const getWorkoutDurationMins = (workout: any) => {
    const start = workout?.startTime ? new Date(workout.startTime) : null;
    const end = workout?.endTime ? new Date(workout.endTime) : null;
    if (!start || !end) return 0;
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000 / 60));
};

const isCompletedWorkout = (workout: any) => workout?.status === 'completed';

const aggregateWeek = (workouts: any[]) => {
    const volume = workouts.reduce((sum: number, workout: any) => sum + getWorkoutVolume(workout), 0);
    const totalDuration = workouts.reduce((sum: number, workout: any) => sum + getWorkoutDurationMins(workout), 0);
    return {
        workouts: workouts.length,
        volume,
        avgDuration: workouts.length > 0 ? Math.round(totalDuration / workouts.length) : 0,
    };
};

const buildMuscleVolume = (workout: any) => {
    const grouped = new Map<string, number>();
    const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

    exercises.forEach((exerciseItem: any) => {
        const muscle = exerciseItem?.exercise?.muscleGroup || 'Other';
        const sets = Array.isArray(exerciseItem?.sets) ? exerciseItem.sets : [];
        const volume = sets.reduce((sum: number, setItem: any) => sum + (getSetWeight(setItem) * getSetReps(setItem)), 0);
        grouped.set(muscle, (grouped.get(muscle) || 0) + volume);
    });

    const totalVolume = Array.from(grouped.values()).reduce((sum, value) => sum + value, 0);
    return Array.from(grouped.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([muscle, volume], index) => ({
            muscle,
            volume,
            percentage: totalVolume > 0 ? Math.max(1, Math.round((volume / totalVolume) * 100)) : 0,
            color: MUSCLE_COLORS[index % MUSCLE_COLORS.length],
        }));
};

const buildPrs = (workout: any, allWorkouts: any[]) => {
    if (!workout) return [];

    const currentStartTime = workout?.startTime ? new Date(workout.startTime).getTime() : Number.MAX_SAFE_INTEGER;
    const historical = allWorkouts.filter((item: any) => {
        if (!isCompletedWorkout(item)) return false;
        if (item?.id === workout?.id) return false;
        if (!item?.startTime) return true;
        return new Date(item.startTime).getTime() < currentStartTime;
    });

    const historicalMaxByExercise = new Map<number, { weight: number; reps: number }>();
    historical.forEach((item: any) => {
        const exercises = Array.isArray(item?.exercises) ? item.exercises : [];
        exercises.forEach((exerciseItem: any) => {
            const exerciseId = Number(exerciseItem?.exerciseId || exerciseItem?.exercise?.id);
            if (!exerciseId) return;
            const sets = Array.isArray(exerciseItem?.sets) ? exerciseItem.sets : [];
            sets.forEach((setItem: any) => {
                const weight = getSetWeight(setItem);
                const reps = getSetReps(setItem);
                const previous = historicalMaxByExercise.get(exerciseId);
                const shouldReplace =
                    !previous ||
                    weight > previous.weight ||
                    (weight === previous.weight && reps > previous.reps);
                if (shouldReplace) {
                    historicalMaxByExercise.set(exerciseId, { weight, reps });
                }
            });
        });
    });

    const prs: { exercise: string; value: string; previous: string }[] = [];
    const currentExercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
    currentExercises.forEach((exerciseItem: any) => {
        const exerciseId = Number(exerciseItem?.exerciseId || exerciseItem?.exercise?.id);
        if (!exerciseId) return;

        const currentBest = { weight: 0, reps: 0 };
        const sets = Array.isArray(exerciseItem?.sets) ? exerciseItem.sets : [];
        sets.forEach((setItem: any) => {
            const weight = getSetWeight(setItem);
            const reps = getSetReps(setItem);
            if (weight > currentBest.weight || (weight === currentBest.weight && reps > currentBest.reps)) {
                currentBest.weight = weight;
                currentBest.reps = reps;
            }
        });

        if (currentBest.weight <= 0) return;
        const historicalBest = historicalMaxByExercise.get(exerciseId);
        const isPr =
            !historicalBest ||
            currentBest.weight > historicalBest.weight ||
            (currentBest.weight === historicalBest.weight && currentBest.reps > historicalBest.reps);
        if (!isPr) return;

        prs.push({
            exercise: exerciseItem?.exercise?.name || 'Exercise',
            value: `${currentBest.weight} lbs x ${currentBest.reps}`,
            previous: historicalBest ? `${historicalBest.weight} lbs x ${historicalBest.reps}` : 'No previous record',
        });
    });

    return prs.slice(0, 2);
};

const getRating = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 45) return 'Fair';
    return 'Needs Work';
};

export function SessionInsightsScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const workoutId = Number(route?.params?.workoutId || 0);

    const range = useMemo(() => {
        const end = new Date();
        const start = startOfDay(addDays(end, -20));
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    }, []);

    const { data: workoutResponse, isLoading: isWorkoutLoading, error: workoutError } = useWorkout(workoutId);
    const { data: workoutsResponse, isLoading: isHistoryLoading } = useWorkouts({
        page: 1,
        limit: 250,
        startDate: range.startDate,
        endDate: range.endDate,
    });

    const workout = workoutResponse?.data;
    const completedWorkouts = useMemo(
        () => (workoutsResponse?.data || []).filter((item: any) => isCompletedWorkout(item)),
        [workoutsResponse],
    );

    const insights = useMemo(() => {
        const today = startOfDay(new Date());
        const thisWeekStart = addDays(today, -6);
        const lastWeekStart = addDays(thisWeekStart, -7);
        const lastWeekEnd = addDays(thisWeekStart, -1);

        const thisWeek = completedWorkouts.filter((item: any) => {
            if (!item?.startTime) return false;
            const day = startOfDay(new Date(item.startTime));
            return day >= thisWeekStart && day <= today;
        });

        const lastWeek = completedWorkouts.filter((item: any) => {
            if (!item?.startTime) return false;
            const day = startOfDay(new Date(item.startTime));
            return day >= lastWeekStart && day <= lastWeekEnd;
        });

        const thisWeekSummary = aggregateWeek(thisWeek);
        const lastWeekSummary = aggregateWeek(lastWeek);

        const volumeDelta = thisWeekSummary.volume - lastWeekSummary.volume;
        const volumeChangePct = lastWeekSummary.volume > 0
            ? Math.round((volumeDelta / lastWeekSummary.volume) * 100)
            : (thisWeekSummary.volume > 0 ? 100 : 0);
        const volumeChange = volumeChangePct > 0 ? `+${volumeChangePct}%` : `${volumeChangePct}%`;

        const intensityTrend = volumeChangePct > 5 ? 'Higher' : (volumeChangePct < -5 ? 'Lower' : 'Steady');
        const consistencyScore = Math.min(100, Math.round((thisWeekSummary.workouts / 4) * 100));
        const rating = getRating(consistencyScore);

        const volumeByMuscle = buildMuscleVolume(workout);
        const prs = buildPrs(workout, completedWorkouts);

        const aiRecommendations = [
            prs.length > 0
                ? {
                    icon: 'trending-up',
                    title: 'Progressive Overload',
                    text: `You set ${prs.length} new PR${prs.length > 1 ? 's' : ''} this session. Keep load progression gradual in your next session.`,
                    color: '#10B981',
                }
                : {
                    icon: 'barbell',
                    title: 'Strength Progression',
                    text: 'No new PR this session. Add a top set and track load and reps week-over-week for progression.',
                    color: '#3B82F6',
                },
            consistencyScore >= 75
                ? {
                    icon: 'calendar',
                    title: 'Consistency',
                    text: `Strong weekly consistency (${thisWeekSummary.workouts} workouts this week). Maintain your current cadence.`,
                    color: '#10B981',
                }
                : {
                    icon: 'calendar',
                    title: 'Consistency',
                    text: `You logged ${thisWeekSummary.workouts} workouts this week. Aim for 4+ sessions to improve consistency.`,
                    color: '#F59E0B',
                },
            thisWeekSummary.avgDuration > 75
                ? {
                    icon: 'timer',
                    title: 'Session Efficiency',
                    text: 'Average session duration is high this week. Keep rest intervals intentional for better session efficiency.',
                    color: '#F59E0B',
                }
                : {
                    icon: 'checkmark-done',
                    title: 'Session Efficiency',
                    text: 'Session duration looks controlled. Keep your pacing and recovery strategy consistent.',
                    color: '#6366F1',
                },
        ];

        return {
            summary: {
                volumeChange,
                intensityTrend,
                consistencyScore,
                rating,
            },
            volumeByMuscle,
            prs,
            aiRecommendations,
            comparison: {
                thisWeek: thisWeekSummary,
                lastWeek: lastWeekSummary,
            },
        };
    }, [completedWorkouts, workout]);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    if (isWorkoutLoading || (isHistoryLoading && !workoutsResponse)) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}> 
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading session insights...</Text>
            </View>
        );
    }

    if (workoutError || !workout) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}> 
                <MaterialCommunityIcons name="alert-circle-outline" size={46} color={colors.mutedForeground} />
                <Text style={[styles.errorTitle, { color: colors.foreground }]}>Insights unavailable</Text>
                <Text style={[styles.errorSubtitle, { color: colors.mutedForeground }]}>Unable to load this workout session.</Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.primary.main }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Session Insights</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.primary.main }]}> 
                        <View style={styles.summaryHeader}>
                            <View style={styles.ratingBadge}>
                                <MaterialCommunityIcons name="star" size={20} color="#FFC107" />
                                <Text style={styles.ratingText}>{insights.summary.rating}</Text>
                            </View>
                            <Text style={styles.consistencyLabel}>Consistency</Text>
                            <Text style={styles.consistencyValue}>{insights.summary.consistencyScore}%</Text>
                        </View>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Volume</Text>
                                <Text style={[styles.summaryStatValue, { color: insights.summary.volumeChange.startsWith('+') ? '#4ADE80' : '#FCA5A5' }]}>
                                    {insights.summary.volumeChange}
                                </Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Intensity</Text>
                                <Text style={styles.summaryStatValue}>{insights.summary.intensityTrend}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {insights.prs.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="trophy" size={22} color={colors.stats.pr} />
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>New Personal Records</Text>
                        </View>
                        <View style={styles.prCards}>
                            {insights.prs.map((pr, i) => (
                                <View key={`${pr.exercise}-${i}`} style={[styles.prCard, { backgroundColor: `${colors.stats.pr}10`, borderColor: `${colors.stats.pr}30` }]}> 
                                    <View style={[styles.prIcon, { backgroundColor: colors.stats.pr }]}>
                                        <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                                    </View>
                                    <Text style={[styles.prExercise, { color: colors.foreground }]}>{pr.exercise}</Text>
                                    <Text style={[styles.prValue, { color: colors.stats.pr }]}>{pr.value}</Text>
                                    <Text style={[styles.prPrevious, { color: colors.mutedForeground }]}>was {pr.previous}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="chart-pie" size={22} color={colors.primary.main} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Volume by Muscle</Text>
                    </View>
                    <View style={[styles.volumeCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                        {insights.volumeByMuscle.length === 0 ? (
                            <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>No volume data available for this workout.</Text>
                        ) : (
                            insights.volumeByMuscle.map((item, i) => (
                                <View key={`${item.muscle}-${i}`} style={styles.volumeRow}>
                                    <View style={styles.volumeInfo}>
                                        <View style={[styles.volumeDot, { backgroundColor: item.color }]} />
                                        <Text style={[styles.volumeMuscle, { color: colors.foreground }]}>{item.muscle}</Text>
                                    </View>
                                    <View style={styles.volumeBar}>
                                        <Animated.View
                                            style={[
                                                styles.volumeFill,
                                                {
                                                    backgroundColor: item.color,
                                                    width: fadeAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0%', `${item.percentage}%`],
                                                    }),
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.volumeValue, { color: colors.foreground }]}> 
                                        {item.volume > 0 ? `${(item.volume / 1000).toFixed(1)}k` : '0'}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="robot-excited" size={22} color={colors.primary.main} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Recommendations</Text>
                    </View>
                    {insights.aiRecommendations.map((rec, i) => (
                        <View key={`${rec.title}-${i}`} style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.recIconContainer, { backgroundColor: `${rec.color}15` }]}>
                                <Ionicons name={rec.icon as any} size={22} color={rec.color} />
                            </View>
                            <View style={styles.recContent}>
                                <Text style={[styles.recTitle, { color: colors.foreground }]}>{rec.title}</Text>
                                <Text style={[styles.recText, { color: colors.mutedForeground }]}>{rec.text}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="compare" size={22} color={colors.mutedForeground} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Week Comparison</Text>
                    </View>
                    <View style={[styles.compCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.mutedForeground }]}></Text>
                            <Text style={[styles.compHeader, { color: colors.primary.main }]}>This Week</Text>
                            <Text style={[styles.compHeader, { color: colors.mutedForeground }]}>Last Week</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Workouts</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{insights.comparison.thisWeek.workouts}</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{insights.comparison.lastWeek.workouts}</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Volume</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{(insights.comparison.thisWeek.volume / 1000).toFixed(0)}k</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{(insights.comparison.lastWeek.volume / 1000).toFixed(0)}k</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Avg Duration</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{insights.comparison.thisWeek.avgDuration}m</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{insights.comparison.lastWeek.avgDuration}m</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 24 },
    loadingText: { fontSize: 14 },
    errorTitle: { fontSize: 18, fontWeight: '700' },
    errorSubtitle: { fontSize: 14, textAlign: 'center' },
    backButton: { marginTop: 12, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
    backButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    summaryCard: { margin: 16, borderRadius: 24, padding: 24, elevation: 8, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, gap: 6 },
    ratingText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    consistencyLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 'auto' },
    consistencyValue: { color: '#FFF', fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    summaryStats: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
    summaryStat: { alignItems: 'center' },
    summaryStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 },
    summaryStatValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
    summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    prCards: { flexDirection: 'row', gap: 12 },
    prCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: 'center' },
    prIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    prExercise: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
    prValue: { fontSize: 16, fontWeight: '800', fontFamily: fontFamilies.mono, marginBottom: 4 },
    prPrevious: { fontSize: 12, textAlign: 'center' },
    volumeCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
    volumeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    emptyStateText: { fontSize: 13 },
    volumeInfo: { flexDirection: 'row', alignItems: 'center', width: 100, gap: 10 },
    volumeDot: { width: 12, height: 12, borderRadius: 6 },
    volumeMuscle: { fontSize: 14, fontWeight: '600' },
    volumeBar: { flex: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, marginHorizontal: 12, overflow: 'hidden' },
    volumeFill: { height: '100%', borderRadius: 6 },
    volumeValue: { width: 50, fontSize: 14, fontWeight: '700', textAlign: 'right', fontFamily: fontFamilies.mono },
    recCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    recIconContainer: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    recContent: { flex: 1 },
    recTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    recText: { fontSize: 14, lineHeight: 20 },
    compCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
    compRow: { flexDirection: 'row', paddingVertical: 8 },
    compLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
    compHeader: { flex: 0.8, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    compValue: { flex: 0.8, fontSize: 16, fontWeight: '700', textAlign: 'center', fontFamily: fontFamilies.mono },
});
