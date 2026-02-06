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
import { PieChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - Muscle distribution
// ============================================================
const MUSCLE_DATA = [
    { name: 'Chest', value: 25, color: '#6366F1', icon: 'chest', status: 'balanced' },
    { name: 'Back', value: 22, color: '#10B981', icon: 'human-male-height-variant', status: 'balanced' },
    { name: 'Shoulders', value: 18, color: '#F59E0B', icon: 'human-handsup', status: 'balanced' },
    { name: 'Legs', value: 15, color: '#EC4899', icon: 'leg', status: 'undertrained', recommended: 25 },
    { name: 'Arms', value: 12, color: '#8B5CF6', icon: 'arm-flex', status: 'balanced' },
    { name: 'Core', value: 8, color: '#14B8A6', icon: 'human', status: 'balanced' },
];

const BALANCE_ALERTS = [
    { type: 'warning', muscle: 'Legs', message: 'Undertrained at 15%. Aim for 20-25%', icon: 'alert-circle' },
    { type: 'info', muscle: 'Push/Pull', message: 'Well balanced! 43% push : 42% pull', icon: 'checkmark-circle' },
];

export function MuscleDistributionScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [period, setPeriod] = useState('30D');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const pieData = MUSCLE_DATA.map((m) => ({
        value: m.value,
        color: m.color,
        text: `${m.value}%`,
        focused: m.status === 'undertrained',
    }));

    const totalWorkouts = 24;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#EC4899', '#DB2777'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Muscles</Text>
                <View style={styles.headerBtn} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View style={styles.periodRow}>
                    {['7D', '30D', '90D', 'ALL'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodBtn, period === p && { backgroundColor: '#EC4899' }]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, { color: period === p ? '#FFF' : colors.mutedForeground }]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Donut Chart */}
                <Animated.View style={[styles.chartSection, { opacity: fadeAnim }]}>
                    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <PieChart
                            data={pieData}
                            donut
                            innerRadius={70}
                            radius={100}
                            innerCircleColor={colors.card}
                            centerLabelComponent={() => (
                                <View style={styles.centerLabel}>
                                    <Text style={[styles.centerValue, { color: colors.foreground }]}>{totalWorkouts}</Text>
                                    <Text style={[styles.centerText, { color: colors.mutedForeground }]}>workouts</Text>
                                </View>
                            )}
                            showText
                            textColor="#FFF"
                            textSize={11}
                            fontWeight="600"
                            focusOnPress
                            showValuesAsLabels
                        />
                    </View>
                </Animated.View>

                {/* Balance Alerts */}
                <View style={styles.section}>
                    {BALANCE_ALERTS.map((alert, index) => (
                        <View
                            key={index}
                            style={[
                                styles.alertCard,
                                {
                                    backgroundColor: alert.type === 'warning' ? `${colors.warning}10` : `${colors.success}10`,
                                    borderColor: alert.type === 'warning' ? `${colors.warning}30` : `${colors.success}30`,
                                }
                            ]}
                        >
                            <Ionicons
                                name={alert.icon as any}
                                size={24}
                                color={alert.type === 'warning' ? colors.warning : colors.success}
                            />
                            <View style={styles.alertContent}>
                                <Text style={[styles.alertMuscle, { color: alert.type === 'warning' ? colors.warning : colors.success }]}>
                                    {alert.muscle}
                                </Text>
                                <Text style={[styles.alertMessage, { color: colors.foreground }]}>{alert.message}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Muscle Breakdown List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>Breakdown</Text>
                    {MUSCLE_DATA.map((muscle, index) => (
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
                            <View style={[styles.muscleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.muscleIcon, { backgroundColor: `${muscle.color}15` }]}>
                                    <MaterialCommunityIcons name={muscle.icon as any} size={22} color={muscle.color} />
                                </View>
                                <View style={styles.muscleInfo}>
                                    <View style={styles.muscleHeader}>
                                        <Text style={[styles.muscleName, { color: colors.foreground }]}>{muscle.name}</Text>
                                        <Text style={[styles.muscleValue, { color: muscle.color }]}>{muscle.value}%</Text>
                                    </View>
                                    <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                        <View style={[styles.progressFill, { width: `${muscle.value}%`, backgroundColor: muscle.color }]} />
                                        {muscle.recommended && (
                                            <View style={[styles.recommendedMarker, { left: `${muscle.recommended}%` }]} />
                                        )}
                                    </View>
                                </View>
                                {muscle.status === 'undertrained' && (
                                    <View style={[styles.statusBadge, { backgroundColor: `${colors.warning}15` }]}>
                                        <Ionicons name="arrow-down" size={14} color={colors.warning} />
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Legend */}
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
                                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Overtrained</Text>
                            </View>
                        </View>
                    </View>
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
    periodRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    periodBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
    periodText: { fontSize: 14, fontWeight: '600' },
    chartSection: { alignItems: 'center', paddingHorizontal: 16 },
    chartCard: { padding: 30, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
    centerLabel: { alignItems: 'center' },
    centerValue: { fontSize: 36, fontWeight: '800', fontFamily: fontFamilies.mono },
    centerText: { fontSize: 14, marginTop: 4 },
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
    recommendedMarker: { position: 'absolute', top: -2, width: 2, height: 12, backgroundColor: '#FFF', borderRadius: 1 },
    statusBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    legendCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    legendRow: { flexDirection: 'row', justifyContent: 'space-around' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6 },
    legendText: { fontSize: 13 },
});
