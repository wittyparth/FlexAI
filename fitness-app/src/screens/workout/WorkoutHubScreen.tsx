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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import { DUMMY_RECENT_WORKOUTS, HEATMAP_DATA, DUMMY_METRICS, DUMMY_USER } from '../../data/mockData';
import { useWorkoutStore } from '../../store/workoutStore';
import { useShallow } from 'zustand/react/shallow';
import type { ThemeColors } from '../../hooks/useColors';
import { useRoutines } from '../../hooks/queries/useRoutineQueries';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const fmtVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
const fmtDuration = (s: number) => `${Math.floor(s / 60)}m`;
const toTitleCase = (value?: string | null) =>
    value ? `${value.charAt(0).toUpperCase()}${value.slice(1).replace('_', ' ')}` : 'General';

const DIFF_COLOR: Record<string, string> = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
};

function SectionHeader({ title, onViewAll, colors }: { title: string; onViewAll?: () => void; colors: ThemeColors }) {
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>{title}</Text>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.viewAll, { color: colors.primary.main }]}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function StatTile({ value, label, icon, color, colors }: { value: string; label: string; icon: string; color: string; colors: ThemeColors }) {
    return (
        <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statTileIcon, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={color} />
            </View>
            <Text style={[styles.statTileVal, { color: colors.foreground, fontFamily: fontFamilies.mono }]}>{value}</Text>
            <Text style={[styles.statTileLabel, { color: colors.mutedForeground }]}>{label}</Text>
        </View>
    );
}

function RoutineRow({ routine, onPress, colors }: { routine: any; onPress: () => void; colors: ThemeColors }) {
    const difficulty = toTitleCase(routine.difficulty);
    const diffColor = DIFF_COLOR[difficulty] || colors.chart4;
    const daysPerWeek =
        routine.daysPerWeek ||
        (routine.schedule && typeof routine.schedule === 'object'
            ? Object.values(routine.schedule).filter(Boolean).length
            : 1);
    const exerciseCount = Array.isArray(routine.exercises) ? routine.exercises.length : 0;

    return (
        <TouchableOpacity
            style={[styles.routineRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.routineColorBar, { backgroundColor: routine.color || diffColor }]} />
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: colors.foreground }]}>{routine.name}</Text>
                <Text style={[styles.routineMeta, { color: colors.mutedForeground }]}>{daysPerWeek}x/wk - {exerciseCount} exercises</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
                <Text style={[styles.diffText, { color: diffColor }]}>{difficulty}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
}

function TemplateRow({ template, onPress, colors }: { template: any; onPress: () => void; colors: ThemeColors }) {
    const exerciseCount = Array.isArray(template.exercises) ? template.exercises.length : 0;
    const lastUsed = template.updatedAt
        ? new Date(template.updatedAt).toLocaleDateString()
        : 'Recently';

    return (
        <TouchableOpacity
            style={[styles.routineRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.routineColorBar, { backgroundColor: template.color || colors.primary.main }]} />
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: colors.foreground }]}>{template.name}</Text>
                <Text style={[styles.routineMeta, { color: colors.mutedForeground }]}>{exerciseCount} exercises - Last: {lastUsed}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
}

