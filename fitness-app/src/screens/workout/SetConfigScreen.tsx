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
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// CONFIG OPTIONS
// ============================================================
const SET_TYPES = [
    { id: 'normal', label: 'Normal', icon: 'dumbbell', color: '#3B82F6', description: 'Standard working set' },
    { id: 'warmup', label: 'Warm-up', icon: 'fire', color: '#F59E0B', description: 'Lighter preparatory set' },
    { id: 'dropset', label: 'Drop Set', icon: 'trending-down', color: '#EF4444', description: 'Reduce weight, continue reps' },
    { id: 'failure', label: 'To Failure', icon: 'skull', color: '#8B5CF6', description: 'Push until muscle failure' },
    { id: 'superset', label: 'Superset', icon: 'link-variant', color: '#10B981', description: 'Paired with another exercise' },
];

const REST_OPTIONS = [
    { value: 30, label: '30s', emoji: '⚡' },
    { value: 60, label: '1m', emoji: '💪' },
    { value: 90, label: '1:30', emoji: '🔥' },
    { value: 120, label: '2m', emoji: '🏋️' },
    { value: 180, label: '3m', emoji: '🦾' },
    { value: 0, label: 'None', emoji: '➡️' },
];

const RPE_VALUES = [6, 7, 8, 9, 10];

