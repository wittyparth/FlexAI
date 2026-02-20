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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MUSCLE HEATMAP DATA - Simple squares with intensity
// ============================================================
const BODY_FRONT = [
    { id: 'chest', name: 'Chest', intensity: 85, row: 0, col: 1 },
    { id: 'shoulders_l', name: 'L Shoulder', intensity: 70, row: 0, col: 0 },
    { id: 'shoulders_r', name: 'R Shoulder', intensity: 65, row: 0, col: 2 },
    { id: 'biceps_l', name: 'L Bicep', intensity: 55, row: 1, col: 0 },
    { id: 'biceps_r', name: 'R Bicep', intensity: 60, row: 1, col: 2 },
    { id: 'abs', name: 'Abs', intensity: 40, row: 1, col: 1 },
    { id: 'quads_l', name: 'L Quad', intensity: 30, row: 2, col: 0 },
    { id: 'quads_r', name: 'R Quad', intensity: 35, row: 2, col: 2 },
    { id: 'core', name: 'Core', intensity: 45, row: 2, col: 1 },
];

const BODY_BACK = [
    { id: 'traps', name: 'Traps', intensity: 75, row: 0, col: 1 },
    { id: 'rear_delt_l', name: 'L Rear Delt', intensity: 50, row: 0, col: 0 },
    { id: 'rear_delt_r', name: 'R Rear Delt', intensity: 55, row: 0, col: 2 },
    { id: 'lats_l', name: 'L Lat', intensity: 80, row: 1, col: 0 },
    { id: 'lats_r', name: 'R Lat', intensity: 78, row: 1, col: 2 },
    { id: 'lower_back', name: 'Lower Back', intensity: 60, row: 1, col: 1 },
    { id: 'glutes_l', name: 'L Glute', intensity: 25, row: 2, col: 0 },
    { id: 'glutes_r', name: 'R Glute', intensity: 28, row: 2, col: 2 },
    { id: 'hamstrings', name: 'Hamstrings', intensity: 20, row: 2, col: 1 },
];

const SQUARE_SIZE = (width - 80) / 3;

