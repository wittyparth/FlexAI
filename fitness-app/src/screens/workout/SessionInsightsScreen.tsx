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
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_INSIGHTS = {
    summary: {
        volumeChange: '+12%',
        intensityTrend: 'Higher',
        consistencyScore: 94,
        rating: 'Excellent',
    },
    volumeByMuscle: [
        { muscle: 'Chest', volume: 4500, percentage: 36, color: '#6366F1' },
        { muscle: 'Shoulders', volume: 3200, percentage: 26, color: '#EC4899' },
        { muscle: 'Triceps', volume: 2800, percentage: 22, color: '#10B981' },
        { muscle: 'Core', volume: 2000, percentage: 16, color: '#F59E0B' },
    ],
    prs: [
        { exercise: 'Bench Press', value: '215 lbs × 6', previous: '205 lbs × 6' },
        { exercise: 'Overhead Press', value: '105 lbs × 6', previous: '105 lbs × 5' },
    ],
    aiRecommendations: [
        { icon: 'trending-up', title: 'Progressive Overload', text: 'Great job increasing bench weight! Try adding 5lbs next week for continued growth.', color: '#10B981' },
        { icon: 'alert-circle', title: 'Rest Optimization', text: 'Your rest periods were slightly shorter. Consider 90-120s for compound lifts.', color: '#F59E0B' },
        { icon: 'refresh', title: 'Recovery Focus', text: 'High RPE session. Ensure adequate protein intake and quality sleep tonight.', color: '#6366F1' },
    ],
    comparison: {
        thisWeek: { workouts: 4, volume: 52000, avgDuration: 62 },
        lastWeek: { workouts: 3, volume: 45000, avgDuration: 58 },
    }
};

