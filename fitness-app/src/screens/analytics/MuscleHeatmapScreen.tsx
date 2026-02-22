import React, { useRef, useEffect, useMemo, useState } from 'react';
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
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useMuscleDistribution } from '../../hooks/queries/useStatsQueries';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';

const { width } = Dimensions.get('window');
const SQUARE_SIZE = (width - 80) / 3;

const GROUP_ALIASES: Record<string, string[]> = {
    Chest: ['chest', 'pecs', 'pectorals'],
    Back: ['back', 'lats', 'latissimus', 'traps', 'trapezius', 'rhomboids', 'erectors'],
    Shoulders: ['shoulders', 'shoulder', 'delts', 'delt'],
    Legs: ['legs', 'leg', 'quadriceps', 'quads', 'hamstrings', 'glutes', 'calves', 'calf', 'adductors'],
    Arms: ['arms', 'arm', 'biceps', 'triceps', 'forearms', 'forearm'],
    Core: ['core', 'abs', 'abdominals', 'obliques'],
};

type GroupIntensity = {
    name: string;
    value: number;
    percentage: number;
    intensity: number;
};

type HeatCell = {
    id: string;
    name: string;
    group: keyof typeof GROUP_ALIASES;
    row: number;
    col: number;
};

const FRONT_CELLS: HeatCell[] = [
    { id: 'front-shoulder-l', name: 'L Shoulder', group: 'Shoulders', row: 0, col: 0 },
    { id: 'front-chest', name: 'Chest', group: 'Chest', row: 0, col: 1 },
    { id: 'front-shoulder-r', name: 'R Shoulder', group: 'Shoulders', row: 0, col: 2 },
    { id: 'front-arm-l', name: 'L Arm', group: 'Arms', row: 1, col: 0 },
    { id: 'front-core', name: 'Core', group: 'Core', row: 1, col: 1 },
    { id: 'front-arm-r', name: 'R Arm', group: 'Arms', row: 1, col: 2 },
    { id: 'front-leg-l', name: 'L Leg', group: 'Legs', row: 2, col: 0 },
    { id: 'front-abs', name: 'Abs', group: 'Core', row: 2, col: 1 },
    { id: 'front-leg-r', name: 'R Leg', group: 'Legs', row: 2, col: 2 },
];

const BACK_CELLS: HeatCell[] = [
    { id: 'back-shoulder-l', name: 'L Rear Delt', group: 'Shoulders', row: 0, col: 0 },
    { id: 'back-upper', name: 'Upper Back', group: 'Back', row: 0, col: 1 },
    { id: 'back-shoulder-r', name: 'R Rear Delt', group: 'Shoulders', row: 0, col: 2 },
    { id: 'back-lat-l', name: 'L Lat', group: 'Back', row: 1, col: 0 },
    { id: 'back-mid', name: 'Lower Back', group: 'Back', row: 1, col: 1 },
    { id: 'back-lat-r', name: 'R Lat', group: 'Back', row: 1, col: 2 },
    { id: 'back-leg-l', name: 'L Posterior', group: 'Legs', row: 2, col: 0 },
    { id: 'back-core', name: 'Posterior Core', group: 'Core', row: 2, col: 1 },
    { id: 'back-leg-r', name: 'R Posterior', group: 'Legs', row: 2, col: 2 },
];

const toGroupedIntensity = (muscleSets: Record<string, number>): GroupIntensity[] => {
    const grouped: Record<string, number> = {
        Chest: 0,
        Back: 0,
        Shoulders: 0,
        Legs: 0,
        Arms: 0,
        Core: 0,
    };

    Object.entries(muscleSets).forEach(([rawKey, value]) => {
        const key = rawKey.toLowerCase();
        let mapped = false;

        Object.entries(GROUP_ALIASES).forEach(([group, aliases]) => {
            if (!mapped && aliases.some((alias) => key.includes(alias))) {
                grouped[group] += value;
                mapped = true;
            }
        });

        if (!mapped) grouped.Core += value * 0.1;
    });

    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

    return Object.entries(grouped).map(([name, value]) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return {
            name,
            value,
            percentage,
            intensity: Math.min(100, Math.round(percentage * 3)),
        };
    });
};

