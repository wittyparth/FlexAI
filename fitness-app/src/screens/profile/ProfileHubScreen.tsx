import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';
import { DateRangePicker, DateRange } from '../../components/common/DateRangePicker';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import { useDashboardStats, useMuscleDistribution, usePersonalRecords } from '../../hooks/queries/useStatsQueries';
import { useWorkouts } from '../../hooks/queries/useWorkoutQueries';
import { useAchievements, useGamificationStats } from '../../hooks/queries/useGamificationQueries';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';

const { width } = Dimensions.get('window');

const formatDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const formatCompactNumber = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return `${Math.round(value)}`;
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

const topMuscleFocus = (muscleSets: Record<string, number> = {}) => {
    const grouped: Record<string, number> = {
        Chest: 0,
        Back: 0,
        Legs: 0,
        Shoulders: 0,
        Arms: 0,
        Core: 0,
    };

    Object.entries(muscleSets).forEach(([key, value]) => {
        const lower = key.toLowerCase();
        if (lower.includes('chest') || lower.includes('pec')) grouped.Chest += value;
        else if (lower.includes('back') || lower.includes('lat') || lower.includes('trap')) grouped.Back += value;
        else if (lower.includes('leg') || lower.includes('quad') || lower.includes('ham') || lower.includes('glute') || lower.includes('calf')) grouped.Legs += value;
        else if (lower.includes('shoulder') || lower.includes('delt')) grouped.Shoulders += value;
        else if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep') || lower.includes('forearm')) grouped.Arms += value;
        else grouped.Core += value;
    });

    return Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
};

