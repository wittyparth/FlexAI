import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { NavigationBar, Button, Chip } from '../../components/ui';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { usePersonalRecords, useStrengthProgression } from '../../hooks/queries/useStatsQueries';
import { PersonalRecordResponse } from '../../api/stats.api';

const { width } = Dimensions.get('window');

type Period = '3M' | '6M' | '1Y' | 'ALL';

type ExerciseOption = {
    id: number;
    name: string;
    icon: string;
};

const getExerciseIcon = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    if (name.includes('deadlift')) return 'weight-lifter';
    if (name.includes('squat') || name.includes('leg')) return 'human';
    if (name.includes('press') || name.includes('bench')) return 'dumbbell';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'arm-flex';
    return 'dumbbell';
};

const formatShortDate = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 'Unknown';
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatLongDate = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 'Unknown';
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isInPeriod = (date: string, period: Period) => {
    if (period === 'ALL') return true;

    const recordDate = new Date(date);
    if (Number.isNaN(recordDate.getTime())) return false;

    const now = new Date();
    const start = new Date(now);

    if (period === '3M') start.setMonth(now.getMonth() - 3);
    if (period === '6M') start.setMonth(now.getMonth() - 6);
    if (period === '1Y') start.setFullYear(now.getFullYear() - 1);

    return recordDate >= start;
};