export function MuscleHeatmapScreen({ navigation }: any) {
    const colors = useColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [view, setView] = useState<'front' | 'back'>('front');

    const { data, isLoading, isError, refetch } = useMuscleDistribution();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim, view]);

    const grouped = useMemo(() => toGroupedIntensity(data?.muscleSets ?? {}), [data?.muscleSets]);

    const groupedMap = useMemo(() => {
        const map: Record<string, GroupIntensity> = {};
        grouped.forEach((item) => {
            map[item.name] = item;
        });
        return map;
    }, [grouped]);

    const cells = view === 'front' ? FRONT_CELLS : BACK_CELLS;

    const cellsWithIntensity = cells.map((cell) => {
        const source = groupedMap[cell.group];
        return {
            ...cell,
            intensity: source?.intensity ?? 0,
            percentage: source?.percentage ?? 0,
        };
    });

    const getIntensityColor = (intensity: number) => {
        if (intensity >= 80) return '#EF4444';
        if (intensity >= 60) return '#F97316';
        if (intensity >= 40) return '#FBBF24';
        if (intensity >= 20) return '#34D399';
        return '#6B7280';
    };

    const topGroup = useMemo(() => {
        if (!grouped.length) return null;
        return [...grouped].sort((a, b) => b.percentage - a.percentage)[0];
    }, [grouped]);

    const lowGroups = useMemo(
        () => grouped.filter((item) => item.percentage > 0 && item.percentage < 10).map((item) => item.name),
        [grouped],
    );

    const renderGrid = () => {
        const rows: React.ReactNode[][] = [[], [], []];

        cellsWithIntensity.forEach((cell) => {
            rows[cell.row].push(
                <View key={cell.id} style={[styles.muscleSquare, { backgroundColor: getIntensityColor(cell.intensity) }]}> 
                    <Text style={styles.muscleName}>{cell.name}</Text>
                    <Text style={styles.muscleIntensity}>{cell.intensity}%</Text>
                </View>,
            );
        });

        return rows;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <NavigationBar
                title="Muscle Heatmap"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'refresh', onPress: () => refetch(), label: 'Refresh' }]}
            />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isError ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load muscle heatmap.</Text>
                    <Button title="Retry" onPress={() => refetch()} size="sm" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.toggleContainer}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Chip label="Front" selected={view === 'front'} onPress={() => setView('front')} size="sm" />
                            <Chip label="Back" selected={view === 'back'} onPress={() => setView('back')} size="sm" />
                        </View>
                    </View>

                    <View style={styles.periodRow}>
                        <View style={[styles.periodBadge, { backgroundColor: `${colors.primary.main}15`, borderColor: `${colors.primary.main}40` }]}> 
                            <Text style={[styles.periodText, { color: colors.primary.main }]}>Last 30 Days</Text>
                        </View>
                    </View>

                    <View style={styles.bodyMapSection}>
                        <MuscleHighlighterCard
                            title="Body Activation View"
                            subtitle="Tap front/back to inspect total training load by body area."
                            muscleSets={data?.muscleSets}
                        />
                    </View>

                    <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}> 
                        <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.gridTitle, { color: colors.foreground }]}>{view === 'front' ? 'Front View' : 'Back View'}</Text>
                            {renderGrid().map((row, rowIndex) => (
                                <View key={String(rowIndex)} style={styles.gridRow}>
                                    {row}
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    <View style={styles.legendSection}>
                        <Text style={[styles.legendTitle, { color: colors.foreground }]}>Intensity Legend</Text>
                        <View style={[styles.legendCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {[
                                { color: '#EF4444', label: 'High load (80%+)' },
                                { color: '#F97316', label: 'Moderate load (60-79%)' },
                                { color: '#FBBF24', label: 'Light load (40-59%)' },
                                { color: '#34D399', label: 'Recovery load (20-39%)' },
                                { color: '#6B7280', label: 'Low load (<20%)' },
                            ].map((item) => (
                                <View key={item.label} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.legendLabel, { color: colors.foreground }]}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.insightsSection}>
                        <Text style={[styles.insightsTitle, { color: colors.foreground }]}>Insights</Text>
                        <View style={[styles.insightCard, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}> 
                            <Ionicons name="trending-up" size={24} color={colors.success} />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightHeadline, { color: colors.success }]}>Most Trained Group</Text>
                                <Text style={[styles.insightText, { color: colors.foreground }]}>
                                    {topGroup ? `${topGroup.name} at ${topGroup.percentage.toFixed(1)}% of effective sets.` : 'No training distribution data available yet.'}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.insightCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]}> 
                            <Ionicons name="alert-circle" size={24} color={colors.warning} />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightHeadline, { color: colors.warning }]}>Undertrained Groups</Text>
                                <Text style={[styles.insightText, { color: colors.foreground }]}>
                                    {lowGroups.length ? `${lowGroups.join(', ')} are below 10% training share.` : 'No major low-volume muscle groups detected.'}
                                </Text>
                            </View>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    retryBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    retryText: { color: '#FFF', fontWeight: '700' },
    toggleContainer: { paddingHorizontal: 16, paddingTop: 20 },
    toggleBg: { flexDirection: 'row', borderRadius: 14, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    toggleText: { fontSize: 15, fontWeight: '600' },
    periodRow: { alignItems: 'center', paddingVertical: 16 },
    periodBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    periodText: { fontSize: 13, fontWeight: '700' },
    bodyMapSection: { paddingHorizontal: 16 },
    gridContainer: { paddingHorizontal: 16 },
    gridCard: { padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
    gridTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
    gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    muscleSquare: { width: SQUARE_SIZE, height: SQUARE_SIZE, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 8 },
    muscleName: { color: '#FFF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
    muscleIntensity: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '800', marginTop: 6 },
    legendSection: { paddingHorizontal: 16, marginTop: 24 },
    legendTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    legendCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
    legendDot: { width: 18, height: 18, borderRadius: 6 },
    legendLabel: { fontSize: 14, flex: 1 },
    insightsSection: { paddingHorizontal: 16, marginTop: 24 },
    insightsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    insightCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    insightContent: { flex: 1 },
    insightHeadline: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    insightText: { fontSize: 14, lineHeight: 20 },
});