function StatStrip({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
    const colors = useColors();
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.viewAllText, { color: colors.primary.main }]}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function NavCard({
    icon,
    label,
    subtitle,
    color,
    onPress,
}: {
    icon: string;
    label: string;
    subtitle?: string;
    color: string;
    onPress: () => void;
}) {
    const colors = useColors();
    return (
        <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.navCardIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <View style={styles.navCardText}>
                <Text style={[styles.navCardLabel, { color: colors.foreground }]}>{label}</Text>
                {subtitle && <Text style={[styles.navCardSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
}

export function ProfileHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // ── Muscle distribution date range ──────────────────────────────────────
    const [calendarOpen, setCalendarOpen] = useState(false);
    const todayStr = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);
    const thirtyDaysAgoStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);
    const [muscleRange, setMuscleRange] = useState<DateRange>({
        startDate: thirtyDaysAgoStr,
        endDate: todayStr,
    });

    const { profileQuery } = useUserQueries();
    const { data: dashboardStats } = useDashboardStats();
    const { data: prRecords = [] } = usePersonalRecords();
    const { data: muscleDistribution } = useMuscleDistribution(muscleRange.startDate, muscleRange.endDate);
    const { data: workoutsResponse } = useWorkouts({ page: 1, limit: 500, status: 'completed' });
    const { data: gamificationStats } = useGamificationStats();
    const { data: achievements = [] } = useAchievements();

    const { logoutMutation } = useAuthQueries();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const profile = profileQuery.data;
    const completedWorkouts = (workoutsResponse?.data ?? []) as any[];

    const firstName = profile?.firstName || 'Athlete';
    const lastName = profile?.lastName || '';
    const username = `@${(profile?.email || 'user').split('@')[0]}`;

    const streak = gamificationStats?.currentStreak ?? dashboardStats?.streak?.current ?? 0;
    const level = gamificationStats?.level ?? 1;
    const xp = gamificationStats?.currentLevelXp ?? 0;
    const xpTarget = gamificationStats?.nextLevelXp ?? 100;
    const xpProgress = Math.max(0, Math.min(100, (gamificationStats?.levelProgress ?? 0) * 100));
    const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked || achievement.unlockedAt).length;

    const totalWorkoutCount = completedWorkouts.length;
    const totalVolume = completedWorkouts.reduce((sum: number, workout: any) => sum + Number(workout?.totalVolume ?? 0), 0);

    const weekAgo = addDays(new Date(), -7).getTime();
    const weeklyWorkouts = completedWorkouts.filter((workout: any) => {
        const date = new Date(workout?.endTime ?? workout?.completedAt ?? workout?.startTime).getTime();
        return !Number.isNaN(date) && date >= weekAgo;
    }).length;

    const heatmapData = useMemo(() => buildHeatmapData(completedWorkouts), [completedWorkouts]);

    const bestPrValue = useMemo(() => {
        if (!prRecords.length) return null;
        const best = [...prRecords].sort((a, b) => b.value - a.value)[0];
        return best ? `${best.value.toFixed(0)} kg` : null;
    }, [prRecords]);

    const avgWeeklyVolume = dashboardStats?.weeklyVolume ?? 0;
    const muscleFocus = topMuscleFocus(muscleDistribution?.muscleSets);

    const analyticsSummary = [
        { label: 'Best PR', value: bestPrValue ?? 'N/A', icon: 'trophy-outline', color: '#F59E0B' },
        { label: 'Avg Weekly Vol', value: `${formatCompactNumber(avgWeeklyVolume)} kg`, icon: 'trending-up', color: '#10B981' },
        { label: 'Muscle Focus', value: muscleFocus, icon: 'body-outline', color: '#EC4899' },
    ];

    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;
    const goToAnalytics = (screen = 'AnalyticsHub') => getDrawerNav().navigate('Analytics', { screen });
    const goToBodyTracking = (screen = 'BodyTrackingHub') => getDrawerNav().navigate('BodyTracking', { screen });
    const goToCoach = (screen = 'CoachHub') => getDrawerNav().navigate('Coach', { screen });
    const goToSettings = (screen = 'Settings') => getDrawerNav().navigate('SettingsNavigator', { screen });

    const handleLogout = () => {
        Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: () => logoutMutation.mutate(),
            },
        ]);
    };

    const isLoading = profileQuery.isLoading && !profile;

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
                <View style={[styles.heroGradient, { backgroundColor: colors.card, paddingTop: insets.top + 12 }]}> 
                    <View style={styles.heroTopBar}>
                        <Text style={[styles.heroPageTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Profile</Text>
                        <TouchableOpacity style={[styles.heroIconBtn, { backgroundColor: colors.muted }]} onPress={() => goToSettings('Settings')}>
                            <Ionicons name="settings-outline" size={22} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroBody}>
                        <View style={styles.avatarWrapper}>
                            <View style={[styles.avatarRing, { backgroundColor: colors.primary.main }]}> 
                                <View style={[styles.avatarInner, { backgroundColor: colors.card }]}> 
                                    <Text style={[styles.avatarText, { color: colors.primary.main }]}>{firstName.charAt(0).toUpperCase()}</Text>
                                </View>
                            </View>
                            <View style={[styles.levelBadge, { backgroundColor: colors.warning }]}> 
                                <Text style={styles.levelBadgeText}>{level}</Text>
                            </View>
                        </View>

                        <View style={styles.heroInfo}>
                            <Text style={[styles.heroName, { color: colors.foreground }]}>{`${firstName} ${lastName}`.trim()}</Text>
                            <Text style={[styles.heroHandle, { color: colors.mutedForeground }]}>{username}</Text>
                            <View style={[styles.streakPill, { backgroundColor: `${colors.warning}20` }]}> 
                                <Ionicons name="flame" size={13} color={colors.warning} />
                                <Text style={[styles.streakPillText, { color: colors.warning }]}>{streak} day streak</Text>
                            </View>
                            <View style={[styles.achievementPill, { backgroundColor: `${colors.primary.main}20` }]}>
                                <Ionicons name="trophy-outline" size={13} color={colors.primary.main} />
                                <Text style={[styles.achievementPillText, { color: colors.primary.main }]}>
                                    {unlockedAchievements}/{achievements.length} achievements
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.xpSection}>
                        <View style={styles.xpLabelRow}>
                            <Text style={[styles.xpLevelText, { color: colors.foreground }]}>Level {level}</Text>
                            <Text style={[styles.xpValueText, { color: colors.mutedForeground }]}>{formatCompactNumber(xp)} / {formatCompactNumber(xpTarget)} XP</Text>
                        </View>
                        <View style={[styles.xpBarBg, { backgroundColor: colors.muted }]}> 
                            <View style={[styles.xpBarFill, { width: `${xpProgress}%`, backgroundColor: colors.primary.main }]} />
                        </View>
                    </View>
                </View>

                <Animated.View
                    style={[
                        styles.statsStrip,
                        { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <StatStrip value={formatCompactNumber(totalWorkoutCount)} label="Workouts" color={colors.chart4} />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatStrip value={formatCompactNumber(totalVolume)} label="Volume (kg)" color={colors.chart1} />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatStrip value={`${weeklyWorkouts}/wk`} label="This Week" color={colors.success} />
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim }]}> 
                    <SectionHeader title="Activity" onViewAll={() => goToAnalytics('AnalyticsHub')} />
                    <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                        <WorkoutHeatmap
                            data={heatmapData}
                            showToggle
                            defaultRange="month"
                            compact
                            containerPaddingH={72}
                            showLegend
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim }]}> 
                    <SectionHeader title="Analytics" onViewAll={() => goToAnalytics('AnalyticsHub')} />

                    {/* ── Muscle Distribution Card ── */}
                    <MuscleHighlighterCard
                        title="Muscle Distribution"
                        subtitle={`${muscleRange.startDate} → ${muscleRange.endDate}`}
                        muscleSets={muscleDistribution?.muscleSets}
                        showGenderToggle
                        compact
                    />

                    {/* ── Calendar date range selector ── */}
                    <TouchableOpacity
                        style={[styles.calendarToggleBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => setCalendarOpen((prev) => !prev)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="calendar-outline" size={16} color={colors.primary.main} />
                        <Text style={[styles.calendarToggleText, { color: colors.foreground }]}>
                            {calendarOpen ? 'Hide Date Filter' : 'Filter by Date'}
                        </Text>
                        <Ionicons
                            name={calendarOpen ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            color={colors.mutedForeground}
                        />
                    </TouchableOpacity>

                    {calendarOpen && (
                        <DateRangePicker
                            value={muscleRange}
                            onChange={(range) => setMuscleRange(range)}
                        />
                    )}

                    <View style={styles.analyticsSummaryRow}>
                        {analyticsSummary.map((item) => (
                            <View key={item.label} style={[styles.analyticsMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                <Ionicons name={item.icon as any} size={18} color={item.color} />
                                <Text style={[styles.analyticsValue, { color: colors.foreground }]}>{item.value}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.navCardList}>
                        <NavCard icon="trophy-outline" label="Personal Records" subtitle={`${prRecords.length} all-time records`} color="#F59E0B" onPress={() => goToAnalytics('PersonalRecords')} />
                        <NavCard icon="trending-up" label="Strength Progression" subtitle="Track your lifts over time" color="#6366F1" onPress={() => goToAnalytics('StrengthProgression')} />
                        <NavCard icon="bar-chart-outline" label="Volume Analytics" subtitle="Weekly and monthly volume" color="#3B82F6" onPress={() => goToAnalytics('VolumeAnalytics')} />
                        <NavCard icon="body-outline" label="Muscle Heatmap" subtitle="Muscle group distribution" color="#EC4899" onPress={() => goToAnalytics('MuscleHeatmap')} />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim }]}> 
                    <SectionHeader title="Body Tracking" onViewAll={() => goToBodyTracking('BodyTrackingHub')} />
                    <View style={styles.navCardList}>
                        <NavCard icon="scale-outline" label="Weight Log" subtitle="Track weight over time" color="#10B981" onPress={() => goToBodyTracking('WeightLog')} />
                        <NavCard icon="resize-outline" label="Measurements" subtitle="Body measurements" color="#14B8A6" onPress={() => goToBodyTracking('Measurements')} />
                        <NavCard icon="camera-outline" label="Progress Photos" subtitle="Visual progress timeline" color="#8B5CF6" onPress={() => goToBodyTracking('ProgressPhotos')} />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim }]}> 
                    <SectionHeader title="AI Coach" />
                    <TouchableOpacity style={[styles.coachCard, { backgroundColor: colors.primary.main }]} onPress={() => goToCoach('CoachHub')} activeOpacity={0.9}>
                        <View style={styles.coachContent}>
                            <View>
                                <Text style={styles.coachLabel}>AI-POWERED</Text>
                                <Text style={styles.coachTitle}>Your Personal Coach</Text>
                                <Text style={styles.coachSub}>Get personalized guidance, feedback, and training recommendations.</Text>
                            </View>
                            <View style={styles.coachIconBg}>
                                <Ionicons name="sparkles" size={28} color="#FFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim }]}> 
                    <SectionHeader title="Settings" />
                    <View style={styles.navCardList}>
                        <NavCard icon="settings-outline" label="App Settings" subtitle="Notifications, units, theme" color="#6B7280" onPress={() => goToSettings('Settings')} />
                        <NavCard icon="lock-closed-outline" label="Account and Security" subtitle="Password and privacy" color="#EF4444" onPress={() => goToSettings('AccountSecurity')} />
                        <NavCard icon="help-circle-outline" label="Help and Support" subtitle="FAQ and contact" color="#6B7280" onPress={() => goToSettings('HelpSupport')} />
                    </View>
                </Animated.View>

                <TouchableOpacity style={[styles.logoutBtn, { borderColor: `${colors.error}40` }]} activeOpacity={0.7} onPress={handleLogout} disabled={logoutMutation.isPending}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>{logoutMutation.isPending ? 'Logging out...' : 'Log Out'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroGradient: { paddingHorizontal: 20, paddingBottom: 28 },
    heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    heroPageTitle: { fontSize: 22, fontWeight: '800' },
    heroIconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    heroBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    avatarWrapper: { position: 'relative' },
    avatarRing: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    avatarInner: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 30, fontWeight: '800' },
    levelBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#262626' },
    levelBadgeText: { fontSize: 11, fontWeight: '800', color: '#FAFAFA' },
    heroInfo: { flex: 1, gap: 4 },
    heroName: { fontSize: 22, fontWeight: '800' },
    heroHandle: { fontSize: 14 },
    streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    streakPillText: { fontSize: 13, fontWeight: '600' },
    achievementPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    achievementPillText: { fontSize: 12, fontWeight: '600' },
    xpSection: { gap: 8 },
    xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    xpLevelText: { fontSize: 13, fontWeight: '700' },
    xpValueText: { fontSize: 12 },
    xpBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    xpBarFill: { height: '100%', borderRadius: 4 },

    statsStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#737373', fontWeight: '500' },
    statDivider: { width: 1, height: 32, marginHorizontal: 4 },

    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    viewAllText: { fontSize: 13, fontWeight: '600' },
    heatmapCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, overflow: 'hidden' },

    calendarToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
    },
    calendarToggleText: { fontSize: 13, fontWeight: '600', flex: 1 },

    analyticsSummaryRow: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 12 },
    analyticsMiniCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
    analyticsValue: { fontSize: 16, fontWeight: '800' },
    analyticsLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },

    navCardList: { gap: 8 },
    navCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
    navCardIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    navCardText: { flex: 1 },
    navCardLabel: { fontSize: 15, fontWeight: '700' },
    navCardSub: { fontSize: 12, marginTop: 2 },

    coachCard: { borderRadius: 18, overflow: 'hidden', padding: 20 },
    coachContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    coachLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 4 },
    coachTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA', marginBottom: 6 },
    coachSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 220, lineHeight: 18 },
    coachIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 16, marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1 },
    logoutText: { fontSize: 16, fontWeight: '700' },
});