const sortByDateAsc = (records: PersonalRecordResponse[]) => {
    return [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export function StrengthProgressionScreen({ navigation, route }: any) {
    const colors = useColors();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const routeExerciseId = route?.params?.exerciseId as number | undefined;

    const [selectedExerciseId, setSelectedExerciseId] = useState<number | undefined>(routeExerciseId);
    const [period, setPeriod] = useState<Period>('6M');

    const { data: allRecords = [], isLoading: isExerciseLoading, isError: isExerciseError, refetch: refetchExercises } = usePersonalRecords();

    const exerciseOptions = useMemo<ExerciseOption[]>(() => {
        const map = new Map<number, ExerciseOption>();
        allRecords.forEach((record) => {
            if (!map.has(record.exerciseId)) {
                const name = record.exercise?.name ?? `Exercise #${record.exerciseId}`;
                map.set(record.exerciseId, {
                    id: record.exerciseId,
                    name,
                    icon: getExerciseIcon(name),
                });
            }
        });
        return Array.from(map.values());
    }, [allRecords]);

    useEffect(() => {
        if (!selectedExerciseId && exerciseOptions.length) {
            setSelectedExerciseId(exerciseOptions[0].id);
        }
    }, [exerciseOptions, selectedExerciseId]);

    const selectedExercise = useMemo(
        () => exerciseOptions.find((exercise) => exercise.id === selectedExerciseId),
        [exerciseOptions, selectedExerciseId],
    );

    const {
        data: progressionRecords = [],
        isLoading: isProgressLoading,
        isError: isProgressError,
        refetch: refetchProgression,
    } = useStrengthProgression(selectedExerciseId);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim, period, selectedExerciseId]);

    const sortedProgression = useMemo(() => sortByDateAsc(progressionRecords), [progressionRecords]);

    const periodRecords = useMemo(
        () => sortedProgression.filter((record) => isInPeriod(record.date, period)),
        [period, sortedProgression],
    );

    const chartData = useMemo(() => {
        const points = periodRecords;
        if (!points.length) return [];

        const highest = Math.max(...points.map((point) => point.value));
        const labelStep = Math.max(1, Math.floor(points.length / 5));

        return points.map((point, index) => ({
            value: Number(point.value.toFixed(1)),
            label: index % labelStep === 0 ? formatShortDate(point.date) : '',
            customDataPoint:
                point.value === highest
                    ? () => (
                          <View style={[styles.prDot, { backgroundColor: colors.stats.pr }]}> 
                              <MaterialCommunityIcons name="crown" size={12} color="#FFF" />
                          </View>
                      )
                    : undefined,
        }));
    }, [colors.stats.pr, periodRecords]);

    const currentValue = sortedProgression.length ? sortedProgression[sortedProgression.length - 1].value : 0;
    const allTimeBest = sortedProgression.length ? Math.max(...sortedProgression.map((record) => record.value)) : 0;

    const improvement = useMemo(() => {
        if (periodRecords.length < 2) return 0;
        const first = periodRecords[0].value;
        const last = periodRecords[periodRecords.length - 1].value;
        if (first <= 0) return 0;
        return ((last - first) / first) * 100;
    }, [periodRecords]);

    const recentSessions = useMemo(
        () => [...sortedProgression].reverse().slice(0, 5),
        [sortedProgression],
    );

    const isLoading = isExerciseLoading || (Boolean(selectedExerciseId) && isProgressLoading);
    const hasAnyData = exerciseOptions.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="Strength"
                onBack={() => navigation.goBack()}
                rightActions={[{ icon: 'refresh', onPress: () => { refetchExercises(); refetchProgression(); }, label: 'Refresh' }]}
            />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isExerciseError || isProgressError ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load strength progression.</Text>
                    <Button title="Retry" onPress={() => { refetchExercises(); refetchProgression(); }} size="sm" />
                </View>
            ) : !hasAnyData ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>No PR history found yet. Complete workouts to build strength progression.</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.exerciseSelector}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseScroll}>
                            {exerciseOptions.map((exercise) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={[
                                        styles.exerciseChip,
                                        selectedExerciseId === exercise.id
                                            ? { backgroundColor: colors.primary.main }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                                    ]}
                                    onPress={() => setSelectedExerciseId(exercise.id)}
                                >
                                    <MaterialCommunityIcons name={exercise.icon as any} size={18} color={selectedExerciseId === exercise.id ? '#FFF' : colors.foreground} />
                                    <Text style={[styles.exerciseChipText, { color: selectedExerciseId === exercise.id ? '#FFF' : colors.foreground }]}>{exercise.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Current</Text>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{currentValue.toFixed(0)}</Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>kg</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.prBadge, { backgroundColor: `${colors.stats.pr}15` }]}> 
                                <MaterialCommunityIcons name="crown" size={14} color={colors.stats.pr} />
                            </View>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All-Time Best</Text>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{allTimeBest.toFixed(0)}</Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>kg</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Improvement</Text>
                            <Text style={[styles.statValue, { color: improvement >= 0 ? colors.success : colors.error }]}>{improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}%</Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>{period}</Text>
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{selectedExercise?.name ?? 'Exercise'} Trend</Text>
                            <View style={styles.periodSelector}>
                                {(['3M', '6M', '1Y', 'ALL'] as Period[]).map((p) => (
                                    <Chip
                                        key={p}
                                        label={p}
                                        selected={period === p}
                                        onPress={() => setPeriod(p)}
                                        size="sm"
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {chartData.length < 2 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Not enough points in this period to draw a trend.</Text>
                            ) : (
                                <LineChart
                                    data={chartData}
                                    width={width - 80}
                                    height={220}
                                    color={colors.primary.main}
                                    thickness={4}
                                    hideDataPoints={false}
                                    dataPointsColor={colors.primary.main}
                                    dataPointsRadius={5}
                                    curved
                                    areaChart
                                    startFillColor={`${colors.primary.main}80`}
                                    endFillColor={`${colors.primary.main}00`}
                                    startOpacity={0.6}
                                    endOpacity={0.05}
                                    noOfSections={4}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                                    yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '500' }}
                                    rulesType="solid"
                                    rulesColor={colors.border}
                                    isAnimated
                                    animationDuration={800}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Recent Records</Text>
                        {recentSessions.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No records yet for this exercise.</Text>
                        ) : (
                            recentSessions.map((session, index) => (
                                <Animated.View
                                    key={session.id}
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{
                                            translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [12 + index * 2, 0] }),
                                        }],
                                    }}
                                >
                                    <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                        <View style={styles.sessionInfo}>
                                            <Text style={[styles.sessionDate, { color: colors.foreground }]}>{formatLongDate(session.date)}</Text>
                                            <View style={styles.sessionMeta}>
                                                <Text style={[styles.sessionDetail, { color: colors.mutedForeground }]}>{session.recordType.replace('_', ' ')}</Text>
                                                {typeof session.reps === 'number' && (
                                                    <>
                                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                                        <Text style={[styles.sessionDetail, { color: colors.mutedForeground }]}>{session.reps} reps</Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.sessionRight}>
                                            <Text style={[styles.e1rmValue, { color: colors.foreground }]}>{session.value.toFixed(0)}</Text>
                                            <Text style={[styles.sessionDetail, { color: colors.mutedForeground }]}>kg</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))
                        )}
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
    exerciseSelector: { paddingVertical: 16 },
    exerciseScroll: { paddingHorizontal: 16, gap: 10 },
    exerciseChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, gap: 8 },
    exerciseChipText: { fontSize: 14, fontWeight: '600' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
    statCard: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center', position: 'relative' },
    prBadge: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: 12, marginBottom: 6 },
    statValue: { fontSize: 28, fontWeight: '800', fontFamily: fontFamilies.mono },
    statUnit: { fontSize: 12, marginTop: 2 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    periodSelector: { flexDirection: 'row', gap: 4 },
    periodBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    periodText: { fontSize: 12, fontWeight: '600' },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, paddingTop: 10, overflow: 'hidden' },
    prDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    sessionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    sessionInfo: { flex: 1 },
    sessionDate: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sessionDetail: { fontSize: 14 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    sessionRight: { alignItems: 'flex-end' },
    e1rmValue: { fontSize: 20, fontWeight: '700', fontFamily: fontFamilies.mono },
    emptyText: { fontSize: 14, textAlign: 'center' },
});
