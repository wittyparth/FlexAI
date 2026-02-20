import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - Volume by time period and muscle group
// ============================================================
const VOLUME_DATA: Record<string, any[]> = {
    '4W': [
        { label: 'W1', chest: 12, back: 10, legs: 8, shoulders: 6, arms: 5 },
        { label: 'W2', chest: 14, back: 12, legs: 10, shoulders: 7, arms: 6 },
        { label: 'W3', chest: 11, back: 11, legs: 12, shoulders: 8, arms: 5 },
        { label: 'W4', chest: 15, back: 13, legs: 9, shoulders: 7, arms: 7 },
    ],
    '12W': [
        { label: 'M1', chest: 45, back: 40, legs: 35, shoulders: 25, arms: 20 },
        { label: 'M2', chest: 48, back: 44, legs: 38, shoulders: 28, arms: 22 },
        { label: 'M3', chest: 52, back: 46, legs: 39, shoulders: 28, arms: 23 },
    ],
    '6M': [
        { label: 'Jul', chest: 43, back: 40, legs: 35, shoulders: 25, arms: 20 },
        { label: 'Aug', chest: 45, back: 41, legs: 36, shoulders: 26, arms: 21 },
        { label: 'Sep', chest: 48, back: 44, legs: 38, shoulders: 28, arms: 22 },
        { label: 'Oct', chest: 50, back: 45, legs: 40, shoulders: 29, arms: 23 },
        { label: 'Nov', chest: 49, back: 44, legs: 39, shoulders: 28, arms: 24 },
        { label: 'Dec', chest: 52, back: 46, legs: 39, shoulders: 28, arms: 23 },
    ]
};

const MUSCLE_BREAKDOWN = [
    { name: 'Chest', volume: 52340, percentage: 25, color: '#6366F1', icon: 'chess-knight' },
    { name: 'Back', volume: 41800, percentage: 22, color: '#10B981', icon: 'human-male-height-variant' },
    { name: 'Legs', volume: 35600, percentage: 18, color: '#EC4899', icon: 'run' },
    { name: 'Shoulders', volume: 28000, percentage: 15, color: '#F59E0B', icon: 'yoga' },
    { name: 'Arms', volume: 23400, percentage: 12, color: '#8B5CF6', icon: 'arm-flex' },
    { name: 'Core', volume: 15200, percentage: 8, color: '#14B8A6', icon: 'human' },
];

const WEEKLY_TOTALS = [
    { label: 'Current Week', value: 51000, change: 8.5 },
    { label: 'Last Week', value: 47000, change: -4.1 },
    { label: '2 Weeks Ago', value: 49000, change: 19.5 },
    { label: '3 Weeks Ago', value: 41000, change: 0 },
];

