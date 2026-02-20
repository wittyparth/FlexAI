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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { BodyMeasurements } from '../../api/body.api';
import { useLogMeasurements, useMeasurementHistory } from '../../hooks/queries/useBodyQueries';

const { width } = Dimensions.get('window');

type MeasurementField = {
    key: Exclude<keyof BodyMeasurements, 'notes'>;
    label: string;
    unit: string;
    icon: string;
};

const MEASUREMENT_FIELDS: MeasurementField[] = [
    { key: 'chest', label: 'Chest', unit: 'cm', icon: 'chest' },
    { key: 'waist', label: 'Waist', unit: 'cm', icon: 'human' },
    { key: 'hips', label: 'Hips', unit: 'cm', icon: 'human-male' },
    { key: 'leftBicep', label: 'Left Arm', unit: 'cm', icon: 'arm-flex' },
    { key: 'rightBicep', label: 'Right Arm', unit: 'cm', icon: 'arm-flex' },
    { key: 'leftThigh', label: 'Left Thigh', unit: 'cm', icon: 'human-male-height' },
    { key: 'rightThigh', label: 'Right Thigh', unit: 'cm', icon: 'human-male-height' },
    { key: 'leftCalf', label: 'Left Calf', unit: 'cm', icon: 'run' },
    { key: 'rightCalf', label: 'Right Calf', unit: 'cm', icon: 'run' },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', icon: 'human-male-board' },
    { key: 'neck', label: 'Neck', unit: 'cm', icon: 'account' },
    { key: 'bodyFat', label: 'Body Fat', unit: '%', icon: 'percent' },
];

