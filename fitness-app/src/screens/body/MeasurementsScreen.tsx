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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const MEASUREMENTS = [
    { id: 'chest', name: 'Chest', value: 42.5, change: 1.5, unit: 'in', icon: 'chest' },
    { id: 'waist', name: 'Waist', value: 32.0, change: -1.0, unit: 'in', icon: 'human' },
    { id: 'hips', name: 'Hips', value: 38.5, change: -0.5, unit: 'in', icon: 'human-male' },
    { id: 'biceps_l', name: 'Left Bicep', value: 15.0, change: 0.5, unit: 'in', icon: 'arm-flex' },
    { id: 'biceps_r', name: 'Right Bicep', value: 15.2, change: 0.6, unit: 'in', icon: 'arm-flex' },
    { id: 'thigh_l', name: 'Left Thigh', value: 24.0, change: 0.3, unit: 'in', icon: 'human-male-height' },
    { id: 'thigh_r', name: 'Right Thigh', value: 24.2, change: 0.4, unit: 'in', icon: 'human-male-height' },
    { id: 'calf', name: 'Calves', value: 15.5, change: 0.2, unit: 'in', icon: 'human' },
    { id: 'neck', name: 'Neck', value: 16.0, change: 0.1, unit: 'in', icon: 'account' },
    { id: 'forearm', name: 'Forearm', value: 12.5, change: 0.3, unit: 'in', icon: 'arm-flex-outline' },
];

export function MeasurementsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#6366F1', '#4F46E5'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Measurements</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setEditMode(!editMode)}>
                    <Ionicons name={editMode ? 'checkmark' : 'pencil'} size={22} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Last Updated */}
                <View style={styles.lastUpdated}>
                    <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.lastUpdatedText, { color: colors.mutedForeground }]}>
                        Last updated: Today at 9:30 AM
                    </Text>
                </View>

                {/* Measurements Grid */}
                <Animated.View style={[styles.measurementsGrid, { opacity: fadeAnim }]}>
                    {MEASUREMENTS.map((m, index) => (
                        <Animated.View
                            key={m.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [15 + index * 2, 0]
                                    })
                                }]
                            }}
                        >
                            <View style={[styles.measureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.measureHeader}>
                                    <View style={[styles.measureIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                        <MaterialCommunityIcons name={m.icon as any} size={22} color={colors.primary.main} />
                                    </View>
                                    <Text style={[styles.measureName, { color: colors.foreground }]}>{m.name}</Text>
                                </View>
                                <View style={styles.measureValueRow}>
                                    {editMode ? (
                                        <TextInput
                                            style={[styles.measureInput, { color: colors.foreground, backgroundColor: colors.muted }]}
                                            defaultValue={m.value.toString()}
                                            keyboardType="decimal-pad"
                                        />
                                    ) : (
                                        <Text style={[styles.measureValue, { color: colors.foreground }]}>{m.value}</Text>
                                    )}
                                    <Text style={[styles.measureUnit, { color: colors.mutedForeground }]}>{m.unit}</Text>
                                </View>
                                {m.change !== 0 && !editMode && (
                                    <View style={[
                                        styles.measureChange,
                                        { backgroundColor: m.change > 0 ? `${colors.success}15` : `${colors.success}15` }
                                    ]}>
                                        <Ionicons
                                            name={m.change > 0 ? 'arrow-up' : 'arrow-down'}
                                            size={12}
                                            color={colors.success}
                                        />
                                        <Text style={[styles.measureChangeText, { color: colors.success }]}>
                                            {Math.abs(m.change)} {m.unit}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Tips */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>💡 Measurement Tips</Text>
                    <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.tipText, { color: colors.foreground }]}>
                            • Measure at the same time each day{'\n'}
                            • Use a flexible tape measure{'\n'}
                            • Keep tape snug but not tight{'\n'}
                            • Measure before eating/drinking{'\n'}
                            • Take 3 measurements, use average
                        </Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Add Measurement Button */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
                <LinearGradient colors={['#6366F1', '#4F46E5'] as [string, string]} style={styles.fabGradient}>
                    <Ionicons name="add" size={28} color="#FFF" />
                    <Text style={styles.fabText}>Log All</Text>
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
    measureInput: { fontSize: 28, fontWeight: '700', fontFamily: fontFamilies.mono, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, width: 80 },
    measureChange: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10, gap: 4 },
    measureChangeText: { fontSize: 12, fontWeight: '600' },
    section: { marginTop: 28, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    tipsCard: { padding: 18, borderRadius: 18, borderWidth: 1 },
    tipText: { fontSize: 14, lineHeight: 26 },
    fab: { position: 'absolute', bottom: 100, left: 16, right: 16, borderRadius: 20, elevation: 8, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
    fabGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, gap: 10 },
    fabText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