export function VolumeAnalyticsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [period, setPeriod] = useState('4W');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const totalVolume = MUSCLE_BREAKDOWN.reduce((sum, m) => sum + m.volume, 0);
    const weeklyAvg = totalVolume / 4;

    // Prepare stacked bar data
    const currentData = VOLUME_DATA[period];
    const stackedData = currentData.map((dataPoint) => ({
        stacks: [
            { value: dataPoint.chest, color: '#6366F1' },
            { value: dataPoint.back, color: '#10B981' },
            { value: dataPoint.legs, color: '#EC4899' },
            { value: dataPoint.shoulders, color: '#F59E0B' },
            { value: dataPoint.arms, color: '#8B5CF6' },
        ],
        label: dataPoint.label,
    }));

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Volume</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <Animated.View style={[styles.summaryRow, { opacity: fadeAnim }]}>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>This Month</Text>
                        <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                            {(totalVolume / 1000).toFixed(1)}k
                        </Text>
                        <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>lbs total</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Weekly Avg</Text>
                        <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                            {(weeklyAvg / 1000).toFixed(1)}k
                        </Text>
                        <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>lbs/week</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.trendBadge, { backgroundColor: `${colors.success}15` }]}>
                            <Ionicons name="trending-up" size={14} color={colors.success} />
                        </View>
                        <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>vs Last Month</Text>
                        <Text style={[styles.summaryValue, { color: colors.success }]}>+12%</Text>
                    </View>
                </Animated.View>

                {/* Stacked Bar Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trend</Text>
                        <View style={styles.periodSelector}>
                            {['4W', '12W', '6M'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.periodBtn, period === p && { backgroundColor: `${colors.primary.main}20` }]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text style={[styles.periodText, { color: period === p ? colors.primary.main : colors.mutedForeground }]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <BarChart
                            stackData={stackedData}
                            width={width - 80}
                            height={180}
                            barWidth={period === '4W' ? 40 : period === '12W' ? 55 : 30}
                            spacing={period === '4W' ? 30 : period === '12W' ? 40 : 18}
                            noOfSections={4}
                            barBorderRadius={6}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '500' }}
                            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                            isAnimated
                            animationDuration={800}
                            pointerConfig={{
                                pointerStripHeight: 180,
                                pointerStripColor: colors.foreground,
                                pointerStripWidth: 2,
                                pointerColor: colors.foreground,
                                activatePointersOnLongPress: true,
                                autoAdjustPointerLabelPosition: true,
                                pointerLabelComponent: (items: any) => {
                                    // Calculate total directly for the tooltip
                                    const stackTotal = items[0].stacks?.reduce((sum: number, stack: any) => sum + stack.value, 0) || 0;
                                    return (
                                        <View style={{
                                            backgroundColor: colors.card,
                                            padding: 8,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                            left: -20,
                                        }}>
                                            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '700' }}>
                                                Total: {stackTotal.toFixed(1)}k
                                            </Text>
                                        </View>
                                    );
                                },
                            }}
                        />
                        {/* Legend */}
                        <View style={styles.legend}>
                            {MUSCLE_BREAKDOWN.slice(0, 5).map((muscle) => (
                                <View key={muscle.name} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: muscle.color }]} />
                                    <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{muscle.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Muscle Group Breakdown */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>By Muscle Group</Text>
                    {MUSCLE_BREAKDOWN.map((muscle, index) => (
                        <Animated.View
                            key={muscle.name}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [15 + index * 3, 0]
                                    })
                                }]
                            }}
                        >
                            <View style={[styles.muscleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.muscleIcon, { backgroundColor: `${muscle.color}15` }]}>
                                    <MaterialCommunityIcons name={muscle.icon as any} size={22} color={muscle.color} />
                                </View>
                                <View style={styles.muscleInfo}>
                                    <View style={styles.muscleHeader}>
                                        <Text style={[styles.muscleName, { color: colors.foreground }]}>{muscle.name}</Text>
                                        <Text style={[styles.muscleVolume, { color: colors.foreground }]}>
                                            {(muscle.volume / 1000).toFixed(1)}k lbs
                                        </Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                            <ViewCC`] as [string, string]}
                                                style={[styles.progressFill, { width: `${muscle.percentage}%` }]}
                                            />
                                        </View>
                                        <Text style={[styles.percentText, { color: colors.mutedForeground }]}>{muscle.percentage}%</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Week over Week Comparison */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Week over Week</Text>
                    <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {WEEKLY_TOTALS.map((week, index) => (
                            <View key={week.label} style={[styles.weekRow, index < WEEKLY_TOTALS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                <Text style={[styles.weekLabel, { color: colors.foreground }]}>{week.label}</Text>
                                <Text style={[styles.weekValue, { color: colors.foreground }]}>
                                    {(week.value / 1000).toFixed(1)}k lbs
                                </Text>
                                {week.change !== 0 && (
                                    <View style={[styles.changeBadge, { backgroundColor: week.change > 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                                        <Ionicons name={week.change > 0 ? 'arrow-up' : 'arrow-down'} size={12} color={week.change > 0 ? colors.success : colors.error} />
                                        <Text style={{ color: week.change > 0 ? colors.success : colors.error, fontSize: 12, fontWeight: '600' }}>
                                            {Math.abs(week.change)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
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
    summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 10 },
    summaryCard: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center', position: 'relative' },
    summaryLabel: { fontSize: 12, marginBottom: 6 },
    summaryValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    summaryUnit: { fontSize: 11, marginTop: 2 },
    trendBadge: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    periodSelector: { flexDirection: 'row', gap: 4 },
    periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    periodText: { fontSize: 12, fontWeight: '600' },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: 'hidden' },
    legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12 },
    muscleCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    muscleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    muscleInfo: { flex: 1 },
    muscleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    muscleName: { fontSize: 16, fontWeight: '600' },
    muscleVolume: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.mono },
    progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    progressBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    percentText: { fontSize: 13, fontWeight: '600', width: 36 },
    comparisonCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    weekRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    weekLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    weekValue: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.mono },
    changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4, marginLeft: 10 },
});