const formatUpdatedDate = (date?: string) => {
    if (!date) return 'No entries yet';

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return 'No entries yet';

    return value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export function MeasurementsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { data: measurementHistory = [], isLoading, isError, refetch } = useMeasurementHistory();
    const logMeasurementsMutation = useLogMeasurements();

    const [editMode, setEditMode] = useState(false);
    const [draftValues, setDraftValues] = useState<Record<Exclude<keyof BodyMeasurements, 'notes'>, string>>({} as Record<Exclude<keyof BodyMeasurements, 'notes'>, string>);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const sortedDesc = useMemo(
        () => [...measurementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [measurementHistory],
    );

    const latestEntry = sortedDesc[0];
    const previousEntry = sortedDesc[1];

    const cards = useMemo(() => {
        return MEASUREMENT_FIELDS.map((field) => {
            const currentValue = latestEntry?.measurements?.[field.key] as number | undefined;
            const previousValue = previousEntry?.measurements?.[field.key] as number | undefined;

            let change: number | null = null;
            if (currentValue !== undefined && previousValue !== undefined) {
                change = currentValue - previousValue;
            }

            return {
                ...field,
                currentValue,
                change,
            };
        });
    }, [latestEntry, previousEntry]);

    const openEditor = () => {
        const nextDraft = {} as Record<Exclude<keyof BodyMeasurements, 'notes'>, string>;
        MEASUREMENT_FIELDS.forEach((field) => {
            const value = latestEntry?.measurements?.[field.key] as number | undefined;
            nextDraft[field.key] = value !== undefined ? String(value) : '';
        });
        setDraftValues(nextDraft);
        setEditMode(true);
    };

    const saveMeasurements = async () => {
        const payload: BodyMeasurements = {};

        for (const field of MEASUREMENT_FIELDS) {
            const raw = draftValues[field.key]?.trim();
            if (!raw) continue;

            const parsed = Number.parseFloat(raw);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                Alert.alert('Invalid input', `${field.label} must be a positive number.`);
                return;
            }

            payload[field.key] = parsed;
        }

        if (Object.keys(payload).length === 0) {
            Alert.alert('No values', 'Enter at least one measurement before saving.');
            return;
        }

        try {
            await logMeasurementsMutation.mutateAsync({
                ...payload,
                date: new Date().toISOString(),
            });
            setEditMode(false);
        } catch (error: any) {
            Alert.alert('Unable to save', error?.message ?? 'Something went wrong while logging measurements.');
        }
    };

    const handleHeaderAction = () => {
        if (editMode) {
            saveMeasurements();
            return;
        }
        openEditor();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Measurements</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={handleHeaderAction} disabled={logMeasurementsMutation.isPending}>
                    <Ionicons name={editMode ? 'checkmark' : 'pencil'} size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {isLoading && !measurementHistory.length ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : isError && !measurementHistory.length ? (
                <View style={styles.centerState}>
                    <Text style={{ color: colors.error, marginBottom: 12 }}>Failed to load measurements.</Text>
                    <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary.main }]}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.lastUpdated}>
                        <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.lastUpdatedText, { color: colors.mutedForeground }]}>Last updated: {formatUpdatedDate(latestEntry?.date)}</Text>
                    </View>

                    <Animated.View style={[styles.measurementsGrid, { opacity: fadeAnim }]}> 
                        {cards.map((card, index) => (
                            <Animated.View
                                key={card.key}
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{
                                        translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [15 + index * 2, 0] }),
                                    }],
                                }}
                            >
                                <View style={[styles.measureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={styles.measureHeader}>
                                        <View style={[styles.measureIcon, { backgroundColor: `${colors.primary.main}15` }]}> 
                                            <MaterialCommunityIcons name={card.icon as any} size={22} color={colors.primary.main} />
                                        </View>
                                        <Text style={[styles.measureName, { color: colors.foreground }]}>{card.label}</Text>
                                    </View>

                                    <View style={styles.measureValueRow}>
                                        {editMode ? (
                                            <TextInput
                                                style={[styles.measureInput, { color: colors.foreground, backgroundColor: colors.muted }]}
                                                value={draftValues[card.key] ?? ''}
                                                onChangeText={(value) => setDraftValues((prev) => ({ ...prev, [card.key]: value }))}
                                                keyboardType="decimal-pad"
                                                placeholder="0"
                                                placeholderTextColor={colors.mutedForeground}
                                            />
                                        ) : (
                                            <Text style={[styles.measureValue, { color: colors.foreground }]}>
                                                {card.currentValue !== undefined ? card.currentValue.toFixed(1) : '--'}
                                            </Text>
                                        )}
                                        <Text style={[styles.measureUnit, { color: colors.mutedForeground }]}>{card.unit}</Text>
                                    </View>

                                    {card.change !== null && !editMode && (
                                        <View style={[styles.measureChange, { backgroundColor: card.change >= 0 ? `${colors.success}15` : `${colors.error}15` }]}>
                                            <Ionicons
                                                name={card.change >= 0 ? 'arrow-up' : 'arrow-down'}
                                                size={12}
                                                color={card.change >= 0 ? colors.success : colors.error}
                                            />
                                            <Text style={[styles.measureChangeText, { color: card.change >= 0 ? colors.success : colors.error }]}>
                                                {Math.abs(card.change).toFixed(1)} {card.unit}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        ))}
                    </Animated.View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Measurement Tips</Text>
                        <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <Text style={[styles.tipText, { color: colors.foreground }]}>- Measure at the same time each day{`\n`}- Use a flexible tape measure{`\n`}- Keep tape snug but not tight{`\n`}- Measure before food and hydration{`\n`}- Take 2-3 readings and track the average</Text>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => {
                    if (editMode) {
                        saveMeasurements();
                        return;
                    }
                    openEditor();
                }}
                disabled={logMeasurementsMutation.isPending}
            >
                <View style={[styles.fabGradient, { backgroundColor: colors.primary.main }]}> 
                    <Ionicons name={editMode ? 'checkmark' : 'add'} size={28} color="#FFF" />
                    <Text style={styles.fabText}>{editMode ? (logMeasurementsMutation.isPending ? 'Saving...' : 'Save Log') : 'Log All'}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    retryBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
    retryText: { color: '#FFF', fontWeight: '700' },
    lastUpdated: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 6 },
    lastUpdatedText: { fontSize: 13 },
    measurementsGrid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    measureCard: { width: (width - 44) / 2, padding: 18, borderRadius: 18, borderWidth: 1 },
    measureHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    measureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    measureName: { fontSize: 14, fontWeight: '600', flex: 1 },
    measureValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    measureValue: { fontSize: 32, fontWeight: '800', fontFamily: fontFamilies.mono },
    measureUnit: { fontSize: 16 },
    measureInput: { fontSize: 26, fontWeight: '700', fontFamily: fontFamilies.mono, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, width: 90 },
    measureChange: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10, gap: 4 },
    measureChangeText: { fontSize: 12, fontWeight: '600' },
    section: { marginTop: 28, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    tipsCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
    tipText: { fontSize: 14, lineHeight: 24 },
    fab: { position: 'absolute', bottom: 100, left: 16, right: 16, borderRadius: 20, elevation: 8, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
    fabGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, gap: 10 },
    fabText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
