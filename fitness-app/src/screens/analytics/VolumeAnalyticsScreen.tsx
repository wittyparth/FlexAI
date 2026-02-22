import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { NavigationBar, Button, Chip } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useVolumeStats } from '../../hooks/queries/useStatsQueries';
import { VolumeTimeframe } from '../../api/stats.api';

const { width } = Dimensions.get('window');

type Bucket = {
    key: string;
    label: string;
    total: number;
};

const formatCompactVolume = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
};

const toDateKey = (date: Date) => date.toISOString().split('T')[0];

const buildBuckets = (timeframe: VolumeTimeframe, trend: Array<{ date: string; volume: number }>): Bucket[] => {
    const map = new Map<string, number>();
    trend.forEach((entry) => {
        map.set(entry.date, (map.get(entry.date) ?? 0) + (entry.volume ?? 0));
    });

    const now = new Date();

    if (timeframe === 'week') {
        const buckets: Bucket[] = [];
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = toDateKey(d);
            buckets.push({
                key,
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                total: map.get(key) ?? 0,
            });
        }
        return buckets;
    }

    if (timeframe === 'month') {
        const buckets: Bucket[] = [];
        for (let i = 3; i >= 0; i -= 1) {
            const start = new Date(now);
            start.setDate(now.getDate() - (i * 7 + 6));
            const end = new Date(now);
            end.setDate(now.getDate() - i * 7);

            let total = 0;
            map.forEach((volume, key) => {
                const date = new Date(key);
                if (date >= start && date <= end) total += volume;
            });

            buckets.push({
                key: `week-${i}`,
                label: `W${4 - i}`,
                total,
            });
        }
        return buckets;
    }

    const buckets: Bucket[] = [];
    for (let i = 11; i >= 0; i -= 1) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = monthDate.getMonth();
        const year = monthDate.getFullYear();

        let total = 0;
        map.forEach((volume, key) => {
            const date = new Date(key);
            if (date.getMonth() === month && date.getFullYear() === year) total += volume;
        });

        buckets.push({
            key: `${year}-${month}`,
            label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
            total,
        });
    }

    return buckets;
};

export function VolumeAnalyticsScreen({ navigation }: any) {
    const colors = useColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [period, setPeriod] = useState<VolumeTimeframe>('month');

    const { data, isLoading, isError, refetch } = useVolumeStats(period);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim, period]);

    const totalVolume = data?.totalVolume ?? 0;
    const workoutCount = data?.workoutCount ?? 0;
    const averagePerWorkout = workoutCount > 0 ? totalVolume / workoutCount : 0;

    const buckets = useMemo(() => buildBuckets(period, data?.trend ?? []), [data?.trend, period]);

    const trendPercent = useMemo(() => {
        if (buckets.length < 2) return 0;
        const previous = buckets[buckets.length - 2].total;
        const latest = buckets[buckets.length - 1].total;
        if (previous <= 0) return latest > 0 ? 100 : 0;
        return ((latest - previous) / previous) * 100;
    }, [buckets]);

    const topBuckets = useMemo(() => {
        return [...buckets]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [buckets]);

    const chartData = useMemo(
        () =>
            buckets.map((bucket) => ({
                value: Number(bucket.total.toFixed(0)),
                label: bucket.label,
                frontColor: colors.primary.main,
            })),
        [buckets, colors.primary.main],
    );

    const chartWidth = width - 80;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <NavigationBar
                title="Volume"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'refresh', onPress: () => refetch(), label: 'Refresh' }]}
            />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isError ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load volume stats.</Text>
                    <Button title="Retry" onPress={() => refetch()} size="sm" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.summaryRow, { opacity: fadeAnim }]}> 
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Volume</Text>
                            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatCompactVolume(totalVolume)}</Text>
                            <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>kg</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Avg / Workout</Text>
                            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatCompactVolume(averagePerWorkout)}</Text>
                            <Text style={[styles.summaryUnit, { color: colors.mutedForeground }]}>kg</Text>
                        </View>
                        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.trendBadge, { backgroundColor: trendPercent >= 0 ? `${colors.success}15` : `${colors.error}15` }]}> 
                                <Ionicons name={trendPercent >= 0 ? 'trending-up' : 'trending-down'} size={14} color={trendPercent >= 0 ? colors.success : colors.error} />
                            </View>
                            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Latest Period</Text>
                            <Text style={[styles.summaryValue, { color: trendPercent >= 0 ? colors.success : colors.error }]}>
                                {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
                            </Text>
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trend</Text>
                            <View style={styles.periodSelector}>
                                {([
                                    { key: 'week', label: '7D' },
                                    { key: 'month', label: '30D' },
                                    { key: 'year', label: '1Y' },
                                ] as const).map((item) => (
                                    <Chip
                                        key={item.key}
                                        label={item.label}
                                        selected={period === item.key}
                                        onPress={() => setPeriod(item.key)}
                                        size="sm"
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {chartData.length === 0 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No completed-workout volume data for this period.</Text>
                            ) : (
                                <BarChart
                                    data={chartData}
                                    width={chartWidth}
                                    height={190}
                                    barWidth={period === 'year' ? 16 : 28}
                                    spacing={period === 'year' ? 12 : 24}
                                    noOfSections={4}
                                    barBorderRadius={6}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '500' }}
                                    yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                                    hideRules
                                    isAnimated
                                    animationDuration={700}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Top Periods</Text>
                        {topBuckets.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No data to rank yet.</Text>
                        ) : (
                            topBuckets.map((bucket, index) => (
                                <Animated.View
                                    key={bucket.key}
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{
                                            translateY: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [12 + index * 2, 0],
                                            }),
                                        }],
                                    }}
                                >
                                    <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                        <View style={[styles.rankBadge, { backgroundColor: `${colors.primary.main}15` }]}> 
                                            <Text style={[styles.rankText, { color: colors.primary.main }]}>{index + 1}</Text>
                                        </View>
                                        <Text style={[styles.listLabel, { color: colors.foreground }]}>{bucket.label}</Text>
                                        <Text style={[styles.listValue, { color: colors.foreground }]}>{formatCompactVolume(bucket.total)} kg</Text>
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Recent Comparison</Text>
                        <View style={[styles.comparisonCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {buckets.slice(-4).map((bucket, index, arr) => {
                                const prev = index > 0 ? arr[index - 1] : undefined;
                                const change = prev && prev.total > 0 ? ((bucket.total - prev.total) / prev.total) * 100 : 0;
                                return (
                                    <View key={bucket.key} style={[styles.weekRow, index < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}> 
                                        <Text style={[styles.weekLabel, { color: colors.foreground }]}>{bucket.label}</Text>
                                        <Text style={[styles.weekValue, { color: colors.foreground }]}>{formatCompactVolume(bucket.total)} kg</Text>
                                        {index > 0 && (
                                            <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? `${colors.success}15` : `${colors.error}15` }]}> 
                                                <Ionicons name={change >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={change >= 0 ? colors.success : colors.error} />
                                                <Text style={{ color: change >= 0 ? colors.success : colors.error, fontSize: 12, fontWeight: '600' }}>
                                                    {Math.abs(change).toFixed(1)}%
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    retryBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    retryText: { color: '#FFF', fontWeight: '700' },
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
    emptyText: { fontSize: 14, textAlign: 'center' },
    listCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 12 },
    rankBadge: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rankText: { fontSize: 14, fontWeight: '800', fontFamily: fontFamilies.mono },
    listLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
    listValue: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.mono },
    comparisonCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    weekRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    weekLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
    weekValue: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.mono },
    changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4, marginLeft: 10 },
});
