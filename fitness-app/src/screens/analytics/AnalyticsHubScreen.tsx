import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useColors, useDashboardStats } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { AnalyticsNavigationProp } from '../../navigation/types';
import { NavigationBar, StatCard, ListItem, Chip } from '../../components/ui';

const { width } = Dimensions.get('window');

type Period = '7D' | '30D' | '90D';

type RecentWorkout = {
    id: string;
    name: string;
    date: string;
    volume: number;
    prCount: number;
};

const STRENGTH_TREND = [
    { value: 195, label: 'Jan' }, { value: 200, label: '' }, { value: 205, label: 'Feb' },
    { value: 205, label: '' }, { value: 210, label: 'Mar' }, { value: 215, label: '' }, { value: 220, label: 'Apr' }
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const buildVolumeSeries = (workouts: RecentWorkout[], period: Period) => {
    const now = startOfDay(new Date());
    const series =
        period === '7D'
            ? Array.from({ length: 7 }, (_, i) => {
                const day = addDays(now, i - 6);
                return { label: DAY_LABELS[day.getDay()], value: 0, date: day };
            })
            : period === '30D'
                ? Array.from({ length: 4 }, (_, i) => {
                    const start = addDays(now, -27 + i * 7);
                    return { label: `W${i + 1}`, value: 0, date: start };
                })
                : Array.from({ length: 3 }, (_, i) => {
                    const start = addDays(now, -89 + i * 30);
                    return { label: `M${i + 1}`, value: 0, date: start };
                });

    const startDate = series[0]?.date ? startOfDay(series[0].date) : now;

    workouts.forEach((workout) => {
        const workoutDate = startOfDay(new Date(workout.date));
        if (Number.isNaN(workoutDate.getTime()) || workoutDate < startDate || workoutDate > now) return;

        if (period === '7D') {
            const index = Math.floor((workoutDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
            if (index >= 0 && index < series.length) {
                series[index].value += Number(workout.volume || 0);
            }
            return;
        }

        if (period === '30D') {
            const index = Math.floor((workoutDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (index >= 0 && index < series.length) {
                series[index].value += Number(workout.volume || 0);
            }
            return;
        }

        const index = Math.floor((workoutDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
        if (index >= 0 && index < series.length) {
            series[index].value += Number(workout.volume || 0);
        }
    });

    return series.map(({ label, value }) => ({ label, value }));
};

const NAV_CARDS = [
    { id: 'strength', title: 'Strength Progression', subtitle: 'Track your 1RM gains', icon: 'trending-up', color: '#6366F1', route: 'StrengthProgression' },
    { id: 'volume', title: 'Volume Analytics', subtitle: 'Weekly & monthly trends', icon: 'bar-chart', color: '#10B981', route: 'VolumeAnalytics' },
    { id: 'muscles', title: 'Muscle Distribution', subtitle: 'Balance & recovery', icon: 'body', color: '#EC4899', route: 'MuscleDistribution' },
    { id: 'records', title: 'Personal Records', subtitle: 'All-time achievements', icon: 'trophy', color: '#F59E0B', route: 'PersonalRecords' },
];

export function AnalyticsHubScreen() {
    const navigation = useNavigation<AnalyticsNavigationProp>();
    const colors = useColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [period, setPeriod] = useState<Period>('7D');
    const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats();

    const recentWorkouts = useMemo<RecentWorkout[]>(
        () => dashboardStats?.recentWorkouts || [],
        [dashboardStats?.recentWorkouts],
    );

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const chartColors = {
        primary: colors.primary.main,
        grid: colors.border,
        axis: colors.mutedForeground,
        gradientStart: `${colors.primary.main}80`,
        gradientEnd: `${colors.primary.main}00`,
    };

    const currentChartData = useMemo(
        () => buildVolumeSeries(recentWorkouts, period),
        [recentWorkouts, period],
    );
    const totalCurrentVolume = currentChartData.reduce((a, b) => a + b.value, 0);
    const quickStats = useMemo(() => {
        const totalVolume = recentWorkouts.reduce((sum, workout) => sum + Number(workout.volume || 0), 0);
        const totalPRs = recentWorkouts.reduce((sum, workout) => sum + Number(workout.prCount || 0), 0);
        const streakDays = dashboardStats?.streak?.current || 0;

        return {
            streak: `${streakDays} Days`,
            totalVolume,
            prsThisMonth: totalPRs,
        };
    }, [dashboardStats?.streak?.current, recentWorkouts]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="Analytics"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'share-outline', onPress: () => {}, label: 'Share' }]}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Stats Row */}
                <Animated.View style={[styles.quickStatsRow, { opacity: fadeAnim }]}>
                    <StatCard
                        value={isStatsLoading ? 0 : parseInt(quickStats.streak) || 0}
                        label="Streak"
                        suffix=" days"
                        icon="flame"
                        type="warning"
                        compact
                        style={styles.quickStatCard}
                    />
                    <StatCard
                        value={isStatsLoading ? 0 : Math.round(quickStats.totalVolume / 1000)}
                        label="Volume"
                        suffix="k"
                        icon="barbell"
                        type="primary"
                        compact
                        style={styles.quickStatCard}
                    />
                    <StatCard
                        value={isStatsLoading ? 0 : quickStats.prsThisMonth}
                        label="PRs"
                        icon="trophy"
                        type="success"
                        compact
                        style={styles.quickStatCard}
                    />
                </Animated.View>

                {/* Weekly Overview Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Volume Snapshot</Text>
                        <View style={styles.periodSelector}>
                            {(['7D', '30D', '90D'] as const).map((p) => (
                                <Chip
                                    key={p}
                                    label={p}
                                    size="sm"
                                    selected={period === p}
                                    onPress={() => setPeriod(p)}
                                />
                            ))}
                        </View>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.chartHeader}>
                            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>Total Volume ({period})</Text>
                            <Text style={[styles.chartValue, { color: colors.foreground }]}>
                                {(totalCurrentVolume / 1000).toFixed(1)}k lbs
                            </Text>
                        </View>
                        <BarChart
                            data={currentChartData.map(d => ({
                                value: d.value / 1000,
                                label: d.label,
                                frontColor: d.value > 0 ? colors.primary.main : colors.border,
                                topLabelComponent: () => null,
                            }))}
                            width={width - 80}
                            height={160}
                            barWidth={period === '7D' ? 28 : period === '30D' ? 40 : 50}
                            spacing={period === '7D' ? 16 : period === '30D' ? 24 : 35}
                            noOfSections={4}
                            barBorderRadius={8}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                            isAnimated
                            animationDuration={600}
                        />
                    </View>
                </View>

                {/* Strength Trend Mini */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bench Press Trend</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('StrengthProgression' as never)}>
                            <Text style={[styles.seeAllText, { color: colors.primary.main }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.chartHeader}>
                            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>Est. 1RM</Text>
                            <View style={styles.trendRow}>
                                <Text style={[styles.chartValue, { color: colors.foreground }]}>220 lbs</Text>
                                <View style={[styles.trendBadge, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="arrow-up" size={12} color={colors.success} />
                                    <Text style={[styles.trendText, { color: colors.success }]}>+12%</Text>
                                </View>
                            </View>
                        </View>
                        <LineChart
                            data={STRENGTH_TREND}
                            width={width - 80}
                            height={140}
                            color={colors.primary.main}
                            thickness={3}
                            hideDataPoints={false}
                            dataPointsColor={colors.primary.main}
                            dataPointsRadius={4}
                            curved
                            areaChart
                            startFillColor={chartColors.gradientStart}
                            endFillColor={chartColors.gradientEnd}
                            startOpacity={0.6}
                            endOpacity={0.05}
                            hideRules
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                            pointerConfig={{
                                pointerStripHeight: 140,
                                pointerStripColor: colors.primary.main,
                                pointerStripWidth: 2,
                                pointerColor: colors.primary.main,
                                radius: 6,
                                pointerLabelWidth: 80,
                                pointerLabelHeight: 30,
                                activatePointersOnLongPress: true,
                                autoAdjustPointerLabelPosition: true,
                                pointerLabelComponent: (items: any) => {
                                    return (
                                        <View style={{
                                            backgroundColor: colors.card,
                                            padding: 6,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            left: -20,
                                        }}>
                                            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>{items[0].value} lbs</Text>
                                        </View>
                                    );
                                },
                            }}
                            isAnimated
                            animationDuration={800}
                        />
                    </View>
                </View>

                {/* Navigation Cards */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Explore Analytics</Text>
                    {NAV_CARDS.map((card, index) => (
                        <Animated.View
                            key={card.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20 + index * 5, 0]
                                    })
                                }]
                            }}
                        >
                            <ListItem
                                title={card.title}
                                subtitle={card.subtitle}
                                icon={card.icon as any}
                                iconColor={card.color}
                                showChevron
                                onPress={() => navigation.navigate(card.route as any)}
                                style={{ marginBottom: 8 }}
                            />
                        </Animated.View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    quickStatsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 12 },
    quickStatCard: { flex: 1, paddingVertical: 18, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    quickStatIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    quickStatValue: { fontSize: 26, fontWeight: '800', fontFamily: fontFamilies.mono },
    quickStatLabel: { fontSize: 13, marginTop: 4 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    seeAllText: { fontSize: 14, fontWeight: '600' },
    periodSelector: { flexDirection: 'row', gap: 4 },
    periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    periodText: { fontSize: 13, fontWeight: '600' },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: 'hidden' },
    chartHeader: { marginBottom: 16 },
    chartLabel: { fontSize: 13, marginBottom: 4 },
    chartValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 4 },
    trendText: { fontSize: 13, fontWeight: '700' },
    navCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 16 },
    navIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    navContent: { flex: 1 },
    navTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    navSubtitle: { fontSize: 14 },
});
