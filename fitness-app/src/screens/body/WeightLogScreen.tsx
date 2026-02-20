import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useLogWeight, useWeightHistory } from '../../hooks/queries/useBodyQueries';

const { width } = Dimensions.get('window');
const WEIGHT_UNIT = 'kg';

const formatDisplayDate = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
        return 'Unknown';
    }

    return value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function WeightLogScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [weight, setWeight] = useState('');
    const [showInput, setShowInput] = useState(false);

    const { data: weightEntries = [], isLoading, isError, refetch } = useWeightHistory();
    const logWeightMutation = useLogWeight();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const sortedAsc = useMemo(
        () => [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [weightEntries],
    );

    const historyRows = useMemo(() => {
        if (!sortedAsc.length) return [];

        const changes = new Map<string, number>();
        sortedAsc.forEach((entry, index) => {
            const previous = sortedAsc[index - 1];
            changes.set(entry.id, previous ? entry.weight - previous.weight : 0);
        });

        return [...sortedAsc].reverse().map((entry) => ({
            ...entry,
            change: changes.get(entry.id) ?? 0,
        }));
    }, [sortedAsc]);

    const chartData = useMemo(() => {
        const points = sortedAsc.slice(-12);
        if (!points.length) return [];

        const labelStep = Math.max(1, Math.floor(points.length / 4));
        return points.map((entry, index) => ({
            value: Number(entry.weight.toFixed(1)),
            label: index % labelStep === 0 ? formatDisplayDate(entry.date) : '',
        }));
    }, [sortedAsc]);

    const currentWeight = sortedAsc.length ? sortedAsc[sortedAsc.length - 1].weight : 0;
    const startWeight = sortedAsc[0]?.weight ?? 0;

    const goalWeight = useMemo(() => {
        if (!startWeight) return 0;
        return currentWeight <= startWeight ? startWeight - 5 : startWeight + 5;
    }, [currentWeight, startWeight]);

    const progressPercent = useMemo(() => {
        if (!startWeight || !goalWeight || startWeight === goalWeight) return 0;
        const progress = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
        return clamp(progress);
    }, [currentWeight, goalWeight, startWeight]);

    const handleSaveWeight = async () => {
        const parsedWeight = Number.parseFloat(weight);
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
            Alert.alert('Invalid weight', 'Enter a valid weight value.');
            return;
        }

        try {
            await logWeightMutation.mutateAsync({
                weight: parsedWeight,
                date: new Date().toISOString(),
            });
            setWeight('');
            setShowInput(false);
        } catch (error: any) {
            Alert.alert('Unable to save', error?.message ?? 'Something went wrong while saving your weight.');
        }
    };

    const chartWidth = width - 80;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Weight Log</Text>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => refetch()}>
                        <Ionicons name="refresh" size={20} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                {isLoading && !weightEntries.length ? (
                    <View style={styles.centerState}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                ) : isError && !weightEntries.length ? (
                    <View style={styles.centerState}>
                        <Text style={[styles.emptyText, { color: colors.error }]}>Failed to load weight history.</Text>
                        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary.main }]} onPress={() => refetch()}>
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Animated.View style={[styles.currentSection, { opacity: fadeAnim }]}>
                            <View style={[styles.currentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.currentLabel, { color: colors.mutedForeground }]}>Current Weight</Text>
                                <View style={styles.currentRow}>
                                    <Text style={[styles.currentValue, { color: colors.foreground }]}>
                                        {currentWeight ? currentWeight.toFixed(1) : '--'}
                                    </Text>
                                    <Text style={[styles.currentUnit, { color: colors.mutedForeground }]}>{WEIGHT_UNIT}</Text>
                                </View>

                                {sortedAsc.length > 0 ? (
                                    <View style={styles.goalProgress}>
                                        <View style={styles.goalLabels}>
                                            <Text style={[styles.goalText, { color: colors.mutedForeground }]}>First: {startWeight.toFixed(1)} {WEIGHT_UNIT}</Text>
                                            <Text style={[styles.goalText, { color: colors.mutedForeground }]}>Goal: {goalWeight.toFixed(1)} {WEIGHT_UNIT}</Text>
                                        </View>
                                        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${progressPercent}%`,
                                                        backgroundColor: colors.success,
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.progressText, { color: colors.success }]}>{progressPercent.toFixed(0)}% toward target delta</Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No weight entries yet.</Text>
                                )}
                            </View>
                        </Animated.View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trend</Text>
                            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {chartData.length < 2 ? (
                                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Log at least two entries to visualize trends.</Text>
                                ) : (
                                    <LineChart
                                        data={chartData}
                                        width={chartWidth}
                                        height={170}
                                        color={colors.success}
                                        thickness={3}
                                        hideDataPoints={false}
                                        dataPointsColor={colors.success}
                                        dataPointsRadius={4}
                                        curved
                                        areaChart
                                        startFillColor={colors.success}
                                        endFillColor={colors.background}
                                        startOpacity={0.25}
                                        endOpacity={0.02}
                                        noOfSections={4}
                                        yAxisThickness={0}
                                        xAxisThickness={0}
                                        xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                        yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
                                        isAnimated
                                        animationDuration={700}
                                    />
                                )}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
                            {historyRows.length === 0 ? (
                                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No entries yet.</Text>
                            ) : (
                                historyRows.map((entry) => (
                                    <View key={entry.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={[styles.historyIcon, { backgroundColor: `${colors.success}15` }]}>
                                            <MaterialCommunityIcons name="scale-bathroom" size={22} color={colors.success} />
                                        </View>
                                        <View style={styles.historyContent}>
                                            <Text style={[styles.historyWeight, { color: colors.foreground }]}>
                                                {entry.weight.toFixed(1)} {WEIGHT_UNIT}
                                            </Text>
                                            <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{formatDisplayDate(entry.date)}</Text>
                                        </View>
                                        {entry.change !== 0 && (
                                            <View style={[styles.historyChange, { backgroundColor: entry.change < 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                                                <Ionicons
                                                    name={entry.change < 0 ? 'arrow-down' : 'arrow-up'}
                                                    size={14}
                                                    color={entry.change < 0 ? colors.success : colors.error}
                                                />
                                                <Text style={{ color: entry.change < 0 ? colors.success : colors.error, fontSize: 13, fontWeight: '600' }}>
                                                    {Math.abs(entry.change).toFixed(1)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>

                        <View style={{ height: 120 }} />
                    </ScrollView>
                )}

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
                            <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>{WEIGHT_UNIT}</Text>
                        </View>
                        <View style={styles.inputBtns}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                onPress={() => {
                                    setShowInput(false);
                                    setWeight('');
                                }}
                                disabled={logWeightMutation.isPending}
                            >
                                <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveBtn}
                                activeOpacity={0.9}
                                onPress={handleSaveWeight}
                                disabled={logWeightMutation.isPending}
                            >
                                <View style={[styles.saveGradient, { backgroundColor: colors.primary.main }]}>
                                    <Text style={styles.saveText}>{logWeightMutation.isPending ? 'Saving...' : 'Save'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.fab} onPress={() => setShowInput(true)} activeOpacity={0.9}>
                        <View style={[styles.fabGradient, { backgroundColor: colors.primary.main }]}>
                            <Ionicons name="add" size={28} color="#FFF" />
                            <Text style={styles.fabText}>Log Weight</Text>
                        </View>
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
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
    retryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    retryBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
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
    emptyText: { fontSize: 14, textAlign: 'center' },
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