export function SessionInsightsScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insights = MOCK_INSIGHTS;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const getProgressColor = (val: string) => {
        if (val.startsWith('+')) return colors.success;
        if (val.startsWith('-')) return colors.error;
        return colors.foreground;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Session Insights</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Performance Summary */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <LinearGradient
                        colors={colors.primary.gradient as [string, string]}
                        style={styles.summaryCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.summaryHeader}>
                            <View style={styles.ratingBadge}>
                                <MaterialCommunityIcons name="star" size={20} color="#FFC107" />
                                <Text style={styles.ratingText}>{insights.summary.rating}</Text>
                            </View>
                            <Text style={styles.consistencyLabel}>Consistency</Text>
                            <Text style={styles.consistencyValue}>{insights.summary.consistencyScore}%</Text>
                        </View>
                        <View style={styles.summaryStats}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Volume</Text>
                                <Text style={[styles.summaryStatValue, { color: '#4ADE80' }]}>{insights.summary.volumeChange}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Intensity</Text>
                                <Text style={styles.summaryStatValue}>{insights.summary.intensityTrend}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* PRs Achieved */}
                {insights.prs.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="trophy" size={22} color={colors.stats.pr} />
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>New Personal Records</Text>
                        </View>
                        <View style={styles.prCards}>
                            {insights.prs.map((pr, i) => (
                                <View key={i} style={[styles.prCard, { backgroundColor: `${colors.stats.pr}10`, borderColor: `${colors.stats.pr}30` }]}>
                                    <View style={[styles.prIcon, { backgroundColor: colors.stats.pr }]}>
                                        <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                                    </View>
                                    <Text style={[styles.prExercise, { color: colors.foreground }]}>{pr.exercise}</Text>
                                    <Text style={[styles.prValue, { color: colors.stats.pr }]}>{pr.value}</Text>
                                    <Text style={[styles.prPrevious, { color: colors.mutedForeground }]}>was {pr.previous}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Volume Distribution */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="chart-pie" size={22} color={colors.primary.main} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Volume by Muscle</Text>
                    </View>
                    <View style={[styles.volumeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {insights.volumeByMuscle.map((item, i) => (
                            <View key={i} style={styles.volumeRow}>
                                <View style={styles.volumeInfo}>
                                    <View style={[styles.volumeDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.volumeMuscle, { color: colors.foreground }]}>{item.muscle}</Text>
                                </View>
                                <View style={styles.volumeBar}>
                                    <Animated.View
                                        style={[
                                            styles.volumeFill,
                                            {
                                                backgroundColor: item.color,
                                                width: fadeAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', `${item.percentage}%`]
                                                })
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.volumeValue, { color: colors.foreground }]}>{(item.volume / 1000).toFixed(1)}k</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* AI Recommendations */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="robot-excited" size={22} color={colors.primary.main} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Recommendations</Text>
                    </View>
                    {insights.aiRecommendations.map((rec, i) => (
                        <View key={i} style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.recIconContainer, { backgroundColor: `${rec.color}15` }]}>
                                <Ionicons name={rec.icon as any} size={22} color={rec.color} />
                            </View>
                            <View style={styles.recContent}>
                                <Text style={[styles.recTitle, { color: colors.foreground }]}>{rec.title}</Text>
                                <Text style={[styles.recText, { color: colors.mutedForeground }]}>{rec.text}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Week Comparison */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="compare" size={22} color={colors.mutedForeground} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Week Comparison</Text>
                    </View>
                    <View style={[styles.compCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.mutedForeground }]}></Text>
                            <Text style={[styles.compHeader, { color: colors.primary.main }]}>This Week</Text>
                            <Text style={[styles.compHeader, { color: colors.mutedForeground }]}>Last Week</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Workouts</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{insights.comparison.thisWeek.workouts}</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{insights.comparison.lastWeek.workouts}</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Volume</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{(insights.comparison.thisWeek.volume / 1000).toFixed(0)}k</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{(insights.comparison.lastWeek.volume / 1000).toFixed(0)}k</Text>
                        </View>
                        <View style={styles.compRow}>
                            <Text style={[styles.compLabel, { color: colors.foreground }]}>Avg Duration</Text>
                            <Text style={[styles.compValue, { color: colors.foreground }]}>{insights.comparison.thisWeek.avgDuration}m</Text>
                            <Text style={[styles.compValue, { color: colors.mutedForeground }]}>{insights.comparison.lastWeek.avgDuration}m</Text>
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
    summaryCard: { margin: 16, borderRadius: 24, padding: 24, elevation: 8, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, gap: 6 },
    ratingText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    consistencyLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 'auto' },
    consistencyValue: { color: '#FFF', fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    summaryStats: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
    summaryStat: { alignItems: 'center' },
    summaryStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 },
    summaryStatValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
    summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    prCards: { flexDirection: 'row', gap: 12 },
    prCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: 'center' },
    prIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    prExercise: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 6 },
    prValue: { fontSize: 16, fontWeight: '800', fontFamily: fontFamilies.mono, marginBottom: 4 },
    prPrevious: { fontSize: 12 },
    volumeCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
    volumeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    volumeInfo: { flexDirection: 'row', alignItems: 'center', width: 100, gap: 10 },
    volumeDot: { width: 12, height: 12, borderRadius: 6 },
    volumeMuscle: { fontSize: 14, fontWeight: '600' },
    volumeBar: { flex: 1, height: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 6, marginHorizontal: 12, overflow: 'hidden' },
    volumeFill: { height: '100%', borderRadius: 6 },
    volumeValue: { width: 50, fontSize: 14, fontWeight: '700', textAlign: 'right', fontFamily: fontFamilies.mono },
    recCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    recIconContainer: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    recContent: { flex: 1 },
    recTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    recText: { fontSize: 14, lineHeight: 20 },
    compCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
    compRow: { flexDirection: 'row', paddingVertical: 8 },
    compLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
    compHeader: { flex: 0.8, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    compValue: { flex: 0.8, fontSize: 16, fontWeight: '700', textAlign: 'center', fontFamily: fontFamilies.mono },
});
