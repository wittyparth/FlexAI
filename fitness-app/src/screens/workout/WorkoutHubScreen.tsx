import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import {
    ACTIVE_ROUTINES, MY_TEMPLATES, DUMMY_RECENT_WORKOUTS, HEATMAP_DATA, DUMMY_METRICS, DUMMY_USER,
} from '../../data/mockData';
import { useWorkoutStore } from '../../store/workoutStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── DESIGN TOKENS ───
const C = {
    dark:  { bg: '#0A0E1A', card: '#131C2E', border: '#1F2D45', text: '#F1F5FF', muted: '#7A8BAA', primary: '#3B82F6', surface: '#1A2540' },
    light: { bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F8', text: '#0D1526', muted: '#64748B', primary: '#2563EB', surface: '#EEF2FF' },
};
const FNT = { display: 'Calistoga', mono: 'JetBrainsMono', bold: 'Inter-Bold', semi: 'Inter-SemiBold' };

const fmtVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
const fmtDuration = (s: number) => `${Math.floor(s / 60)}m`;

// ─── DIFFICULTY BADGE ───
const DIFF_COLOR: Record<string, string> = { Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444' };

// ─── SECTION HEADER ───
function SectionHeader({ title, onViewAll, c }: { title: string; onViewAll?: () => void; c: typeof C.dark }) {
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: FNT.display }]}>{title}</Text>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.viewAll, { color: c.primary }]}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── STAT TILE ───
function StatTile({ value, label, icon, color, c }: { value: string; label: string; icon: string; color: string; c: typeof C.dark }) {
    return (
        <View style={[styles.statTile, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={[styles.statTileIcon, { backgroundColor: `${color}20` }]}>
                <MaterialCommunityIcons name={icon as any} size={18} color={color} />
            </View>
            <Text style={[styles.statTileVal, { color: c.text, fontFamily: FNT.mono }]}>{value}</Text>
            <Text style={[styles.statTileLabel, { color: c.muted }]}>{label}</Text>
        </View>
    );
}

// ─── ROUTINE ROW ───
function RoutineRow({ routine, onPress, c }: { routine: any; onPress: () => void; c: typeof C.dark }) {
    const diffColor = DIFF_COLOR[routine.difficulty] || '#6366F1';
    return (
        <TouchableOpacity style={[styles.routineRow, { backgroundColor: c.card, borderColor: c.border }]} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.routineColorBar, { backgroundColor: routine.color || diffColor }]} />
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: c.text }]}>{routine.name}</Text>
                <Text style={[styles.routineMeta, { color: c.muted }]}>{routine.daysPerWeek}×/wk • {routine.exercises || '—'} exercises</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
                <Text style={[styles.diffText, { color: diffColor }]}>{routine.difficulty}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </TouchableOpacity>
    );
}

// ─── TEMPLATE ROW ───
function TemplateRow({ template, onPress, c }: { template: any; onPress: () => void; c: typeof C.dark }) {
    return (
        <TouchableOpacity style={[styles.routineRow, { backgroundColor: c.card, borderColor: c.border }]} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.routineColorBar, { backgroundColor: template.color }]} />
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: c.text }]}>{template.name}</Text>
                <Text style={[styles.routineMeta, { color: c.muted }]}>{template.exercises} exercises • Last: {template.lastUsed}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </TouchableOpacity>
    );
}

