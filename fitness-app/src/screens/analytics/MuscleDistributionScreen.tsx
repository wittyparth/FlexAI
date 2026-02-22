import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationBar, Button } from '../../components/ui';
import { PieChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useMuscleDistribution } from '../../hooks/queries/useStatsQueries';
import { MuscleHighlighterCard } from '../../components/muscles/MuscleHighlighterCard';

const MUSCLE_GROUP_COLORS: Record<string, string> = {
    Chest: '#6366F1',
    Back: '#10B981',
    Shoulders: '#F59E0B',
    Legs: '#EC4899',
    Arms: '#8B5CF6',
    Core: '#14B8A6',
};

const GROUP_ALIASES: Record<string, string[]> = {
    Chest: ['chest', 'pecs', 'pectorals'],
    Back: ['back', 'lats', 'latissimus', 'traps', 'trapezius', 'rhomboids', 'erectors'],
    Shoulders: ['shoulders', 'shoulder', 'delts', 'delt'],
    Legs: ['legs', 'leg', 'quadriceps', 'quads', 'hamstrings', 'glutes', 'calves', 'calf', 'adductors'],
    Arms: ['arms', 'arm', 'biceps', 'triceps', 'forearms', 'forearm'],
    Core: ['core', 'abs', 'abdominals', 'obliques'],
};

const GROUP_ICONS: Record<string, string> = {
    Chest: 'chest',
    Back: 'human-male-height-variant',
    Shoulders: 'arm-flex',
    Legs: 'run',
    Arms: 'arm-flex',
    Core: 'human',
};

type GroupStat = {
    name: string;
    value: number;
    percentage: number;
    color: string;
    icon: string;
    status: 'undertrained' | 'balanced' | 'high';
};

const toMuscleGroupStats = (muscleSets: Record<string, number>): GroupStat[] => {
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

        if (!mapped) {
            grouped.Core += value * 0.1;
        }
    });

    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);

    return Object.entries(grouped)
        .map(([name, value]) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const status: GroupStat['status'] = percentage < 10 ? 'undertrained' : percentage > 30 ? 'high' : 'balanced';
            return {
                name,
                value,
                percentage,
                color: MUSCLE_GROUP_COLORS[name] ?? '#6B7280',
                icon: GROUP_ICONS[name] ?? 'human',
                status,
            };
        })
        .sort((a, b) => b.value - a.value);
};

