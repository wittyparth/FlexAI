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
    { exercise: 'Bench Press', weight: 225, reps: '1RM', date: 'Mar 5', color: '#6366F1' },
    { exercise: 'Incline Dumbbell Press', weight: 80, reps: '8RM', date: 'Mar 3', color: '#818CF8' },
    { exercise: 'Squat', weight: 315, reps: '1RM', date: 'Feb 28', color: '#10B981' },
    { exercise: 'Romanian Deadlift', weight: 225, reps: '8RM', date: 'Feb 26', color: '#34D399' },
    { exercise: 'Deadlift', weight: 405, reps: '1RM', date: 'Mar 1', color: '#F59E0B' },
    { exercise: 'Overhead Press', weight: 135, reps: '1RM', date: 'Feb 20', color: '#EC4899' },
    { exercise: 'Barbell Row', weight: 185, reps: '5RM', date: 'Feb 18', color: '#8B5CF6' },
    { exercise: 'Pull-ups', weight: 45, reps: '10RM', date: 'Feb 15', color: '#14B8A6' },
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
            <LinearGradient
                colors={['#F59E0B', '#D97706'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <MaterialCommunityIcons name="trophy" size={28} color="#FFF" />
                    <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Personal Records</Text>
                </View>
                <View style={styles.headerBtn} />
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Row */}
                <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{STATS.totalPRs}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>All-Time</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.success }]}>{STATS.prsThisMonth}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>This Month</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{STATS.longestStreak}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>PR Streak</Text>
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
                                    transform: [{
                                        translateX: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30 + index * 10, 0]
                                        })
                                    }]
                                }}
                            >
                                <LinearGradient
                                    colors={[pr.color, `${pr.color}CC`] as [string, string]}
                                    style={styles.featuredCard}
                                >
                                    <View style={styles.featuredHeader}>
                                        <View style={styles.crownBadge}>
                                            <MaterialCommunityIcons name="crown" size={18} color="#FFF" />
                                        </View>
                                        <Text style={styles.featuredImprovement}>{pr.improvement} lbs</Text>
                                    </View>
                                    <MaterialCommunityIcons name={pr.icon as any} size={40} color="rgba(255,255,255,0.3)" style={styles.featuredIcon} />
                                    <Text style={styles.featuredExercise}>{pr.exercise}</Text>
                                    <Text style={styles.featuredWeight}>{pr.weight} {pr.unit}</Text>
                                    <Text style={styles.featuredDate}>{pr.date}</Text>
                                </LinearGradient>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>

                {/* Filter Pills */}
                <View style={styles.filterRow}>
                    {['all', 'chest', 'back', 'legs', 'shoulders'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterPill,
                                filter === f
                                    ? { backgroundColor: colors.primary.main }
                                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                            ]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, { color: filter === f ? '#FFF' : colors.foreground }]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

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
                                    <MaterialCommunityIcons name="trophy" size={22} color={pr.color} />
                                </View>
                                <View style={styles.prInfo}>
                                    <Text style={[styles.prExercise, { color: colors.foreground }]}>{pr.exercise}</Text>
                                    <View style={styles.prMeta}>
                                        <Text style={[styles.prReps, { color: colors.mutedForeground }]}>{pr.reps}</Text>
                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                        <Text style={[styles.prDate, { color: colors.mutedForeground }]}>{pr.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.prWeightContainer}>
                                    <Text style={[styles.prWeight, { color: colors.foreground }]}>{pr.weight}</Text>
                                    <Text style={[styles.prUnit, { color: colors.mutedForeground }]}>lbs</Text>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 20, gap: 10 },
    statCard: { flex: 1, padding: 18, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800', fontFamily: fontFamilies.mono },
    statLabel: { fontSize: 12, marginTop: 4 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    featuredScroll: { paddingRight: 16, gap: 14 },
    featuredCard: { width: 160, padding: 18, borderRadius: 20, position: 'relative', overflow: 'hidden' },
    featuredHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    crownBadge: { backgroundColor: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    featuredImprovement: { color: '#FFF', fontSize: 13, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    featuredIcon: { position: 'absolute', right: -10, bottom: -10 },
    featuredExercise: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 6 },
    featuredWeight: { color: '#FFF', fontSize: 32, fontWeight: '800', fontFamily: fontFamilies.mono },
    featuredDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, gap: 8, flexWrap: 'wrap' },
    filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    filterText: { fontSize: 14, fontWeight: '600' },
    prCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 14 },
    prIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    prInfo: { flex: 1 },
    prExercise: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    prMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    prReps: { fontSize: 13 },
    prDate: { fontSize: 13 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    prWeightContainer: { alignItems: 'flex-end' },
    prWeight: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    prUnit: { fontSize: 12 },
});