function QuickAction({ icon, label, color, bg, onPress }: { icon: string; label: string; color: string; bg: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
            <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

export function WorkoutHubScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const fade = useRef(new Animated.Value(0)).current;

    const { workoutStatus, workoutName, totalSets } = useWorkoutStore(useShallow(state => ({
        workoutStatus: state.status,
        workoutName: state.workoutName,
        totalSets: Object.keys(state.sets).length,
    })));

    const { data: routinesResponse, isLoading: isRoutinesLoading } = useRoutines({ page: 1, limit: 5, isTemplate: false });
    const { data: templatesResponse, isLoading: isTemplatesLoading } = useRoutines({ page: 1, limit: 5, isTemplate: true });

    const myRoutines = routinesResponse?.data?.routines || [];
    const myTemplates = templatesResponse?.data?.routines || [];

    useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fade]);

    useEffect(() => {
        useWorkoutStore.getState().syncCurrentWorkout().catch(() => {
            // Non-blocking sync; UI continues with local state if this fails.
        });
    }, []);

    const nav = (screen: string, params?: any) => navigation.navigate(screen, params);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <View>
                        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>READY TO TRAIN</Text>
                        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Workout</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => nav('WorkoutHistory')}
                    >
                        <Ionicons name="time-outline" size={20} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ opacity: fade }}>
                    {workoutStatus === 'in_progress' && (
                        <View style={styles.px}>
                            <TouchableOpacity
                                style={[styles.activeBanner, { backgroundColor: colors.card, borderColor: colors.primary.main + '30' }]}
                                onPress={() => nav('ActiveWorkout')}
                                activeOpacity={0.85}
                            >
                                <View style={styles.activeBannerDotWrap}>
                                    <View style={styles.activeBannerDot} />
                                </View>
                                <View style={styles.activeBannerInfo}>
                                    <Text style={[styles.activeBannerTitle, { color: colors.foreground }]} numberOfLines={1}>
                                        {workoutName || 'Workout'}
                                    </Text>
                                    <Text style={[styles.activeBannerMeta, { color: colors.mutedForeground }]}>
                                        {totalSets} sets logged - In Progress
                                    </Text>
                                </View>
                                <View style={[styles.activeBannerBtn, { backgroundColor: colors.primary.main }]}>
                                    <Ionicons name="play" size={14} color="#FFFFFF" />
                                    <Text style={styles.activeBannerBtnText}>Resume</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.px, styles.statsRow]}>
                        <StatTile value={DUMMY_METRICS.weeklyWorkouts.toString()} label="This Week" icon="clipboard-check" color={colors.chart4} colors={colors} />
                        <StatTile value={`${(DUMMY_METRICS.weeklyVolume / 1000).toFixed(0)}k`} label="Volume (lbs)" icon="weight" color={colors.chart1} colors={colors} />
                        <StatTile value={`${DUMMY_USER.streak}d`} label="Streak" icon="fire" color={colors.warning} colors={colors} />
                    </View>

                    <View style={styles.px}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <WorkoutHeatmap
                                data={HEATMAP_DATA}
                                showToggle
                                defaultRange="week"
                                containerPaddingH={56}
                                showLegend
                            />
                        </View>
                    </View>

                    <View style={[styles.px, styles.mt]}>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await useWorkoutStore.getState().startWorkout({ name: 'Quick Workout' });
                                    nav('ActiveWorkout');
                                } catch (error: any) {
                                    Alert.alert('Unable to start workout', error?.message || 'Please try again.');
                                }
                            }}
                            activeOpacity={0.9}
                            style={styles.startWrapper}
                        >
                            <View style={styles.startGrad}>
                                <View style={styles.startContent}>
                                    <View>
                                        <Text style={[styles.startLabel, { color: colors.primaryForeground + 'A0' }]}>TAP TO BEGIN</Text>
                                        <Text style={[styles.startTitle, { color: colors.primaryForeground }]}>Start Empty Workout</Text>
                                    </View>
                                    <View style={styles.startPlay}>
                                        <Ionicons name="play" size={24} color={colors.primaryForeground} />
                                    </View>
                                </View>
                                <View style={styles.startDecor} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="Quick Actions" colors={colors} />
                        <View style={styles.qaGrid}>
                            <QuickAction icon="clipboard-list-outline" label="Routines" color={colors.chart4} bg={`${colors.chart4}20`} onPress={() => nav('RoutineList')} />
                            <QuickAction icon="calendar-month" label="Templates" color={colors.chart1} bg={`${colors.chart1}20`} onPress={() => nav('TemplateList')} />
                            <QuickAction icon="plus-circle-outline" label="New Routine" color={colors.success} bg={`${colors.success}20`} onPress={() => nav('RoutineEditor')} />
                            <QuickAction icon="robot-outline" label="AI Generate" color={colors.warning} bg={`${colors.warning}20`} onPress={() => nav('AIRoutinePlanner')} />
                        </View>
                    </View>

                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="My Routines" onViewAll={() => nav('RoutineList')} colors={colors} />
                        {isRoutinesLoading ? (
                            <View style={styles.listLoadingRow}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : myRoutines.length === 0 ? (
                            <Text style={[styles.emptyListText, { color: colors.mutedForeground }]}>No routines yet.</Text>
                        ) : (
                            myRoutines.map((routine: any) => (
                                <RoutineRow
                                    key={routine.id}
                                    routine={routine}
                                    onPress={() => navigation.navigate('RoutineDetail', { routineId: Number(routine.id) })}
                                    colors={colors}
                                />
                            ))
                        )}
                    </View>

                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="My Templates" onViewAll={() => nav('TemplateList')} colors={colors} />
                        {isTemplatesLoading ? (
                            <View style={styles.listLoadingRow}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : myTemplates.length === 0 ? (
                            <Text style={[styles.emptyListText, { color: colors.mutedForeground }]}>No templates yet.</Text>
                        ) : (
                            myTemplates.map((template: any) => (
                                <TemplateRow
                                    key={template.id}
                                    template={template}
                                    onPress={() => navigation.navigate('RoutineDetail', { routineId: Number(template.id) })}
                                    colors={colors}
                                />
                            ))
                        )}
                    </View>

                    <View style={[styles.px, styles.mt]}>
                        <TouchableOpacity
                            onPress={() => nav('AIRoutinePlanner')}
                            activeOpacity={0.9}
                            style={{ borderRadius: 18, overflow: 'hidden' }}
                        >
                            <View style={styles.aiCard}>
                                <View style={styles.aiContent}>
                                    <Ionicons name="sparkles" size={24} color="#FBBF24" style={{ marginBottom: 6 }} />
                                    <Text style={[styles.aiTitle, { color: colors.primaryForeground }]}>AI Routine Planner</Text>
                                    <Text style={[styles.aiSub, { color: colors.primaryForeground + 'B0' }]}>Chat with AI Coach, generate a personalized routine or workout template</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={colors.primaryForeground + '99'} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.px, styles.mt, styles.mbExtra]}>
                        <SectionHeader title="Recent Activity" onViewAll={() => nav('WorkoutHistory')} colors={colors} />
                        {DUMMY_RECENT_WORKOUTS.slice(0, 3).map(w => (
                            <TouchableOpacity
                                key={w.id}
                                style={[styles.recentRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.75}
                                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: parseInt(w.id) })}
                            >
                                <View style={[styles.recentIcon, { backgroundColor: colors.primary.main + '12' }]}> 
                                    <MaterialCommunityIcons name={w.iconName} size={20} color={colors.primary.main} />
                                </View>
                                <View style={styles.recentInfo}>
                                    <Text style={[styles.recentName, { color: colors.foreground }]}>{w.name}</Text>
                                    <Text style={[styles.recentMeta, { color: colors.mutedForeground }]}>{w.date} - {w.exercises} ex - {fmtDuration(w.duration)}</Text>
                                </View>
                                <View style={styles.recentRight}>
                                    <Text style={[styles.recentVol, { color: colors.foreground, fontFamily: fontFamilies.mono }]}>{fmtVol(w.volume)}</Text>
                                    {w.hasPR && (
                                        <View style={[styles.prBadge, { backgroundColor: `${colors.primary.main}25` }]}>
                                            <Text style={[styles.prText, { color: colors.primary.main }]}>PR</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20 },
    mt: { marginTop: 28 },
    mbExtra: { marginBottom: 12 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 20 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 32 },
    headerBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statTile: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8 },
    statTileIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statTileVal: { fontSize: 20, fontWeight: '800' },
    statTileLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

    card: { borderRadius: 18, borderWidth: 1, padding: 16 },

    startWrapper: {
        borderRadius: 22,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
            android: { elevation: 10 },
        }),
    },
    startGrad: { borderRadius: 22, overflow: 'hidden' },
    startContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 },
    startLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
    startTitle: { fontSize: 24, fontWeight: '800' },
    startPlay: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    startDecor: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)', right: -20, bottom: -30 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    viewAll: { fontSize: 13, fontWeight: '600' },
    qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickAction: { width: (SCREEN_WIDTH - 52) / 2, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 8 },
    quickActionLabel: { fontSize: 13, fontWeight: '700' },

    listLoadingRow: { paddingVertical: 16 },
    emptyListText: { fontSize: 13, marginBottom: 8 },

    routineRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12, overflow: 'hidden' },
    routineColorBar: { width: 4, height: 44, borderRadius: 2 },
    routineInfo: { flex: 1, gap: 3 },
    routineName: { fontSize: 15, fontWeight: '700' },
    routineMeta: { fontSize: 12 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 11, fontWeight: '700' },

    aiCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 18 },
    aiContent: { flex: 1 },
    aiTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    aiSub: { fontSize: 13, lineHeight: 18 },

    recentRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
    recentIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    recentInfo: { flex: 1, gap: 3 },
    recentName: { fontSize: 15, fontWeight: '700' },
    recentMeta: { fontSize: 12 },
    recentRight: { alignItems: 'flex-end', gap: 4 },
    recentVol: { fontSize: 15, fontWeight: '700' },
    prBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    prText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    activeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    activeBannerDotWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    activeBannerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
    activeBannerInfo: { flex: 1, gap: 2 },
    activeBannerTitle: { fontSize: 15, fontWeight: '700' },
    activeBannerMeta: { fontSize: 11, fontWeight: '500' },
    activeBannerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    activeBannerBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