export function MuscleHeatmapScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [view, setView] = React.useState<'front' | 'back'>('front');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const getIntensityColor = (intensity: number) => {
        if (intensity >= 80) return '#EF4444'; // Hot red
        if (intensity >= 60) return '#F97316'; // Orange
        if (intensity >= 40) return '#FBBF24'; // Yellow
        if (intensity >= 20) return '#34D399'; // Green
        return '#6B7280'; // Gray (rested)
    };

    const getIntensityLabel = (intensity: number) => {
        if (intensity >= 80) return 'High Volume';
        if (intensity >= 60) return 'Moderate';
        if (intensity >= 40) return 'Light';
        if (intensity >= 20) return 'Recovery';
        return 'Rested';
    };

    const currentData = view === 'front' ? BODY_FRONT : BODY_BACK;

    const renderGrid = () => {
        const rows: React.ReactNode[][] = [[], [], []];
        currentData.forEach((muscle) => {
            rows[muscle.row].push(
                <TouchableOpacity
                    key={muscle.id}
                    style={[styles.muscleSquare, { backgroundColor: getIntensityColor(muscle.intensity) }]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.muscleEmoji}>
                        {muscle.intensity >= 80 ? '🔥' : muscle.intensity >= 60 ? '💪' : muscle.intensity >= 40 ? '✨' : '💤'}
                    </Text>
                    <Text style={styles.muscleName}>{muscle.name}</Text>
                    <Text style={styles.muscleIntensity}>{muscle.intensity}%</Text>
                </TouchableOpacity>
            );
        });
        return rows;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Muscle Heatmap</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* View Toggle */}
                <View style={styles.toggleContainer}>
                    <View style={[styles.toggleBg, { backgroundColor: colors.muted }]}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, view === 'front' && { backgroundColor: colors.primary.main }]}
                            onPress={() => setView('front')}
                        >
                            <Text style={[styles.toggleText, { color: view === 'front' ? '#FFF' : colors.foreground }]}>Front</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, view === 'back' && { backgroundColor: colors.primary.main }]}
                            onPress={() => setView('back')}
                        >
                            <Text style={[styles.toggleText, { color: view === 'back' ? '#FFF' : colors.foreground }]}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Period Selector */}
                <View style={styles.periodRow}>
                    {['7D', '30D', '90D'].map((p, i) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodBtn, i === 1 && { backgroundColor: colors.primary.main }]}
                        >
                            <Text style={[styles.periodText, { color: i === 1 ? '#FFF' : colors.mutedForeground }]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Heatmap Grid */}
                <Animated.View style={[styles.gridContainer, { opacity: fadeAnim }]}>
                    <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.gridTitle, { color: colors.foreground }]}>
                            {view === 'front' ? '👤 Front View' : '🔙 Back View'}
                        </Text>
                        {renderGrid().map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.gridRow}>
                                {row}
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Legend */}
                <View style={styles.legendSection}>
                    <Text style={[styles.legendTitle, { color: colors.foreground }]}>Intensity Legend</Text>
                    <View style={[styles.legendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {[
                            { color: '#EF4444', label: 'High Volume (80%+)', emoji: '🔥' },
                            { color: '#F97316', label: 'Moderate (60-79%)', emoji: '💪' },
                            { color: '#FBBF24', label: 'Light (40-59%)', emoji: '✨' },
                            { color: '#34D399', label: 'Recovery (20-39%)', emoji: '🌱' },
                            { color: '#6B7280', label: 'Rested (<20%)', emoji: '💤' },
                        ].map((item) => (
                            <View key={item.label} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <Text style={styles.legendEmoji}>{item.emoji}</Text>
                                <Text style={[styles.legendLabel, { color: colors.foreground }]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Insights */}
                <View style={styles.insightsSection}>
                    <Text style={[styles.insightsTitle, { color: colors.foreground }]}>💡 Insights</Text>
                    <View style={[styles.insightCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]}>
                        <Ionicons name="alert-circle" size={24} color={colors.warning} />
                        <View style={styles.insightContent}>
                            <Text style={[styles.insightHeadline, { color: colors.warning }]}>Leg Day Needed</Text>
                            <Text style={[styles.insightText, { color: colors.foreground }]}>Your lower body is undertrained. Consider adding a leg workout this week.</Text>
                        </View>
                    </View>
                    <View style={[styles.insightCard, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        <View style={styles.insightContent}>
                            <Text style={[styles.insightHeadline, { color: colors.success }]}>Great Upper Body Work</Text>
                            <Text style={[styles.insightText, { color: colors.foreground }]}>Chest and back are well-trained. Keep up the balanced pushing and pulling!</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    toggleContainer: { paddingHorizontal: 16, paddingTop: 20 },
    toggleBg: { flexDirection: 'row', borderRadius: 14, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    toggleText: { fontSize: 15, fontWeight: '600' },
    periodRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    periodBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    periodText: { fontSize: 14, fontWeight: '600' },
    gridContainer: { paddingHorizontal: 16 },
    gridCard: { padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
    gridTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
    gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    muscleSquare: { width: SQUARE_SIZE, height: SQUARE_SIZE, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 8 },
    muscleEmoji: { fontSize: 24, marginBottom: 4 },
    muscleName: { color: '#FFF', fontSize: 12, fontWeight: '600', textAlign: 'center' },
    muscleIntensity: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '800', marginTop: 4 },
    legendSection: { paddingHorizontal: 16, marginTop: 24 },
    legendTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    legendCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    legendDot: { width: 20, height: 20, borderRadius: 6 },
    legendEmoji: { fontSize: 18 },
    legendLabel: { fontSize: 14, flex: 1 },
    insightsSection: { paddingHorizontal: 16, marginTop: 24 },
    insightsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    insightCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    insightContent: { flex: 1 },
    insightHeadline: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    insightText: { fontSize: 14, lineHeight: 20 },
});