export function SetConfigScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [setType, setSetType] = useState('normal');
    const [restTime, setRestTime] = useState(90);
    const [targetRpe, setTargetRpe] = useState(8);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const selectedType = SET_TYPES.find(t => t.id === setType);

    const getRpeColor = (rpe: number) => {
        if (rpe >= 10) return colors.error;
        if (rpe >= 9) return '#F97316';
        if (rpe >= 8) return colors.warning;
        return colors.success;
    };

    const getRpeLabel = (rpe: number) => {
        if (rpe >= 10) return 'Max Effort';
        if (rpe >= 9) return 'Very Hard';
        if (rpe >= 8) return 'Hard';
        if (rpe >= 7) return 'Moderate';
        return 'Easy';
    };

    const handleSave = () => {
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Set Options</Text>
                <TouchableOpacity onPress={handleSave}>
                    <View style={styles.saveBtn}>
                        <Text style={styles.saveText}>Save</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Set Type */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Set Type</Text>
                        <View style={styles.typeGrid}>
                            {SET_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeCard,
                                        setType === type.id
                                            ? { backgroundColor: type.color, borderColor: type.color }
                                            : { backgroundColor: colors.card, borderColor: colors.border }
                                    ]}
                                    onPress={() => setSetType(type.id)}
                                    activeOpacity={0.9}
                                >
                                    <View style={[
                                        styles.typeIcon,
                                        setType === type.id
                                            ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                                            : { backgroundColor: `${type.color}15` }
                                    ]}>
                                        <MaterialCommunityIcons
                                            name={type.icon as any}
                                            size={24}
                                            color={setType === type.id ? '#FFF' : type.color}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.typeLabel,
                                        { color: setType === type.id ? '#FFF' : colors.foreground }
                                    ]}>{type.label}</Text>
                                    {setType === type.id && (
                                        <View style={styles.typeCheck}>
                                            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {selectedType && (
                            <View style={[styles.typeHint, { backgroundColor: `${selectedType.color}10`, borderColor: `${selectedType.color}30` }]}>
                                <MaterialCommunityIcons name="information" size={18} color={selectedType.color} />
                                <Text style={[styles.typeHintText, { color: selectedType.color }]}>{selectedType.description}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Rest Time */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rest Timer</Text>
                        <View style={[styles.selectedBadge, { backgroundColor: colors.primary.main }]}>
                            <Text style={styles.selectedBadgeText}>
                                {restTime === 0 ? 'No rest' : REST_OPTIONS.find(r => r.value === restTime)?.label}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.restGrid}>
                        {REST_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.restCard,
                                    restTime === option.value
                                        ? { backgroundColor: colors.primary.main }
                                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                ]}
                                onPress={() => setRestTime(option.value)}
                            >
                                <Text style={styles.restEmoji}>{option.emoji}</Text>
                                <Text style={[
                                    styles.restLabel,
                                    { color: restTime === option.value ? '#FFF' : colors.foreground }
                                ]}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Target RPE */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Target RPE</Text>
                        <View style={[styles.rpeBadge, { backgroundColor: `${getRpeColor(targetRpe)}15` }]}>
                            <Text style={[styles.rpeBadgeText, { color: getRpeColor(targetRpe) }]}>{getRpeLabel(targetRpe)}</Text>
                        </View>
                    </View>
                    <View style={[styles.rpeContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.rpeScale}>
                            {RPE_VALUES.map((rpe) => (
                                <TouchableOpacity
                                    key={rpe}
                                    style={[
                                        styles.rpeButton,
                                        targetRpe === rpe && { backgroundColor: getRpeColor(rpe) }
                                    ]}
                                    onPress={() => setTargetRpe(rpe)}
                                >
                                    <Text style={[
                                        styles.rpeNumber,
                                        { color: targetRpe === rpe ? '#FFF' : colors.foreground }
                                    ]}>{rpe}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.rpeInfo}>
                            <Text style={[styles.rpeInfoTitle, { color: colors.foreground }]}>RPE {targetRpe}</Text>
                            <Text style={[styles.rpeInfoDesc, { color: colors.mutedForeground }]}>
                                {targetRpe === 10 ? 'Maximum effort, no reps left' :
                                    targetRpe === 9 ? 'Could do 1 more rep' :
                                        targetRpe === 8 ? 'Could do 2 more reps' :
                                            targetRpe === 7 ? 'Could do 3 more reps' :
                                                'Could do 4+ more reps'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Summary Preview */}
                <View style={styles.section}>
                    <View10`, `${colors.primary.main}05`]}
                        style={styles.summaryCard}
                    >
                        <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Set Preview</Text>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <MaterialCommunityIcons name={selectedType?.icon as any} size={20} color={selectedType?.color} />
                                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Type</Text>
                                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selectedType?.label}</Text>
                            </View>
                            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.summaryItem}>
                                <Ionicons name="time-outline" size={20} color={colors.primary.main} />
                                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Rest</Text>
                                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                                    {restTime === 0 ? 'None' : `${restTime}s`}
                                </Text>
                            </View>
                            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.summaryItem}>
                                <MaterialCommunityIcons name="gauge" size={20} color={getRpeColor(targetRpe)} />
                                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>RPE</Text>
                                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{targetRpe}</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
    saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    scroll: { padding: 16 },
    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    typeCard: { width: (width - 44) / 2, borderRadius: 18, borderWidth: 1, padding: 18, alignItems: 'center', position: 'relative' },
    typeIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    typeLabel: { fontSize: 15, fontWeight: '700' },
    typeCheck: { position: 'absolute', top: 10, right: 10 },
    typeHint: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
    typeHintText: { flex: 1, fontSize: 14 },
    selectedBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    selectedBadgeText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    restGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    restCard: { width: (width - 56) / 3, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
    restEmoji: { fontSize: 24, marginBottom: 6 },
    restLabel: { fontSize: 15, fontWeight: '700' },
    rpeBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    rpeBadgeText: { fontSize: 14, fontWeight: '700' },
    rpeContainer: { borderRadius: 20, borderWidth: 1, padding: 20 },
    rpeScale: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    rpeButton: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    rpeNumber: { fontSize: 20, fontWeight: '800', fontFamily: fontFamilies.mono },
    rpeInfo: { alignItems: 'center' },
    rpeInfoTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    rpeInfoDesc: { fontSize: 14, textAlign: 'center' },
    summaryCard: { borderRadius: 20, padding: 20 },
    summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center', gap: 6 },
    summaryLabel: { fontSize: 12 },
    summaryValue: { fontSize: 16, fontWeight: '700' },
    summaryDivider: { width: 1, height: 50 },
});
