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
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - Strength progression for Bench Press
// ============================================================
const EXERCISES = [
    { id: 1, name: 'Bench Press', icon: 'dumbbell' },
    { id: 2, name: 'Squat', icon: 'human' },
    { id: 3, name: 'Deadlift', icon: 'weight-lifter' },
    { id: 4, name: 'Overhead Press', icon: 'human-handsup' },
];

const PROGRESSION_DATA = [
    { value: 185, date: 'Jan 1', label: '' },
    { value: 190, date: 'Jan 8', label: '' },
    { value: 195, date: 'Jan 15', label: '' },
    { value: 195, date: 'Jan 22', label: '' },
    { value: 200, date: 'Jan 29', label: '' },
    { value: 205, date: 'Feb 5', label: '' },
    { value: 210, date: 'Feb 12', label: '' },
    { value: 215, date: 'Feb 19', label: '' },
    { value: 220, date: 'Feb 26', label: '' },
    { value: 225, date: 'Mar 5', label: '', isPR: true },
];

const RECENT_SESSIONS = [
    { date: 'Mar 5, 2025', weight: 205, reps: 5, e1rm: 225, isPR: true },
    { date: 'Feb 28, 2025', weight: 200, reps: 5, e1rm: 220 },
    { date: 'Feb 21, 2025', weight: 195, reps: 6, e1rm: 218 },
    { date: 'Feb 14, 2025', weight: 195, reps: 5, e1rm: 215 },
    { date: 'Feb 7, 2025', weight: 190, reps: 6, e1rm: 212 },
];

export function StrengthProgressionScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [period, setPeriod] = useState('6M');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const currentE1RM = 225;
    const allTimeBest = 225;
    const improvement = 21.6; // percentage improvement

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[colors.primary.main, '#4338CA'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Strength</Text>
                <View style={styles.headerBtn} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Exercise Selector */}
                <View style={styles.exerciseSelector}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseScroll}>
                        {EXERCISES.map((ex) => (
                            <TouchableOpacity
                                key={ex.id}
                                style={[
                                    styles.exerciseChip,
                                    selectedExercise.id === ex.id
                                        ? { backgroundColor: colors.primary.main }
                                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setSelectedExercise(ex)}
                            >
                                <MaterialCommunityIcons
                                    name={ex.icon as any}
                                    size={18}
                                    color={selectedExercise.id === ex.id ? '#FFF' : colors.foreground}
                                />
                                <Text style={[
                                    styles.exerciseChipText,
                                    { color: selectedExercise.id === ex.id ? '#FFF' : colors.foreground }
                                ]}>{ex.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Stats Summary Cards */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Current 1RM</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{currentE1RM}</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>lbs</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.prBadge, { backgroundColor: `${colors.stats.pr}15` }]}>
                            <MaterialCommunityIcons name="crown" size={14} color={colors.stats.pr} />
                        </View>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All-Time Best</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{allTimeBest}</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>lbs</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Improvement</Text>
                        <Text style={[styles.statValue, { color: colors.success }]}>+{improvement}%</Text>
                        <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>6 months</Text>
                    </View>
                </Animated.View>

                {/* Main Chart */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Estimated 1RM Trend</Text>
                        <View style={styles.periodSelector}>
                            {['3M', '6M', '1Y', 'ALL'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.periodBtn, period === p && { backgroundColor: colors.primary.main }]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text style={[styles.periodText, { color: period === p ? '#FFF' : colors.mutedForeground }]}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <LineChart
                            data={PROGRESSION_DATA.map((d, i) => ({
                                value: d.value,
                                label: i % 3 === 0 ? d.date.split(' ')[0] : '',
                                dataPointText: d.isPR ? '⭐' : '',
                                customDataPoint: d.isPR ? () => (
                                    <View style={[styles.prDot, { backgroundColor: colors.stats.pr }]}>
                                        <MaterialCommunityIcons name="crown" size={10} color="#FFF" />
                                    </View>
                                ) : undefined,
                            }))}
                            width={width - 80}
                            height={200}
                            color={colors.primary.main}
                            thickness={3}
                            hideDataPoints={false}
                            dataPointsColor={colors.primary.main}
                            dataPointsRadius={6}
                            curved
                            areaChart
                            startFillColor={colors.primary.main}
                            endFillColor={colors.background}
                            startOpacity={0.3}
                            endOpacity={0}
                            noOfSections={4}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
                            yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                            rulesType="solid"
                            rulesColor={colors.border}
                            isAnimated
                            animationDuration={800}
                        />
                    </View>
                </View>

                {/* Recent Sessions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Recent Sessions</Text>
                    {RECENT_SESSIONS.map((session, index) => (
                        <Animated.View
                            key={index}
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
                            <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.sessionInfo}>
                                    <Text style={[styles.sessionDate, { color: colors.foreground }]}>{session.date}</Text>
                                    <View style={styles.sessionMeta}>
                                        <Text style={[styles.sessionDetail, { color: colors.mutedForeground }]}>
                                            {session.weight} × {session.reps}
                                        </Text>
                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                        <Text style={[styles.sessionDetail, { color: colors.mutedForeground }]}>
                                            e1RM: {session.e1rm}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.sessionRight}>
                                    {session.isPR ? (
                                        <View style={[styles.prSessionBadge, { backgroundColor: `${colors.stats.pr}15` }]}>
                                            <MaterialCommunityIcons name="crown" size={14} color={colors.stats.pr} />
                                            <Text style={[styles.prSessionText, { color: colors.stats.pr }]}>PR</Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.e1rmValue, { color: colors.foreground }]}>{session.e1rm}</Text>
                                    )}
                                </View>
                            </View>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFF' },
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
    prDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    sessionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    sessionInfo: { flex: 1 },
    sessionDate: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sessionDetail: { fontSize: 14 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    sessionRight: { alignItems: 'flex-end' },
    prSessionBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
    prSessionText: { fontSize: 14, fontWeight: '700' },
    e1rmValue: { fontSize: 20, fontWeight: '700', fontFamily: fontFamilies.mono },
});
