import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fontFamilies } from '../../theme/typography';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import {
    DUMMY_USER,
    DUMMY_METRICS,
    DUMMY_RECENT_WORKOUTS,
    ACTIVE_WORKOUT_TODAY,
    HEATMAP_DATA,
    TODAYS_PLANNED_WORKOUT,
} from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const fmtVol = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString());
const fmtDuration = (secs: number) => `${Math.floor(secs / 60)}m`;

// ============================================================
// ACTIVE WORKOUT BANNER
// ============================================================
function ActiveWorkoutBanner({ workout, onPress }: { workout: typeof ACTIVE_WORKOUT_TODAY; onPress: () => void }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const elapsed = Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 60000);
    const pct = (workout.exercisesDone / workout.totalExercises) * 100;

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
                        <Text style={styles.activeMeta}>{elapsed} min • {workout.exercisesDone}/{workout.totalExercises} exercises</Text>
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

// ============================================================
// TODAY'S PLAN SECTION
// ============================================================
function TodaysPlanCard({ plan, onPress, c }: { plan: typeof TODAYS_PLANNED_WORKOUT; onPress: () => void; c: any }) {
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
                        <Text style={[styles.todayMeta, { color: c.muted }]}>{plan.exercises.length} exercises • ~{plan.estimatedDuration} min</Text>
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
                        <Text style={[styles.todayExSets, { color: c.muted, fontFamily: fontFamilies.mono }]}>{ex.sets}×{ex.reps}</Text>
                    </View>
                ))}
                {plan.exercises.length > 4 && (
                    <Text style={[styles.todayMoreText, { color: c.muted }]}>+{plan.exercises.length - 4} more exercises</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

// MetricCard — Premium with inner glow
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

// Recent Workout Row
function WorkoutRow({ workout, onPress, c }: { workout: any; onPress: () => void; c: any }) {
    return (
        <TouchableOpacity style={[styles.wkRow, { backgroundColor: c.card, borderColor: c.border }]} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.wkIcon, { backgroundColor: c.primary + '12' }]}>
                <MaterialCommunityIcons name={workout.iconName} size={22} color={c.primary} />
            </View>
            <View style={styles.wkInfo}>
                <Text style={[styles.wkName, { color: c.text }]}>{workout.name}</Text>
                <Text style={[styles.wkDate, { color: c.muted }]}>{workout.date} • {fmtDuration(workout.duration || 3600)}</Text>
            </View>
            <View style={styles.wkRight}>
                <Text style={[styles.wkVol, { color: c.text, fontFamily: fontFamilies.mono }]}>{fmtVol(workout.volume)}</Text>
                <Text style={[styles.wkVolUnit, { color: c.muted }]}>kg</Text>
                {workout.hasPR && (
                    <View style={styles.prBadge}>
                        <Text style={styles.prText}>🔥 PR</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { isDark } = useTheme();

    // Map to local shorthand for sub-components
    const c = {
        bg: colors.background, card: colors.card, border: colors.border,
        text: colors.foreground, muted: colors.mutedForeground, primary: colors.primary.main,
        primaryGlow: colors.primary.main + '30', surface: colors.muted,
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    const getTabNav = () => navigation.getParent() ?? navigation;
    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;

    const openDrawer = () => {
        try { getDrawerNav().openDrawer(); } catch { }
    };

    const goToWorkout = () => getTabNav().navigate('WorkoutTab');
    const goToAnalytics = (screen = 'AnalyticsHub') => getDrawerNav().navigate('Analytics', { screen });

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                {/* ─── HEADER ─── */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <View style={styles.headerLeft}>
                        {/* Hamburger Menu Button */}
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
                                {getGreeting()},{'\n'}{DUMMY_USER.firstName} 👋
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Streak badge — premium gradient */}
                        <View
                            style={styles.streakBadge}
                        >
                            <Ionicons name="flame" size={16} color={colors.warning} />
                            <Text style={[styles.streakNum, { color: colors.warning, fontFamily: fontFamilies.mono }]}>{DUMMY_USER.streak}</Text>
                        </View>
                        {/* Notification */}
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
                    {/* ─── ACTIVE WORKOUT BANNER ─── */}
                    {ACTIVE_WORKOUT_TODAY.isActive && (
                        <View style={styles.px}>
                            <ActiveWorkoutBanner
                                workout={ACTIVE_WORKOUT_TODAY}
                                onPress={() => {
                                    getTabNav().navigate('WorkoutTab', {
                                        screen: 'ActiveWorkout',
                                        params: { workoutId: 1 },
                                    });
                                }}
                            />
                        </View>
                    )}

                    {/* ─── START WORKOUT CTA ─── */}
                    {!ACTIVE_WORKOUT_TODAY.isActive && (
                        <View style={styles.px}>
                            <TouchableOpacity onPress={goToWorkout} activeOpacity={0.92} style={styles.ctaWrapper}>
                                <View
                                    style={styles.ctaGrad}
                                >
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

                    {/* ─── TODAY'S PLAN ─── */}
                    {!ACTIVE_WORKOUT_TODAY.isActive && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Today's Plan</Text>
                                <TouchableOpacity onPress={() => getTabNav().navigate('WorkoutTab')}>
                                    <Text style={[styles.linkText, { color: colors.primary.main }]}>View Workout</Text>
                                </TouchableOpacity>
                            </View>
                            <TodaysPlanCard
                                plan={TODAYS_PLANNED_WORKOUT}
                                c={c}
                                onPress={() => {
                                    getTabNav().navigate('WorkoutTab', {
                                        screen: 'ActiveWorkout',
                                        params: { routineId: TODAYS_PLANNED_WORKOUT.routineId },
                                    });
                                }}
                            />
                        </View>
                    )}

                    {/* ─── METRICS ─── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Your Metrics</Text>
                            <TouchableOpacity onPress={() => goToAnalytics('AnalyticsHub')}>
                                <Text style={[styles.linkText, { color: colors.primary.main }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
                            <MetricCard icon="dumbbell" label="WEEKLY VOL" value={fmtVol(DUMMY_METRICS.weeklyVolume)} unit="kg" accent={colors.chart1} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="fire" label="STREAK" value={DUMMY_USER.streak.toString()} unit="days" accent={colors.warning} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="trophy" label="BEST STREAK" value={DUMMY_METRICS.bestStreak.toString()} unit="days" accent={colors.chart3} bg={colors.card} borderColor={colors.border} />
                            <MetricCard icon="heart-pulse" label="RECOVERY" value={DUMMY_METRICS.recovery} accent={colors.success} bg={colors.card} borderColor={colors.border} />
                        </ScrollView>
                    </View>

                    {/* ─── WEEKLY HEATMAP ─── */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display, marginBottom: 12 }]}>Activity</Text>
                        <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <WorkoutHeatmap data={HEATMAP_DATA} showToggle={true} defaultRange="week" showLegend={true} />
                        </View>
                    </View>

                    {/* ─── RECENT ACTIVITY ─── */}
                    <View style={[styles.section, styles.sectionLast]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: fontFamilies.display }]}>Recent Activity</Text>
                            <TouchableOpacity onPress={() => getTabNav().navigate('WorkoutTab', { screen: 'WorkoutHistory' })}>
                                <Text style={[styles.linkText, { color: colors.primary.main }]}>View All</Text>
                            </TouchableOpacity>
                        </View>
                        {DUMMY_RECENT_WORKOUTS.map(w => (
                            <WorkoutRow key={w.id} workout={w} c={c} onPress={() => {
                                getTabNav().navigate('WorkoutTab', { screen: 'WorkoutDetail', params: { workoutId: parseInt(w.id) } });
                            }} />
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ============================================================
// STYLES — Premium design
// ============================================================
const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20, marginBottom: 20 },

    // HEADER
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 24 },
    headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    headerTextCol: { gap: 4, flex: 1 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
    headerTitle: { fontSize: 26, lineHeight: 32 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerIconBtn: {
        width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, position: 'relative',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
    streakNum: { fontSize: 16, fontWeight: '700' },
    notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },

    // ACTIVE BANNER
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

    // START WORKOUT CTA
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

    // SECTIONS
    section: { paddingHorizontal: 20, marginBottom: 28 },
    sectionLast: { marginBottom: 0 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    linkText: { fontSize: 13, fontWeight: '600' },

    // METRICS — Premium cards
    metricsScroll: { gap: 12, paddingRight: 4 },
    metricCard: {
        width: 140, padding: 16, borderRadius: 18, gap: 10,
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

    // HEATMAP
    heatmapCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },

    // RECENT WORKOUTS
    wkRow: {
        flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1,
        padding: 14, marginBottom: 10, gap: 12,
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

    // TODAY'S PLAN
    todayCard: {
        borderRadius: 18, borderWidth: 1, padding: 16, gap: 14,
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
