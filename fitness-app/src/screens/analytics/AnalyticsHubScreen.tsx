import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors as themeColors } from '../../theme/colors';
import { AnalyticsNavigationProp } from '../../navigation/types';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const WEEKLY_VOLUME = {
    '7D': [
        { value: 42000, label: 'Mon' }, { value: 38000, label: 'Tue' }, { value: 0, label: 'Wed' },
        { value: 52000, label: 'Thu' }, { value: 0, label: 'Fri' }, { value: 48000, label: 'Sat' }, { value: 55000, label: 'Sun' },
    ],
    '30D': [
        { value: 152000, label: 'Week 1' }, { value: 148000, label: 'Week 2' },
        { value: 165000, label: 'Week 3' }, { value: 180000, label: 'Week 4' }
    ],
    '90D': [
        { value: 650000, label: 'Month 1' }, { value: 720000, label: 'Month 2' }, { value: 810000, label: 'Month 3' }
    ]
};

const STRENGTH_TREND = [
    { value: 195, label: 'Jan' }, { value: 200, label: '' }, { value: 205, label: 'Feb' },
    { value: 205, label: '' }, { value: 210, label: 'Mar' }, { value: 215, label: '' }, { value: 220, label: 'Apr' }
];

const QUICK_STATS = {
    prsThisMonth: 8,
    totalVolume: 840000,
    streak: "5 Days"
};

const NAV_CARDS = [
    { id: 'strength', title: 'Strength Progression', subtitle: 'Track your 1RM gains', icon: 'trending-up', color: '#6366F1', route: 'StrengthProgression' },
    { id: 'volume', title: 'Volume Analytics', subtitle: 'Weekly & monthly trends', icon: 'bar-chart', color: '#10B981', route: 'VolumeAnalytics' },
    { id: 'muscles', title: 'Muscle Distribution', subtitle: 'Balance & recovery', icon: 'body', color: '#EC4899', route: 'MuscleDistribution' },
    { id: 'records', title: 'Personal Records', subtitle: 'All-time achievements', icon: 'trophy', color: '#F59E0B', route: 'PersonalRecords' },
];

export function AnalyticsHubScreen() { // Renamed function and removed navigation prop
    const navigation = useNavigation<AnalyticsNavigationProp>(); // Added navigation hook
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [period, setPeriod] = useState<'7D' | '30D' | '90D'>('7D');

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

    const currentChartData = WEEKLY_VOLUME[period];
    const totalCurrentVolume = currentChartData.reduce((a, b) => a + b.value, 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Analytics</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Stats Row */}
                <Animated.View style={[styles.quickStatsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: `${colors.stats.consistency}15` }]}>
                            <MaterialCommunityIcons name="fire" size={22} color={colors.stats.consistency} />
                        </View>
                        <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{QUICK_STATS.streak}</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Streak</Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                            <MaterialCommunityIcons name="weight" size={22} color={colors.primary.main} />
                        </View>
                        <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{(QUICK_STATS.totalVolume / 1000).toFixed(1)}k</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>Volume</Text>
                    </View>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: `${colors.stats.pr}15` }]}>
                            <MaterialCommunityIcons name="trophy" size={22} color={colors.stats.pr} />
                        </View>
                        <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{QUICK_STATS.prsThisMonth}</Text>
                        <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>PRs</Text>
                    </View>
                </Animated.View>

                {/* Weekly Overview Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Volume Snapshot</Text>
                        <View style={styles.periodSelector}>
                            {(['7D', '30D', '90D'] as const).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.periodBtn,
                                        period === p && { backgroundColor: `${colors.primary.main}20` }
                                    ]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text style={[
                                        styles.periodText,
                                        { color: period === p ? colors.primary.main : colors.mutedForeground }
                                    ]}>{p}</Text>
                                </TouchableOpacity>
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
                            <TouchableOpacity
                                style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => navigation.navigate(card.route as any)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.navIcon, { backgroundColor: `${card.color}15` }]}>
                                    <Ionicons name={card.icon as any} size={24} color={card.color} />
                                </View>
                                <View style={styles.navContent}>
                                    <Text style={[styles.navTitle, { color: colors.foreground }]}>{card.title}</Text>
                                    <Text style={[styles.navSubtitle, { color: colors.mutedForeground }]}>{card.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={22} color={colors.mutedForeground} />
                            </TouchableOpacity>
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
