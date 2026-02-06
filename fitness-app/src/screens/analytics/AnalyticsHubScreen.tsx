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
import { LinearGradient } from 'expo-linear-gradient';
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
const WEEKLY_VOLUME = [
    { value: 42000, label: 'Mon' },
    { value: 38000, label: 'Tue' },
    { value: 0, label: 'Wed' },
    { value: 52000, label: 'Thu' },
    { value: 0, label: 'Fri' },
    { value: 48000, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

const STRENGTH_TREND = [
    { value: 195, dataPointText: '' },
    { value: 200, dataPointText: '' },
    { value: 205, dataPointText: '' },
    { value: 205, dataPointText: '' },
    { value: 210, dataPointText: '' },
    { value: 215, dataPointText: '' },
    { value: 220, dataPointText: '' },
];

const QUICK_STATS = {
    pr: "+15%",
    volume: "42.5 tons",
    consistency: "92%",
    strength: "Elite",
    streak: "5 Days" // Added missing property
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
    const [period, setPeriod] = useState('7D');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const chartColors = {
        primary: colors.primary.main,
        grid: colors.border,
        axis: colors.mutedForeground,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>My Stats</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="settings-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Stats Row */}
                <Animated.View style={[styles.quickStatsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.quickStatIcon, { backgroundColor: `${colors.stats.streak}15` }]}>
                            <MaterialCommunityIcons name="fire" size={22} color={colors.stats.streak} />
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
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This Week</Text>
                        <View style={styles.periodSelector}>
                            {['7D', '30D', '90D'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[
                                        styles.periodBtn,
                                        period === p && { backgroundColor: colors.primary.main }
                                    ]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text style={[
                                        styles.periodText,
                                        { color: period === p ? '#FFF' : colors.mutedForeground }
                                    ]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.chartHeader}>
                            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>Total Volume</Text>
                            <Text style={[styles.chartValue, { color: colors.foreground }]}>
                                {(WEEKLY_VOLUME.reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k lbs
                            </Text>
                        </View>
                        <BarChart
                            data={WEEKLY_VOLUME.map(d => ({
                                value: d.value / 1000,
                                label: d.label,
                                frontColor: d.value > 0 ? colors.primary.main : colors.muted,
                                topLabelComponent: () => null,
                            }))}
                            width={width - 80}
                            height={150}
                            barWidth={28}
                            spacing={16}
                            noOfSections={4}
                            barBorderRadius={8}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                            isAnimated
                        />
                    </View>
                </View>

                {/* Strength Trend Mini */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bench Press Trend</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('StrengthProgression')}>
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
                            height={120}
                            color={colors.primary.main}
                            thickness={3}
                            hideDataPoints={false}
                            dataPointsColor={colors.primary.main}
                            dataPointsRadius={5}
                            curved
                            areaChart
                            startFillColor={colors.primary.main}
                            endFillColor={colors.background}
                            startOpacity={0.3}
                            endOpacity={0}
                            hideRules
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideYAxisText
                            isAnimated
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700' },
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
