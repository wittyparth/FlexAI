import React, { useRef, useEffect, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { NavigationBar, IconButton } from '../../components/ui';
import { useMeasurementHistory, useProgressPhotos, useWeightHistory } from '../../hooks/queries/useBodyQueries';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
    { id: 'weight', label: 'Log Weight', icon: 'scale', color: '#10B981', route: 'WeightLog' },
    { id: 'measure', label: 'Measurements', icon: 'resize', color: '#6366F1', route: 'Measurements' },
    { id: 'photos', label: 'Progress Photos', icon: 'camera', color: '#EC4899', route: 'ProgressPhotos' },
];

const formatRelativeDate = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 'Unknown';

    const startOfNow = new Date();
    startOfNow.setHours(0, 0, 0, 0);

    const startOfDate = new Date(value);
    startOfDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function BodyTrackingHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { data: weightHistory = [], isLoading: isWeightLoading } = useWeightHistory();
    const { data: measurementHistory = [], isLoading: isMeasurementsLoading } = useMeasurementHistory();
    const { data: photos = [], isLoading: isPhotosLoading } = useProgressPhotos();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const sortedWeights = useMemo(
        () => [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [weightHistory],
    );

    const latestWeight = sortedWeights.length ? sortedWeights[sortedWeights.length - 1] : undefined;
    const previousWeight = sortedWeights.length > 1 ? sortedWeights[sortedWeights.length - 2] : undefined;

    const latestMeasurements = useMemo(() => {
        return [...measurementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [measurementHistory]);

    const bodyFatValue = latestMeasurements?.measurements?.bodyFat;
    const weightChange = latestWeight && previousWeight ? latestWeight.weight - previousWeight.weight : 0;
    const measurementFieldCount = latestMeasurements
        ? Object.values(latestMeasurements.measurements).filter((value) => typeof value === 'number').length
        : 0;

    const weightTrendData = useMemo(() => {
        const points = sortedWeights.slice(-8);
        if (!points.length) return [];

        const labelStep = Math.max(1, Math.floor(points.length / 4));
        return points.map((entry, index) => ({
            value: Number(entry.weight.toFixed(1)),
            label: index % labelStep === 0 ? new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        }));
    }, [sortedWeights]);

    const recentLogs = useMemo(() => {
        const weightLogs = weightHistory.map((entry) => ({
            id: `weight-${entry.id}`,
            date: entry.date,
            type: 'Weight',
            value: `${entry.weight.toFixed(1)} kg`,
            icon: 'scale' as const,
        }));

        const measurementLogs = measurementHistory.map((entry) => {
            const fieldCount = Object.values(entry.measurements).filter((value) => typeof value === 'number').length;
            return {
                id: `measurement-${entry.id}`,
                date: entry.date,
                type: 'Measurements',
                value: `${fieldCount} metrics updated`,
                icon: 'resize' as const,
            };
        });

        const photoLogs = photos.map((photo) => ({
            id: `photo-${photo.id}`,
            date: photo.date,
            type: 'Progress Photo',
            value: `${photo.type} view`,
            icon: 'camera' as const,
        }));

        return [...weightLogs, ...measurementLogs, ...photoLogs]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [measurementHistory, photos, weightHistory]);

    const isLoading =
        (isWeightLoading || isMeasurementsLoading || isPhotosLoading) &&
        weightHistory.length === 0 &&
        measurementHistory.length === 0 &&
        photos.length === 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar title="Body Tracking" onBack={() => navigation.goBack()} />

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}> 
                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <MaterialCommunityIcons name="scale-bathroom" size={28} color="#10B981" />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {latestWeight ? latestWeight.weight.toFixed(1) : '--'}
                            </Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>kg</Text>
                            {latestWeight && previousWeight && (
                                <View style={[styles.changeBadge, { backgroundColor: weightChange <= 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                                    <Ionicons name={weightChange <= 0 ? 'arrow-down' : 'arrow-up'} size={12} color={weightChange <= 0 ? colors.success : colors.error} />
                                    <Text style={[styles.changeText, { color: weightChange <= 0 ? colors.success : colors.error }]}>{Math.abs(weightChange).toFixed(1)}</Text>
                                </View>
                            )}
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <MaterialCommunityIcons name="percent" size={28} color="#F59E0B" />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{bodyFatValue !== undefined ? bodyFatValue.toFixed(1) : '--'}</Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>Body Fat %</Text>
                            <View style={[styles.changeBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Text style={[styles.changeText, { color: colors.primary.main }]}>Latest</Text>
                            </View>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <MaterialCommunityIcons name="camera" size={28} color="#EC4899" />
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{photos.length}</Text>
                            <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>Photos</Text>
                            <View style={[styles.changeBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Text style={[styles.changeText, { color: colors.primary.main }]}>{measurementFieldCount} fields</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weight Trend</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('WeightLog')}>
                                <Text style={[styles.seeAllText, { color: colors.primary.main }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {weightTrendData.length < 2 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Log at least two weight entries to view trends.</Text>
                            ) : (
                                <LineChart
                                    data={weightTrendData}
                                    width={width - 80}
                                    height={160}
                                    color="#10B981"
                                    thickness={3}
                                    hideDataPoints={false}
                                    dataPointsColor="#10B981"
                                    dataPointsRadius={4}
                                    curved
                                    areaChart
                                    startFillColor="#10B981"
                                    endFillColor={colors.background}
                                    startOpacity={0.25}
                                    endOpacity={0.02}
                                    noOfSections={4}
                                    yAxisThickness={0}
                                    xAxisThickness={0}
                                    xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                    yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                    isAnimated
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
                        <View style={styles.actionsRow}>
                            {QUICK_ACTIONS.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate(action.route)}
                                    activeOpacity={0.9}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                                        <Ionicons name={action.icon as any} size={28} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Logs</Text>
                        {recentLogs.length === 0 ? (
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No logs yet. Start with your first weight or measurement entry.</Text>
                        ) : (
                            recentLogs.map((log) => (
                                <View key={log.id} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                    <View style={[styles.logIcon, { backgroundColor: `${colors.primary.main}15` }]}> 
                                        <Ionicons name={log.icon as any} size={22} color={colors.primary.main} />
                                    </View>
                                    <View style={styles.logContent}>
                                        <Text style={[styles.logType, { color: colors.foreground }]}>{log.type}</Text>
                                        <Text style={[styles.logValue, { color: colors.mutedForeground }]}>{log.value}</Text>
                                    </View>
                                    <Text style={[styles.logDate, { color: colors.mutedForeground }]}>{formatRelativeDate(log.date)}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            <IconButton
                icon="add"
                variant="filled"
                size="lg"
                onPress={() => navigation.navigate('WeightLog')}
                style={styles.fab}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 10 },
    statCard: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    statValue: { fontSize: 26, fontWeight: '800', fontFamily: fontFamilies.mono, marginTop: 10 },
    statUnit: { fontSize: 12, marginTop: 2 },
    changeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8, gap: 4 },
    changeText: { fontSize: 12, fontWeight: '700' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    seeAllText: { fontSize: 14, fontWeight: '600' },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: 'hidden' },
    actionsRow: { flexDirection: 'row', gap: 12 },
    actionCard: { flex: 1, padding: 20, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    actionIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
    logCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    logIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    logContent: { flex: 1 },
    logType: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    logValue: { fontSize: 14 },
    logDate: { fontSize: 13 },
    emptyText: { fontSize: 14, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 100, right: 20, borderRadius: 30, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
    fabGradient: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
