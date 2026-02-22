import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { NavigationBar, Button, Chip } from '../../components/ui';
import { usePersonalRecords } from '../../hooks/queries/useStatsQueries';
import { PersonalRecordResponse, PersonalRecordType } from '../../api/stats.api';

const getRecordTypeLabel = (type: PersonalRecordType) => {
    if (type === 'estimated_1rm') return '1RM';
    if (type === 'max_weight') return 'Max Weight';
    if (type === 'max_reps') return 'Max Reps';
    return 'Max Volume';
};

const getRecordTypeColor = (type: PersonalRecordType) => {
    if (type === 'estimated_1rm') return '#6366F1';
    if (type === 'max_weight') return '#10B981';
    if (type === 'max_reps') return '#F59E0B';
    return '#8B5CF6';
};

const getExerciseIcon = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    if (name.includes('deadlift')) return 'weight-lifter';
    if (name.includes('squat') || name.includes('leg')) return 'human';
    if (name.includes('press') || name.includes('bench')) return 'dumbbell';
    if (name.includes('pull') || name.includes('row') || name.includes('lat')) return 'arm-flex';
    return 'trophy';
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

const toSortedRecords = (records: PersonalRecordResponse[]) => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

type FilterKey = 'all' | PersonalRecordType;

export function PersonalRecordsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [filter, setFilter] = useState<FilterKey>('all');

    const { data: allRecords = [], isLoading, isError, refetch } = usePersonalRecords();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const records = useMemo(() => toSortedRecords(allRecords), [allRecords]);

    const filteredRecords = useMemo(() => {
        if (filter === 'all') return records;
        return records.filter((record) => record.recordType === filter);
    }, [filter, records]);

    const monthCount = useMemo(() => {
        const now = new Date();
        return records.filter((record) => {
            const date = new Date(record.date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
    }, [records]);

    const yearCount = useMemo(() => {
        const now = new Date();
        return records.filter((record) => new Date(record.date).getFullYear() === now.getFullYear()).length;
    }, [records]);

    const featuredRecords = useMemo(() => {
        return [...filteredRecords]
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);
    }, [filteredRecords]);

    const distributionBarData = useMemo(() => {
        const types: PersonalRecordType[] = ['estimated_1rm', 'max_weight', 'max_reps', 'max_volume'];
        return types.map((type) => ({
            value: records.filter((record) => record.recordType === type).length,
            label: getRecordTypeLabel(type),
            frontColor: getRecordTypeColor(type),
        }));
    }, [records]);

    const chartWidth = 320;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="Records"
                onBack={() => navigation.goBack()}
                rightActions={[
                    { icon: 'refresh', onPress: () => refetch(), label: 'Refresh' },
                ]}
            />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isError ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load personal records.</Text>
                    <Button title="Retry" onPress={() => refetch()} variant="primary" size="default" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.statIconBadge, { backgroundColor: `${colors.primary.main}15` }]}> 
                                <MaterialCommunityIcons name="trophy-award" size={22} color={colors.primary.main} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{records.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All Time</Text>
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.statIconBadge, { backgroundColor: `${colors.stats.consistency}15` }]}> 
                                <MaterialCommunityIcons name="calendar-month" size={22} color={colors.stats.consistency} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{monthCount}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This Month</Text>
                            </View>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <View style={[styles.statIconBadge, { backgroundColor: `${colors.success}15` }]}> 
                                <MaterialCommunityIcons name="calendar" size={22} color={colors.success} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{yearCount}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This Year</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>PR Type Distribution</Text>
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            {records.length === 0 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No personal records yet.</Text>
                            ) : (
                                <BarChart
                                    data={distributionBarData}
                                    width={chartWidth}
                                    height={190}
                                    barWidth={40}
                                    spacing={26}
                                    noOfSections={4}
                                    barBorderRadius={8}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    hideRules
                                    xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                    yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                    isAnimated
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Lifts</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                            {featuredRecords.length === 0 ? (
                                <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No records in this filter.</Text>
                                </View>
                            ) : (
                                featuredRecords.map((pr, index) => {
                                    const color = getRecordTypeColor(pr.recordType);
                                    const exerciseName = pr.exercise?.name ?? `Exercise #${pr.exerciseId}`;
                                    return (
                                        <Animated.View
                                            key={pr.id}
                                            style={{
                                                opacity: fadeAnim,
                                                transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20 + index * 8, 0] }) }],
                                                shadowColor: color,
                                                shadowOffset: { width: 0, height: 8 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 10,
                                                elevation: 8,
                                            }}
                                        >
                                            <View style={[styles.featuredCard, { backgroundColor: color }]}> 
                                                <View style={styles.featuredHeader}>
                                                    <View style={styles.crownBadge}>
                                                        <MaterialCommunityIcons name="crown" size={16} color="#FFF" />
                                                    </View>
                                                    <View style={styles.improvementBadge}>
                                                        <Text style={styles.featuredImprovement}>{getRecordTypeLabel(pr.recordType)}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.featuredContent}>
                                                    <Text style={styles.featuredExercise}>{exerciseName}</Text>
                                                    <View style={styles.featuredWeightRow}>
                                                        <Text style={styles.featuredWeight}>{pr.value.toFixed(0)}</Text>
                                                        <Text style={styles.featuredUnit}>kg</Text>
                                                    </View>
                                                    <Text style={styles.featuredDate}>{formatLongDate(pr.date)}</Text>
                                                </View>

                                                <MaterialCommunityIcons name={getExerciseIcon(exerciseName) as any} size={84} color="rgba(255,255,255,0.15)" style={styles.featuredIcon} />
                                            </View>
                                        </Animated.View>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                        {([
                            { key: 'all', label: 'All' },
                            { key: 'estimated_1rm', label: '1RM' },
                            { key: 'max_weight', label: 'Max Weight' },
                            { key: 'max_reps', label: 'Max Reps' },
                            { key: 'max_volume', label: 'Volume' },
                        ] as const).map((item) => (
                            <Chip
                                key={item.key}
                                label={item.label}
                                selected={filter === item.key}
                                onPress={() => setFilter(item.key)}
                                size="sm"
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>All Records</Text>
                        {filteredRecords.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No records found for this filter.</Text>
                        ) : (
                            filteredRecords.map((pr, index) => {
                                const color = getRecordTypeColor(pr.recordType);
                                const exerciseName = pr.exercise?.name ?? `Exercise #${pr.exerciseId}`;
                                return (
                                    <Animated.View
                                        key={pr.id}
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
                                        <View style={[styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                            <View style={[styles.prIcon, { backgroundColor: `${color}15` }]}> 
                                                <MaterialCommunityIcons name={getExerciseIcon(exerciseName) as any} size={24} color={color} />
                                            </View>
                                            <View style={styles.prInfo}>
                                                <Text style={[styles.prExercise, { color: colors.foreground }]}>{exerciseName}</Text>
                                                <View style={styles.prMeta}>
                                                    <View style={[styles.prRepsBadge, { backgroundColor: `${colors.border}80` }]}> 
                                                        <Text style={[styles.prReps, { color: colors.foreground }]}>{getRecordTypeLabel(pr.recordType)}</Text>
                                                    </View>
                                                    <Text style={[styles.prDate, { color: colors.mutedForeground }]}>{formatShortDate(pr.date)}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.prWeightContainer}>
                                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                                    <Text style={[styles.prWeight, { color: colors.foreground }]}>{pr.value.toFixed(0)}</Text>
                                                    <Text style={[styles.prUnit, { color: colors.mutedForeground }]}>kg</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Animated.View>
                                );
                            })
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
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 10 },
    statCard: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    statIconBadge: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', fontFamily: fontFamilies.mono, marginBottom: 1 },
    statLabel: { fontSize: 12, fontWeight: '500' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: 'hidden' },
    featuredScroll: { paddingRight: 16, gap: 14, paddingBottom: 14 },
    featuredCard: { width: 220, height: 245, padding: 22, borderRadius: 24, position: 'relative', overflow: 'hidden', justifyContent: 'space-between' },
    featuredHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 2 },
    crownBadge: { backgroundColor: 'rgba(255,255,255,0.25)', width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    improvementBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    featuredImprovement: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    featuredContent: { zIndex: 2 },
    featuredExercise: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    featuredWeightRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    featuredWeight: { color: '#FFF', fontSize: 40, fontWeight: '800', fontFamily: fontFamilies.mono, lineHeight: 44 },
    featuredUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '600' },
    featuredDate: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
    featuredIcon: { position: 'absolute', right: -10, bottom: -8, transform: [{ rotate: '-12deg' }] },
    emptyCard: { width: 220, height: 120, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
    filterRow: { paddingHorizontal: 16, marginTop: 12, gap: 10, flexWrap: 'wrap' },
    filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    filterText: { fontSize: 13, fontWeight: '600' },
    prCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    prIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    prInfo: { flex: 1 },
    prExercise: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
    prMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    prRepsBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    prReps: { fontSize: 11, fontWeight: '600' },
    prDate: { fontSize: 12, fontWeight: '500' },
    prWeightContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    prWeight: { fontSize: 22, fontWeight: '800', fontFamily: fontFamilies.mono },
    prUnit: { fontSize: 13, fontWeight: '600' },
    emptyText: { fontSize: 14, textAlign: 'center' },
});