// ─── QUICK ACTION ───
function QuickAction({ icon, label, color, bg, onPress }: { icon: string; label: string; color: string; bg: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
            <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

// ─── MAIN SCREEN ───
export function WorkoutHubScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const c = isDark ? C.dark : C.light;
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;
    const nav = (screen: string, params?: any) => navigation.navigate(screen, params);

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

                {/* ─── HEADER ─── */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <View>
                        <Text style={[styles.headerSub, { color: c.muted }]}>READY TO TRAIN</Text>
                        <Text style={[styles.headerTitle, { color: c.text, fontFamily: FNT.display }]}>Workout</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => nav('WorkoutHistory')}
                    >
                        <Ionicons name="time-outline" size={20} color={c.text} />
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ opacity: fade }}>

                    {/* ─── STATS ROW ─── */}
                    <View style={[styles.px, styles.statsRow]}>
                        <StatTile value={DUMMY_METRICS.weeklyWorkouts.toString()} label="This Week" icon="clipboard-check" color="#6366F1" c={c} />
                        <StatTile value={`${(DUMMY_METRICS.weeklyVolume / 1000).toFixed(0)}k`} label="Volume (lbs)" icon="weight" color="#3B82F6" c={c} />
                        <StatTile value={`${DUMMY_USER.streak}d`} label="Streak" icon="fire" color="#F97316" c={c} />
                    </View>

                    {/* ─── HEATMAP ─── */}
                    <View style={styles.px}>
                        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                            <WorkoutHeatmap
                                data={HEATMAP_DATA}
                                showToggle
                                defaultRange="week"
                                containerPaddingH={56}
                                showLegend
                            />
                        </View>
                    </View>

                    {/* ─── START EMPTY WORKOUT ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <TouchableOpacity
                            onPress={() => {
                                useWorkoutStore.getState().startMockWorkout('Empty Workout', []);
                                nav('ActiveWorkout');
                            }}
                            activeOpacity={0.9}
                            style={styles.startWrapper}
                        >
                            <LinearGradient
                                colors={['#1D4ED8', '#7C3AED']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.startGrad}
                            >
                                <View style={styles.startContent}>
                                    <View>
                                        <Text style={styles.startLabel}>TAP TO BEGIN</Text>
                                        <Text style={styles.startTitle}>Start Empty Workout</Text>
                                    </View>
                                    <View style={styles.startPlay}>
                                        <Ionicons name="play" size={24} color="#FFF" />
                                    </View>
                                </View>
                                <View style={styles.startDecor} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* ─── QUICK ACTIONS ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="Quick Actions" c={c} />
                        <View style={styles.qaGrid}>
                            <QuickAction icon="clipboard-list-outline" label="Routines" color="#6366F1" bg="#6366F120" onPress={() => nav('RoutineList')} />
                            <QuickAction icon="file-document-outline" label="Templates" color="#3B82F6" bg="#3B82F620" onPress={() => nav('RoutineList', { initialTab: 'Discover' })} />
                            <QuickAction icon="plus-circle-outline" label="New Routine" color="#10B981" bg="#10B98120" onPress={() => nav('RoutineEditor')} />
                            <QuickAction icon="robot-outline" label="AI Generate" color="#F59E0B" bg="#F59E0B20" onPress={() => nav('AIRoutinePlanner')} />
                        </View>
                    </View>

                    {/* ─── MY ROUTINES ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="My Routines" onViewAll={() => nav('RoutineList')} c={c} />
                        {ACTIVE_ROUTINES.map(r => (
                            <RoutineRow key={r.id} routine={r} c={c} onPress={() => navigation.navigate('RoutineDetail', { routineId: parseInt(r.id) })} />
                        ))}
                    </View>

                    {/* ─── MY TEMPLATES ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="My Templates" onViewAll={() => nav('RoutineList')} c={c} />
                        {MY_TEMPLATES.map(t => (
                            <TemplateRow key={t.id} template={t} c={c} onPress={() => navigation.navigate('RoutineDetail', { routineId: parseInt(t.id.replace('t', '')) || 1 })} />
                        ))}
                    </View>

                    {/* ─── AI ROUTINE PLANNER SECTION ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <TouchableOpacity
                            onPress={() => nav('AIRoutinePlanner')}
                            activeOpacity={0.9}
                            style={{ borderRadius: 18, overflow: 'hidden' }}
                        >
                            <LinearGradient colors={['#1E1B4B', '#4338CA']} style={styles.aiCard}>
                                <View style={styles.aiContent}>
                                    <Ionicons name="sparkles" size={24} color="#A78BFA" style={{ marginBottom: 6 }} />
                                    <Text style={styles.aiTitle}>AI Routine Planner</Text>
                                    <Text style={styles.aiSub}>Chat with AI Coach, generate a personalized routine or workout template</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* ─── RECENT ACTIVITY ─── */}
                    <View style={[styles.px, styles.mt, styles.mbExtra]}>
                        <SectionHeader title="Recent Activity" onViewAll={() => nav('WorkoutHistory')} c={c} />
                        {DUMMY_RECENT_WORKOUTS.slice(0, 3).map(w => (
                            <TouchableOpacity key={w.id} style={[styles.recentRow, { backgroundColor: c.card, borderColor: c.border }]} activeOpacity={0.75} onPress={() => navigation.navigate('WorkoutDetail', { workoutId: parseInt(w.id) })}>
                                <View style={[styles.recentIcon, { backgroundColor: c.surface }]}>
                                    <MaterialCommunityIcons name={w.iconName} size={20} color={c.primary} />
                                </View>
                                <View style={styles.recentInfo}>
                                    <Text style={[styles.recentName, { color: c.text }]}>{w.name}</Text>
                                    <Text style={[styles.recentMeta, { color: c.muted }]}>{w.date} • {w.exercises} ex • {fmtDuration(w.duration)}</Text>
                                </View>
                                <View style={styles.recentRight}>
                                    <Text style={[styles.recentVol, { color: c.text, fontFamily: FNT.mono }]}>{fmtVol(w.volume)}</Text>
                                    {w.hasPR && <View style={[styles.prBadge, { backgroundColor: `${c.primary}25` }]}><Text style={[styles.prText, { color: c.primary }]}>PR</Text></View>}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── STYLES ───
const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20 },
    mt: { marginTop: 28 },
    mbExtra: { marginBottom: 12 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 20 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 32 },
    headerBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statTile: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', gap: 8 },
    statTileIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statTileVal: { fontSize: 20, fontWeight: '800' },
    statTileLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

    // Card
    card: { borderRadius: 18, borderWidth: 1, padding: 16 },

    // Start Workout
    startWrapper: { borderRadius: 22, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 },
    startGrad: { borderRadius: 22, overflow: 'hidden' },
    startContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 },
    startLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5, marginBottom: 4 },
    startTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
    startPlay: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    startDecor: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.07)', right: -20, bottom: -30 },

    // Quick Actions
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    viewAll: { fontSize: 13, fontWeight: '600' },
    qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickAction: { width: (SCREEN_WIDTH - 52) / 2, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 8 },
    quickActionLabel: { fontSize: 13, fontWeight: '700' },

    // Routine / Template rows
    routineRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12, overflow: 'hidden' },
    routineColorBar: { width: 4, height: 44, borderRadius: 2 },
    routineInfo: { flex: 1, gap: 3 },
    routineName: { fontSize: 15, fontWeight: '700' },
    routineMeta: { fontSize: 12 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 11, fontWeight: '700' },

    // AI card
    aiCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 18 },
    aiContent: { flex: 1 },
    aiTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    aiSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },

    // Recent
    recentRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
    recentIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    recentInfo: { flex: 1, gap: 3 },
    recentName: { fontSize: 15, fontWeight: '700' },
    recentMeta: { fontSize: 12 },
    recentRight: { alignItems: 'flex-end', gap: 4 },
    recentVol: { fontSize: 15, fontWeight: '700' },
    prBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    prText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
