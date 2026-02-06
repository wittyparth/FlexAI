import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const WEIGHT_HISTORY = [
    { date: 'Mar 5', weight: 175.5, change: -0.5 },
    { date: 'Mar 4', weight: 176.0, change: -1.0 },
    { date: 'Mar 3', weight: 177.0, change: 0.5 },
    { date: 'Mar 2', weight: 176.5, change: -0.5 },
    { date: 'Mar 1', weight: 177.0, change: -0.5 },
    { date: 'Feb 28', weight: 177.5, change: -1.0 },
    { date: 'Feb 27', weight: 178.5, change: 0 },
];

const CHART_DATA = [
    { value: 180 }, { value: 179 }, { value: 178.5 }, { value: 178 },
    { value: 177 }, { value: 176.5 }, { value: 176 }, { value: 175.5 },
];

export function WeightLogScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [weight, setWeight] = useState('');
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const currentWeight = 175.5;
    const startWeight = 185;
    const goalWeight = 170;
    const progressPercent = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Weight Log</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Ionicons name="settings-outline" size={22} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Current Weight Display */}
                    <Animated.View style={[styles.currentSection, { opacity: fadeAnim }]}>
                        <View style={[styles.currentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.currentLabel, { color: colors.mutedForeground }]}>Current Weight</Text>
                            <View style={styles.currentRow}>
                                <Text style={[styles.currentValue, { color: colors.foreground }]}>{currentWeight}</Text>
                                <Text style={[styles.currentUnit, { color: colors.mutedForeground }]}>lbs</Text>
                            </View>
                            <View style={styles.goalProgress}>
                                <View style={styles.goalLabels}>
                                    <Text style={[styles.goalText, { color: colors.mutedForeground }]}>Start: {startWeight}</Text>
                                    <Text style={[styles.goalText, { color: colors.mutedForeground }]}>Goal: {goalWeight}</Text>
                                </View>
                                <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                    <LinearGradient
                                        colors={['#10B981', '#059669'] as [string, string]}
                                        style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: colors.success }]}>{progressPercent.toFixed(0)}% to goal!</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Chart */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>30-Day Trend</Text>
                        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <LineChart
                                data={CHART_DATA}
                                width={width - 80}
                                height={150}
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
                                noOfSections={4}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                isAnimated
                            />
                        </View>
                    </View>

                    {/* History */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
                        {WEIGHT_HISTORY.map((entry, i) => (
                            <View key={i} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.historyIcon, { backgroundColor: `${colors.success}15` }]}>
                                    <MaterialCommunityIcons name="scale-bathroom" size={22} color={colors.success} />
                                </View>
                                <View style={styles.historyContent}>
                                    <Text style={[styles.historyWeight, { color: colors.foreground }]}>{entry.weight} lbs</Text>
                                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{entry.date}</Text>
                                </View>
                                {entry.change !== 0 && (
                                    <View style={[styles.historyChange, { backgroundColor: entry.change < 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                                        <Ionicons
                                            name={entry.change < 0 ? 'arrow-down' : 'arrow-up'}
                                            size={14}
                                            color={entry.change < 0 ? colors.success : colors.error}
                                        />
                                        <Text style={{ color: entry.change < 0 ? colors.success : colors.error, fontSize: 13, fontWeight: '600' }}>
                                            {Math.abs(entry.change)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Add Weight FAB/Input */}
                {showInput ? (
                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
                        <View style={[styles.inputRow, { backgroundColor: colors.muted }]}>
                            <TextInput
                                style={[styles.textInput, { color: colors.foreground }]}
                                placeholder="Enter weight..."
                                placeholderTextColor={colors.mutedForeground}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                autoFocus
                            />
                            <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>lbs</Text>
                        </View>
                        <View style={styles.inputBtns}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowInput(false)}>
                                <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.9}>
                                <LinearGradient colors={['#10B981', '#059669'] as [string, string]} style={styles.saveGradient}>
                                    <Text style={styles.saveText}>Save</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.fab} onPress={() => setShowInput(true)} activeOpacity={0.9}>
                        <LinearGradient colors={['#10B981', '#059669'] as [string, string]} style={styles.fabGradient}>
                            <Ionicons name="add" size={28} color="#FFF" />
                            <Text style={styles.fabText}>Log Weight</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    currentSection: { paddingHorizontal: 16, paddingTop: 20 },
    currentCard: { padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
    currentLabel: { fontSize: 14, marginBottom: 8 },
    currentRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    currentValue: { fontSize: 56, fontWeight: '800', fontFamily: fontFamilies.mono },
    currentUnit: { fontSize: 22 },
    goalProgress: { width: '100%', marginTop: 20 },
    goalLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    goalText: { fontSize: 13 },
    progressBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 5 },
    progressText: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 12 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    chartCard: { borderRadius: 20, borderWidth: 1, padding: 20, overflow: 'hidden' },
    historyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    historyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    historyContent: { flex: 1 },
    historyWeight: { fontSize: 18, fontWeight: '700', fontFamily: fontFamilies.mono, marginBottom: 4 },
    historyDate: { fontSize: 14 },
    historyChange: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 4 },
    fab: { position: 'absolute', bottom: 100, left: 16, right: 16, borderRadius: 20, elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
    fabGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, gap: 10 },
    fabText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    inputContainer: { padding: 16, borderTopWidth: 1 },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderRadius: 18, marginBottom: 14 },
    textInput: { flex: 1, fontSize: 24, fontWeight: '700', paddingVertical: 18, fontFamily: fontFamilies.mono },
    inputUnit: { fontSize: 18 },
    inputBtns: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
    cancelText: { fontSize: 16, fontWeight: '600' },
    saveBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
    saveGradient: { paddingVertical: 16, alignItems: 'center' },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
