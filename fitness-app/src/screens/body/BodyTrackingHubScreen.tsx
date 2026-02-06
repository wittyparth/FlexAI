import React, { useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native'; // Added this line
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const BODY_STATS = {
    weight: { current: 175.5, change: -2.5, unit: 'lbs' },
    bodyFat: { current: 14.2, change: -1.8, unit: '%' },
    muscle: { current: 142, change: 3.2, unit: 'lbs' },
};

const WEIGHT_TREND = [
    { value: 180 }, { value: 179 }, { value: 178.5 }, { value: 178 },
    { value: 177 }, { value: 176.5 }, { value: 176 }, { value: 175.5 },
];

const QUICK_ACTIONS = [
    { id: 'weight', label: 'Log Weight', icon: 'scale', color: '#10B981', route: 'WeightLog' },
    { id: 'measure', label: 'Measurements', icon: 'resize', color: '#6366F1', route: 'Measurements' },
    { id: 'photos', label: 'Progress Photos', icon: 'camera', color: '#EC4899', route: 'ProgressPhotos' },
];

export function BodyTrackingHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#10B981', '#059669'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Body Tracking</Text>
                <View style={styles.headerBtn} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Cards */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="scale-bathroom" size={28} color="#10B981" />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{BODY_STATS.weight.current}</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>{BODY_STATS.weight.unit}</Text>
                        <View style={[styles.changeBadge, { backgroundColor: `${colors.success}15` }]}>
                            <Ionicons name="arrow-down" size={12} color={colors.success} />
                            <Text style={[styles.changeText, { color: colors.success }]}>{Math.abs(BODY_STATS.weight.change)}</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="percent" size={28} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{BODY_STATS.bodyFat.current}</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>Body Fat</Text>
                        <View style={[styles.changeBadge, { backgroundColor: `${colors.success}15` }]}>
                            <Ionicons name="arrow-down" size={12} color={colors.success} />
                            <Text style={[styles.changeText, { color: colors.success }]}>{Math.abs(BODY_STATS.bodyFat.change)}%</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="arm-flex" size={28} color="#6366F1" />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{BODY_STATS.muscle.current}</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>Muscle lbs</Text>
                        <View style={[styles.changeBadge, { backgroundColor: `${colors.success}15` }]}>
                            <Ionicons name="arrow-up" size={12} color={colors.success} />
                            <Text style={[styles.changeText, { color: colors.success }]}>+{BODY_STATS.muscle.change}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Weight Trend Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weight Trend</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('WeightLog')}>
                            <Text style={[styles.seeAllText, { color: colors.primary.main }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <LineChart
                            data={WEIGHT_TREND}
                            width={width - 80}
                            height={140}
                            color="#10B981"
                            thickness={3}
                            hideDataPoints={false}
                            dataPointsColor="#10B981"
                            dataPointsRadius={5}
                            curved
                            areaChart
                            startFillColor="#10B981"
                            endFillColor={colors.background}
                            startOpacity={0.25}
                            endOpacity={0}
                            hideRules
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideYAxisText
                            isAnimated
                        />
                    </View>
                </View>

                {/* Quick Actions */}
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

                {/* Recent Logs */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Logs</Text>
                    {[
                        { date: 'Today', type: 'Weight', value: '175.5 lbs', icon: 'scale' },
                        { date: 'Yesterday', type: 'Measurements', value: '6 updated', icon: 'resize' },
                        { date: '2 days ago', type: 'Progress Photo', value: 'Front pose', icon: 'camera' },
                    ].map((log, i) => (
                        <View key={i} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.logIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Ionicons name={log.icon as any} size={22} color={colors.primary.main} />
                            </View>
                            <View style={styles.logContent}>
                                <Text style={[styles.logType, { color: colors.foreground }]}>{log.type}</Text>
                                <Text style={[styles.logValue, { color: colors.mutedForeground }]}>{log.value}</Text>
                            </View>
                            <Text style={[styles.logDate, { color: colors.mutedForeground }]}>{log.date}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <LinearGradient colors={['#10B981', '#059669'] as [string, string]} style={styles.fabGradient}>
                    <Ionicons name="add" size={30} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
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
    fab: { position: 'absolute', bottom: 100, right: 20, borderRadius: 30, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
    fabGradient: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
