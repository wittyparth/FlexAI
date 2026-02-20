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

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - Personal Records
// ============================================================
const FEATURED_PRS = [
    { exercise: 'Bench Press', weight: 225, unit: 'lbs', date: 'Mar 5, 2025', improvement: '+10', icon: 'dumbbell', color: '#6366F1' },
    { exercise: 'Squat', weight: 315, unit: 'lbs', date: 'Feb 28, 2025', improvement: '+15', icon: 'human', color: '#10B981' },
    { exercise: 'Deadlift', weight: 405, unit: 'lbs', date: 'Mar 1, 2025', improvement: '+20', icon: 'weight-lifter', color: '#F59E0B' },
];

const ALL_PRS = [
    { exercise: 'Bench Press', weight: 225, reps: '1RM', date: 'Mar 5', color: '#6366F1', icon: 'dumbbell' },
    { exercise: 'Incline Dumbbell Press', weight: 80, reps: '8RM', date: 'Mar 3', color: '#818CF8', icon: 'dumbbell' },
    { exercise: 'Squat', weight: 315, reps: '1RM', date: 'Feb 28', color: '#10B981', icon: 'human' },
    { exercise: 'Romanian Deadlift', weight: 225, reps: '8RM', date: 'Feb 26', color: '#34D399', icon: 'weight-lifter' },
    { exercise: 'Deadlift', weight: 405, reps: '1RM', date: 'Mar 1', color: '#F59E0B', icon: 'weight-lifter' },
    { exercise: 'Overhead Press', weight: 135, reps: '1RM', date: 'Feb 20', color: '#EC4899', icon: 'human-handsup' },
    { exercise: 'Barbell Row', weight: 185, reps: '5RM', date: 'Feb 18', color: '#8B5CF6', icon: 'dumbbell' },
    { exercise: 'Pull-ups', weight: 45, reps: '10RM', date: 'Feb 15', color: '#14B8A6', icon: 'human-handsup' },
];

const STATS = {
    totalPRs: 47,
    prsThisMonth: 8,
    prsThisYear: 32,
    longestStreak: 5,
};

export function PersonalRecordsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Records</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Row */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.statIconBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                            <MaterialCommunityIcons name="trophy-award" size={22} color={colors.primary.main} />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{STATS.totalPRs}</Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All-Time Setting</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.statIconBadge, { backgroundColor: `${colors.stats.consistency}15` }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={22} color={colors.stats.consistency} />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{STATS.prsThisMonth}</Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Current Month</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Featured PRs */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🏆 Featured Lifts</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                        {FEATURED_PRS.map((pr, index) => (
                            <Animated.View
                                key={index}
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateX: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30 + index * 10, 0] }) }],
                                    shadowColor: pr.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
                                }}
                            >
                                <View
                                    style={styles.featuredCard}
                                >
                                    <View style={styles.featuredHeader}>
                                        <View style={styles.crownBadge}>
                                            <MaterialCommunityIcons name="crown" size={16} color="#FFF" />
                                        </View>
                                        <View style={styles.improvementBadge}>
                                            <Ionicons name="trending-up" size={12} color="#FFF" style={{ marginRight: 4 }} />
                                            <Text style={styles.featuredImprovement}>{pr.improvement} lbs</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.featuredContent}>
                                        <Text style={styles.featuredExercise}>{pr.exercise}</Text>
                                        <View style={styles.featuredWeightRow}>
                                            <Text style={styles.featuredWeight}>{pr.weight}</Text>
                                            <Text style={styles.featuredUnit}>{pr.unit}</Text>
                                        </View>
                                        <Text style={styles.featuredDate}>{pr.date}</Text>
                                    </View>
                                    
                                    <MaterialCommunityIcons name={pr.icon as any} size={90} color="rgba(255,255,255,0.12)" style={styles.featuredIcon} />
                                </View>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterPill,
                                filter === f
                                    ? { backgroundColor: `${colors.primary.main}20`, borderColor: colors.primary.main, borderWidth: 1 }
                                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                            ]}
                            onPress={() => setFilter(f)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.filterText, { color: filter === f ? colors.primary.main : colors.mutedForeground }]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* All PRs List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 14 }]}>All Records</Text>
                    {ALL_PRS.map((pr, index) => (
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
                            <TouchableOpacity
                                style={[styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.prIcon, { backgroundColor: `${pr.color}15` }]}>
                                    <MaterialCommunityIcons name={(pr as any).icon || 'trophy'} size={24} color={pr.color} />
                                </View>
                                <View style={styles.prInfo}>
                                    <Text style={[styles.prExercise, { color: colors.foreground }]}>{pr.exercise}</Text>
                                    <View style={styles.prMeta}>
                                        <View style={[styles.prRepsBadge, { backgroundColor: `${colors.border}80` }]}>
                                            <Text style={[styles.prReps, { color: colors.foreground }]}>{pr.reps}</Text>
                                        </View>
                                        <Text style={[styles.prDate, { color: colors.mutedForeground }]}>{pr.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.prWeightContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                        <Text style={[styles.prWeight, { color: colors.foreground }]}>{pr.weight}</Text>
                                        <Text style={[styles.prUnit, { color: colors.mutedForeground }]}>lbs</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(150,150,150,0.1)' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 12 },
    statCard: { flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
    statIconBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono, marginBottom: 2 },
    statLabel: { fontSize: 13, fontWeight: '500' },
    section: { marginTop: 30, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    featuredScroll: { paddingRight: 16, gap: 16, paddingBottom: 16 },
    featuredCard: { width: 220, height: 260, padding: 22, borderRadius: 28, position: 'relative', overflow: 'hidden', justifyContent: 'space-between' },
    featuredHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 2 },
    crownBadge: { backgroundColor: 'rgba(255,255,255,0.25)', width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    improvementBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    featuredImprovement: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    featuredContent: { zIndex: 2 },
    featuredExercise: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    featuredWeightRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    featuredWeight: { color: '#FFF', fontSize: 42, fontWeight: '800', fontFamily: fontFamilies.mono, lineHeight: 48 },
    featuredUnit: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '600' },
    featuredDate: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 },
    featuredIcon: { position: 'absolute', right: -15, bottom: -15, transform: [{ rotate: '-15deg' }] },
    filterRow: { paddingHorizontal: 16, marginTop: 10, gap: 10, flexWrap: 'wrap' },
    filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
    filterText: { fontSize: 14, fontWeight: '600' },
    prCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 16 },
    prIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    prInfo: { flex: 1 },
    prExercise: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    prMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    prRepsBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    prReps: { fontSize: 12, fontWeight: '600' },
    prDate: { fontSize: 13, fontWeight: '500' },
    prWeightContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    prWeight: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    prUnit: { fontSize: 13, fontWeight: '600' },
});
