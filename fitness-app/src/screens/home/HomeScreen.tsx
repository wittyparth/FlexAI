import React, { useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
    useAchievements,
    useColors,
    useCurrentWorkout,
    useDashboardStats,
    useGamificationStats,
    useRoutines,
    useUserQueries,
    useWorkouts,
} from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';

type ActiveWorkoutBannerData = {
    id: number;
    name: string;
    startedAt: string;
    exercisesDone: number;
    totalExercises: number;
};

type PlannedWorkoutData = {
    routineId: number;
    routineName: string;
    estimatedDuration: number;
    exercises: Array<{
        id: number;
        name: string;
        muscle: string;
        sets: number;
        reps: string;
    }>;
};

type RecentWorkoutRowData = {
    id: string;
    iconName: string;
    name: string;
    date: string;
    duration: number;
    volume: number;
    hasPR: boolean;
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const fmtVol = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v)));
const fmtDuration = (secs: number) => `${Math.floor(secs / 60)}m`;

const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const buildHeatmapData = (workouts: any[]) => {
    const byDate = new Map<string, number>();

    workouts.forEach((workout) => {
        const completedDateRaw = workout?.endTime ?? workout?.completedAt ?? workout?.startTime;
        if (!completedDateRaw) return;

        const date = new Date(completedDateRaw);
        if (Number.isNaN(date.getTime())) return;

        const key = formatDateKey(date);
        const volume = Number(workout?.totalVolume ?? 0);
        byDate.set(key, (byDate.get(key) ?? 0) + volume);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: { date: string; intensity: 0 | 1 | 2 | 3 }[] = [];

    for (let i = 364; i >= 0; i -= 1) {
        const day = addDays(today, -i);
        const key = formatDateKey(day);
        const volume = byDate.get(key) ?? 0;

        let intensity: 0 | 1 | 2 | 3 = 0;
        if (volume > 0 && volume <= 3000) intensity = 1;
        if (volume > 3000 && volume <= 7000) intensity = 2;
        if (volume > 7000) intensity = 3;

        data.push({ date: key, intensity });
    }

    return data;
};

function ActiveWorkoutBanner({ workout, onPress }: { workout: ActiveWorkoutBannerData; onPress: () => void }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, [pulseAnim]);

    const elapsed = Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 60000);
    const pct = workout.totalExercises > 0 ? (workout.exercisesDone / workout.totalExercises) * 100 : 0;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.activeBannerWrapper}>
            <View style={styles.activeBannerGradient}>
                <View style={styles.activeBannerRow}>
                    <View style={styles.activeBannerLeft}>
                        <View style={styles.activeDotRow}>
                            <Animated.View style={[styles.activeDotPing, { transform: [{ scale: pulseAnim }] }]} />
                            <View style={styles.activeDotCore} />
                            <Text style={styles.activeLabel}>ACTIVE WORKOUT</Text>
                        </View>
                        <Text style={styles.activeName}>{workout.name}</Text>
                        <Text style={styles.activeMeta}>{elapsed} min - {workout.exercisesDone}/{workout.totalExercises} exercises</Text>
                    </View>
                    <View style={styles.activeResumeBtn}>
                        <Ionicons name="play" size={20} color="#FFF" />
                    </View>
                </View>
                <View style={styles.activeProgressBg}>
                    <View style={[styles.activeProgressFill, { width: `${pct}%` }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

function TodaysPlanCard({ plan, onPress, c }: { plan: PlannedWorkoutData; onPress: () => void; c: any }) {
    const MUSCLE_COLORS: Record<string, string> = {
        Chest: '#3B82F6', Shoulders: '#8B5CF6', Triceps: '#10B981',
        Back: '#F59E0B', Biceps: '#EC4899', Legs: '#EF4444', Core: '#14B8A6',
    };

    return (
        <TouchableOpacity style={[styles.todayCard, { backgroundColor: c.card, borderColor: c.border }]} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.todayHeader}>
                <View style={styles.todayHeaderLeft}>
                    <View style={[styles.todayIconBg, { backgroundColor: c.primary + '15' }]}>
                        <MaterialCommunityIcons name="calendar-check" size={18} color={c.primary} />
                    </View>
                    <View style={{ gap: 2 }}>
                        <Text style={[styles.todayTitle, { color: c.text }]}>{plan.routineName}</Text>
                        <Text style={[styles.todayMeta, { color: c.muted }]}>{plan.exercises.length} exercises - ~{plan.estimatedDuration} min</Text>
                    </View>
                </View>
                <View style={styles.startTodayBtn}>
                    <Ionicons name="play" size={12} color="#FFF" />
                    <Text style={styles.startTodayBtnText}>Start</Text>
                </View>
            </View>
            <View style={styles.todayExerciseList}>
                {plan.exercises.slice(0, 4).map((ex) => (
                    <View key={ex.id} style={styles.todayExRow}>
                        <View style={[styles.todayExDot, { backgroundColor: MUSCLE_COLORS[ex.muscle] || c.primary }]} />
                        <Text style={[styles.todayExName, { color: c.text }]}>{ex.name}</Text>
                        <Text style={[styles.todayExSets, { color: c.muted, fontFamily: fontFamilies.mono }]}>{ex.sets} x {ex.reps}</Text>
                    </View>
                ))}
                {plan.exercises.length > 4 && (
                    <Text style={[styles.todayMoreText, { color: c.muted }]}>+{plan.exercises.length - 4} more exercises</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

function MetricCard({ icon, label, value, unit, accent, bg, borderColor }: {
    icon: string; label: string; value: string; unit?: string; accent: string; bg: string; borderColor: string;
}) {
    return (
        <View style={[styles.metricCard, { backgroundColor: bg, borderColor, borderWidth: 1 }]}>
            <View style={[styles.metricIconBg, { backgroundColor: accent + '15' }]}>
                <MaterialCommunityIcons name={icon as any} size={20} color={accent} />
            </View>
            <Text style={[styles.metricLabel, { color: accent + 'BB' }]}>{label}</Text>
            <View style={styles.metricValRow}>
                <Text style={[styles.metricVal, { color: accent }]}>{value}</Text>
                {unit && <Text style={[styles.metricUnit, { color: accent + '80' }]}>{unit}</Text>}
            </View>
        </View>
    );
}

function WorkoutRow({ workout, onPress, c }: { workout: RecentWorkoutRowData; onPress: () => void; c: any }) {
    return (
        <TouchableOpacity style={[styles.wkRow, { backgroundColor: c.card, borderColor: c.border }]} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.wkIcon, { backgroundColor: c.primary + '12' }]}>
                <MaterialCommunityIcons name={workout.iconName as any} size={22} color={c.primary} />
            </View>
            <View style={styles.wkInfo}>
                <Text style={[styles.wkName, { color: c.text }]}>{workout.name}</Text>
                <Text style={[styles.wkDate, { color: c.muted }]}>{workout.date} - {fmtDuration(workout.duration || 0)}</Text>
            </View>
            <View style={styles.wkRight}>
                <Text style={[styles.wkVol, { color: c.text, fontFamily: fontFamilies.mono }]}>{fmtVol(workout.volume)}</Text>
                <Text style={[styles.wkVolUnit, { color: c.muted }]}>kg</Text>
                {workout.hasPR && (
                    <View style={styles.prBadge}>
                        <Text style={styles.prText}>PR</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();

    const { profileQuery } = useUserQueries();
    const { data: dashboardStats } = useDashboardStats();
    const { data: gamificationStats } = useGamificationStats();
    const { data: achievements = [] } = useAchievements();
    const { data: currentWorkoutResponse } = useCurrentWorkout();
    const { data: completedWorkoutsResponse } = useWorkouts({ page: 1, limit: 500, status: 'completed' });
    const { data: routinesResponse } = useRoutines({ page: 1, limit: 1 });

    const firstName = profileQuery.data?.firstName || 'Athlete';
    const currentStreak = gamificationStats?.currentStreak ?? dashboardStats?.streak?.current ?? 0;
    const longestStreak = gamificationStats?.longestStreak ?? dashboardStats?.streak?.best ?? 0;
    const weeklyVolume = dashboardStats?.weeklyVolume ?? 0;
    const level = gamificationStats?.level ?? 1;
    const unlockedAchievementCount = achievements.filter((achievement) => achievement.unlocked || achievement.unlockedAt).length;

    const completedWorkouts = (completedWorkoutsResponse?.data ?? []) as any[];

    const activeWorkout = useMemo<ActiveWorkoutBannerData | null>(() => {
        const workout = currentWorkoutResponse?.data;
        if (!workout || workout.status !== 'in_progress') return null;

        return {
            id: workout.id,
            name: workout.name || 'Active Workout',
            startedAt: workout.startTime,
            exercisesDone: (workout.exercises || []).filter((exercise: any) => (exercise.sets || []).length > 0).length,
            totalExercises: (workout.exercises || []).length,
        };
    }, [currentWorkoutResponse?.data]);

    const todaysPlan = useMemo<PlannedWorkoutData | null>(() => {
        const routine = routinesResponse?.data?.routines?.[0];
        if (!routine) return null;

        const exercises = (routine.exercises ?? []).slice(0, 6).map((routineExercise: any, index: number) => ({
            id: routineExercise.exerciseId ?? routineExercise.id ?? index,
            name: routineExercise.exercise?.name ?? `Exercise ${index + 1}`,
            muscle: routineExercise.exercise?.muscleGroup ?? 'Full Body',
            sets: Number(routineExercise.targetSets ?? 3),
            reps: routineExercise.targetRepsMax
                ? `${routineExercise.targetRepsMin ?? 8}-${routineExercise.targetRepsMax}`
                : `${routineExercise.targetRepsMin ?? 10}`,
        }));

        return {
            routineId: routine.id,
            routineName: routine.name || 'Today Plan',
            estimatedDuration: Number(routine.estimatedDuration ?? 45),
            exercises,
        };
    }, [routinesResponse?.data?.routines]);

    const heatmapData = useMemo(() => buildHeatmapData(completedWorkouts), [completedWorkouts]);

    const recentWorkouts = useMemo<RecentWorkoutRowData[]>(() => {
        const toIcon = (muscleGroup?: string) => {
            const group = (muscleGroup ?? '').toLowerCase();
            if (group.includes('leg') || group.includes('quad') || group.includes('hamstring') || group.includes('glute')) return 'run-fast';
            if (group.includes('core') || group.includes('abs')) return 'human-male';
            if (group.includes('chest') || group.includes('back') || group.includes('shoulder') || group.includes('arm')) return 'dumbbell';
            return 'weight-lifter';
        };

        return completedWorkouts.slice(0, 8).map((workout: any) => {
            const startTime = workout?.startTime ? new Date(workout.startTime) : null;
            const endTime = workout?.endTime ? new Date(workout.endTime) : null;
            const duration =
                startTime && endTime && !Number.isNaN(startTime.getTime()) && !Number.isNaN(endTime.getTime())
                    ? Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000))
                    : 0;

            const completedAt = new Date(workout?.endTime ?? workout?.completedAt ?? workout?.startTime);
            const dateLabel = Number.isNaN(completedAt.getTime()) ? 'Unknown date' : completedAt.toLocaleDateString();
            const firstMuscle = workout?.exercises?.[0]?.exercise?.muscleGroup;

            return {
                id: String(workout.id),
                iconName: toIcon(firstMuscle),
                name: workout.name || 'Workout',
                date: dateLabel,
                duration,
                volume: Number(workout?.totalVolume ?? 0),
                hasPR: Number(workout?.personalRecordsBroken ?? 0) > 0,
            };
        });
    }, [completedWorkouts]);

    const c = {
        bg: colors.background,
        card: colors.card,
        border: colors.border,
        text: colors.foreground,
        muted: colors.mutedForeground,
        primary: colors.primary.main,
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const getTabNav = () => navigation.getParent() ?? navigation;
    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;

    const openDrawer = () => {
        try {
            getDrawerNav().openDrawer();
        } catch {
            // no-op
        }
    };

    const goToWorkout = () => getTabNav().navigate('WorkoutTab');
    const goToAnalytics = (screen = 'AnalyticsHub') => getDrawerNav().navigate('Analytics', { screen });

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={openDrawer}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="menu" size={22} color={colors.foreground} />
                        </TouchableOpacity>
                        <View style={styles.headerTextCol}>
                            <Text style={[styles.headerSub, { color: c.muted }]}>DASHBOARD</Text>
                            <Text style={[styles.headerTitle, { color: c.text, fontFamily: fontFamilies.display }]}> 
                                {getGreeting()},{'\n'}{firstName}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.streakBadge}>
                            <Ionicons name="flame" size={16} color={colors.warning} />
                            <Text style={[styles.streakNum, { color: colors.warning, fontFamily: fontFamilies.mono }]}>{currentStreak}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('HomeNotifications')}
                        >
                            <Ionicons name="notifications-outline" size={20} color={c.text} />
                            <View style={[styles.notifDot, { backgroundColor: colors.destructive, borderColor: c.bg }]} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    {activeWorkout && (
                        <View style={styles.px}>
                            <ActiveWorkoutBanner
                                workout={activeWorkout}
                                onPress={() => {
                                    getTabNav().navigate('WorkoutTab', {
                                        screen: 'ActiveWorkout',
                                        params: { workoutId: activeWorkout.id },
                                    });
                                }}
                            />
                        </View>
                    )}

                    {!activeWorkout && (
                        <View style={styles.px}>
                            <TouchableOpacity onPress={goToWorkout} activeOpacity={0.92} style={styles.ctaWrapper}>
                                <View style={styles.ctaGrad}>
                                    <View style={styles.ctaContent}>
                                        <View>
                                            <Text style={styles.ctaLabel}>READY TO TRAIN?</Text>
                                            <Text style={styles.ctaTitle}>Start Workout</Text>
                                        </View>
                                        <View style={styles.ctaPlay}>
                                            <Ionicons name="play" size={24} color="#FFF" />
                                        </View>
                                    </View>
                                    <View style={styles.ctaDecor1} />
                                    <View style={styles.ctaDecor2} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!activeWorkout && todaysPlan && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Today's Plan</Text>
                                <TouchableOpacity onPress={() => getTabNav().navigate('WorkoutTab')}>
                                    <Text style={[styles.linkText, { color: colors.primary.main }]}>View Workout</Text>
                                </TouchableOpacity>
                            </View>
                            <TodaysPlanCard
                                plan={todaysPlan}
                                c={c}
                                onPress={() => {
                                    getTabNav().navigate('WorkoutTab', {
                                        screen: 'ActiveWorkout',
                                        params: { routineId: todaysPlan.routineId },
                                    });
                                }}
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Your Metrics</Text>
                            <TouchableOpacity onPress={() => goToAnalytics('AnalyticsHub')}>
                                <Text style={[styles.linkText, { color: colors.primary.main }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
                            <MetricCard icon="dumbbell" label="WEEKLY VOL" value={fmtVol(weeklyVolume)} unit="kg" accent={colors.chart1} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="fire" label="STREAK" value={currentStreak.toString()} unit="days" accent={colors.warning} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="trophy" label="BEST STREAK" value={longestStreak.toString()} unit="days" accent={colors.chart3} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="medal" label="LEVEL" value={level.toString()} accent={colors.success} bg={colors.card} borderColor={colors.border} />
                            <MetricCard
                                icon="star-circle"
                                label="ACHIEVEMENTS"
                                value={unlockedAchievementCount.toString()}
                                unit={achievements.length > 0 ? `/ ${achievements.length}` : undefined}
                                accent={colors.primary.main}
                                bg={colors.card}
                                borderColor={colors.border}
                            />
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display, marginBottom: 12 }]}>Activity</Text>
                        <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <WorkoutHeatmap data={heatmapData} showToggle defaultRange="week" showLegend />
                        </View>
                    </View>

                    <View style={[styles.section, styles.sectionLast]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Recent Activity</Text>
                            <TouchableOpacity onPress={() => getTabNav().navigate('WorkoutTab', { screen: 'WorkoutHistory' })}>
                                <Text style={[styles.linkText, { color: colors.primary.main }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        {recentWorkouts.length > 0 ? (
                            recentWorkouts.map((workout) => (
                                <WorkoutRow
                                    key={workout.id}
                                    workout={workout}
                                    c={c}
                                    onPress={() => {
                                        getTabNav().navigate('WorkoutTab', {
                                            screen: 'WorkoutDetail',
                                            params: { workoutId: Number(workout.id) },
                                        });
                                    }}
                                />
                            ))
                        ) : (
                            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.emptyCardText, { color: colors.mutedForeground }]}>No completed workouts yet.</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20, marginBottom: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 24 },
    headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    headerTextCol: { gap: 4, flex: 1 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    headerTitle: { fontSize: 26, lineHeight: 32 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerIconBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        position: 'relative',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
    streakNum: { fontSize: 16, fontWeight: '700' },
    notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },

    activeBannerWrapper: {
        borderRadius: 20,
        ...Platform.select({
            ios: { shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
            android: { elevation: 10 },
        }),
        marginBottom: 4,
    },
    activeBannerGradient: { borderRadius: 20, padding: 18 },
    activeBannerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    activeBannerLeft: { flex: 1, gap: 4 },
    activeDotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
    activeDotPing: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF', opacity: 0.5 },
    activeDotCore: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
    activeLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, marginLeft: 18 },
    activeName: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    activeMeta: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    activeResumeBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    activeProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
    activeProgressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFF' },

    ctaWrapper: {
        borderRadius: 22,
        ...Platform.select({
            ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    ctaGrad: { borderRadius: 22, overflow: 'hidden' },
    ctaContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 },
    ctaLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 4 },
    ctaTitle: { fontSize: 26, fontWeight: '800', color: '#FFF' },
    ctaPlay: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    ctaDecor1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.08)', right: -20, bottom: -30 },
    ctaDecor2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)', left: -10, top: -15 },

    section: { paddingHorizontal: 20, marginBottom: 28 },
    sectionLast: { marginBottom: 0 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    linkText: { fontSize: 13, fontWeight: '600' },

    metricsScroll: { gap: 12, paddingRight: 4 },
    metricCard: {
        width: 140,
        padding: 16,
        borderRadius: 18,
        gap: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    metricIconBg: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    metricLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
    metricValRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
    metricVal: { fontSize: 26, fontWeight: '800' },
    metricUnit: { fontSize: 13 },

    heatmapCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },

    wkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
        gap: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
            android: { elevation: 1 },
        }),
    },
    wkIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    wkInfo: { flex: 1, gap: 3 },
    wkName: { fontSize: 15, fontWeight: '700' },
    wkDate: { fontSize: 12 },
    wkRight: { alignItems: 'flex-end', gap: 4 },
    wkVol: { fontSize: 16, fontWeight: '700' },
    wkVolUnit: { fontSize: 11 },
    prBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    prText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

    emptyCard: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 18,
    },
    emptyCardText: {
        fontSize: 13,
        fontWeight: '500',
    },

    todayCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        gap: 14,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    todayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    todayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    todayIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    todayTitle: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
    todayMeta: { fontSize: 12 },
    startTodayBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    startTodayBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
    todayExerciseList: { gap: 8 },
    todayExRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    todayExDot: { width: 8, height: 8, borderRadius: 4 },
    todayExName: { flex: 1, fontSize: 13, fontWeight: '500' },
    todayExSets: { fontSize: 12 },
    todayMoreText: { fontSize: 12, fontWeight: '500', marginTop: 2 },
});