export function MuscleDistributionScreen({ navigation }: any) {
    const colors = useColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { data, isLoading, isError, refetch } = useMuscleDistribution();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const muscleGroups = useMemo(() => toMuscleGroupStats(data?.muscleSets ?? {}), [data?.muscleSets]);

    const totalSets = useMemo(
        () => muscleGroups.reduce((sum, muscle) => sum + muscle.value, 0),
        [muscleGroups],
    );

    const pieData = useMemo(
        () =>
            muscleGroups.map((muscle) => ({
                value: Number(muscle.percentage.toFixed(1)),
                color: muscle.color,
                text: `${Math.round(muscle.percentage)}%`,
                focused: muscle.status === 'undertrained',
            })),
        [muscleGroups],
    );

    const alerts = useMemo(() => {
        const alertItems: Array<{ type: 'warning' | 'info' | 'success'; title: string; message: string; icon: string }> = [];

        const undertrained = muscleGroups.filter((muscle) => muscle.status === 'undertrained');
        if (undertrained.length) {
            const names = undertrained.map((item) => item.name).join(', ');
            alertItems.push({
                type: 'warning',
                title: 'Undertrained Areas',
                message: `${names} are below 10% training share in the last 30 days.`,
                icon: 'alert-circle',
            });
        }

        if (data?.imbalances?.alert) {
            alertItems.push({
                type: 'info',
                title: 'Push / Pull Balance',
                message: `${Math.round(data.imbalances.pushRatio * 100)}% push vs ${Math.round(data.imbalances.pullRatio * 100)}% pull`,
                icon: 'analytics',
            });
        } else {
            alertItems.push({
                type: 'success',
                title: 'Balanced Pattern',
                message: 'No major push/pull imbalance detected.',
                icon: 'checkmark-circle',
            });
        }

        return alertItems;
    }, [data?.imbalances, muscleGroups]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="Muscles"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'refresh', onPress: () => refetch(), label: 'Refresh' }]}
            />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isError ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load muscle distribution.</Text>
                    <Button title="Retry" variant="primary" size="sm" onPress={() => refetch()} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.periodRow}>
                        <View style={[styles.periodBadge, { backgroundColor: `${colors.primary.main}15`, borderColor: `${colors.primary.main}40` }]}> 
                            <Text style={[styles.periodText, { color: colors.primary.main }]}>Last 30 Days</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <MuscleHighlighterCard
                            title="Body Activation Map"
                            subtitle="Visualized from completed set distribution across the last 30 days."
                            muscleSets={data?.muscleSets}
                        />
                    </View>

                    <Animated.View style={[styles.chartSection, { opacity: fadeAnim }]}> 
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {pieData.length === 0 || totalSets <= 0 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No completed workout set distribution available yet.</Text>
                            ) : (
                                <PieChart
                                    data={pieData}
                                    donut
                                    innerRadius={70}
                                    radius={100}
                                    innerCircleColor={colors.card}
                                    centerLabelComponent={() => (
                                        <View style={styles.centerLabel}>
                                            <Text style={[styles.centerValue, { color: colors.foreground }]}>{Math.round(totalSets)}</Text>
                                            <Text style={[styles.centerText, { color: colors.mutedForeground }]}>effective sets</Text>
                                        </View>
                                    )}
                                    showText
                                    textColor="#FFF"
                                    textSize={11}
                                    fontWeight="600"
                                    focusOnPress
                                    showValuesAsLabels
                                />
                            )}
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        {alerts.map((alert, index) => {
                            const toneColor = alert.type === 'warning' ? colors.warning : alert.type === 'info' ? colors.primary.main : colors.success;
                            return (
                                <View
                                    key={`${alert.title}-${index}`}
                                    style={[
                                        styles.alertCard,
                                        {
                                            backgroundColor: `${toneColor}10`,
                                            borderColor: `${toneColor}35`,
                                        },
                                    ]}
                                >
                                    <Ionicons name={alert.icon as any} size={22} color={toneColor} />
                                    <View style={styles.alertContent}>
                                        <Text style={[styles.alertMuscle, { color: toneColor }]}>{alert.title}</Text>
                                        <Text style={[styles.alertMessage, { color: colors.foreground }]}>{alert.message}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Breakdown</Text>
                        {muscleGroups.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No muscle distribution data yet.</Text>
                        ) : (
                            muscleGroups.map((muscle, index) => (
                                <Animated.View
                                    key={muscle.name}
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
                                    <View style={[styles.muscleRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                        <View style={[styles.muscleIcon, { backgroundColor: `${muscle.color}15` }]}> 
                                            <MaterialCommunityIcons name={muscle.icon as any} size={22} color={muscle.color} />
                                        </View>
                                        <View style={styles.muscleInfo}>
                                            <View style={styles.muscleHeader}>
                                                <Text style={[styles.muscleName, { color: colors.foreground }]}>{muscle.name}</Text>
                                                <Text style={[styles.muscleValue, { color: muscle.color }]}>{muscle.percentage.toFixed(1)}%</Text>
                                            </View>
                                            <View style={[styles.progressBg, { backgroundColor: colors.muted }]}> 
                                                <View style={[styles.progressFill, { width: `${muscle.percentage}%`, backgroundColor: muscle.color }]} />
                                            </View>
                                        </View>
                                        {muscle.status === 'undertrained' && (
                                            <View style={[styles.statusBadge, { backgroundColor: `${colors.warning}15` }]}> 
                                                <Ionicons name="arrow-down" size={14} color={colors.warning} />
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>
                            ))
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={[styles.legendCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={styles.legendRow}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                                    <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Balanced</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                                    <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Undertrained</Text>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                                    <Text style={[styles.legendText, { color: colors.mutedForeground }]}>High Share</Text>
                                </View>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    retryBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    retryText: { color: '#FFF', fontWeight: '700' },
    periodRow: { alignItems: 'center', paddingVertical: 16 },
    periodBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    periodText: { fontSize: 13, fontWeight: '700' },
    chartSection: { alignItems: 'center', paddingHorizontal: 16 },
    chartCard: { padding: 30, borderRadius: 24, borderWidth: 1, alignItems: 'center', width: '100%' },
    centerLabel: { alignItems: 'center' },
    centerValue: { fontSize: 34, fontWeight: '800', fontFamily: fontFamilies.mono },
    centerText: { fontSize: 13, marginTop: 4 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    alertCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    alertContent: { flex: 1 },
    alertMuscle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    alertMessage: { fontSize: 14 },
    muscleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    muscleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    muscleInfo: { flex: 1 },
    muscleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    muscleName: { fontSize: 16, fontWeight: '600' },
    muscleValue: { fontSize: 18, fontWeight: '800', fontFamily: fontFamilies.mono },
    progressBg: { height: 8, borderRadius: 4, position: 'relative', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    statusBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    legendCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    legendRow: { flexDirection: 'row', justifyContent: 'space-around' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { fontSize: 13 },
    emptyText: { fontSize: 14, textAlign: 'center' },
});
