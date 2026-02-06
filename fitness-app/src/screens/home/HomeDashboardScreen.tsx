import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useColors } from '../../hooks';
import { typography, fontFamilies } from '../../theme/typography';
import { Card } from '../../components/ui/Card';

import { statsApi, DashboardStatsResponse } from '../../api/stats.api';

// Interfaces ensuring backend data matching
// (Removed local DashboardData interface as we import it now)

export function HomeDashboardScreen({ navigation }: HomeStackScreenProps<'HomeDashboard'>) {
    const { user } = useAuthStore();
    const colors = useColors();
    const { mode, toggleTheme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DashboardStatsResponse | null>(null);

    // Mock data for development when API is unavailable
    const getMockData = (): DashboardStatsResponse => ({
        userLevel: {
            currentLevel: 12,
            title: 'Elite',
            currentXp: 2450,
            nextLevelXp: 3000,
            nextTitle: 'Champion',
            progress: 0.82,
        },
        heatmap: {
            data: [
                [0, 1, 2, 3, 2, 1, 0],
                [1, 2, 3, 2, 1, 2, 1],
                [2, 3, 2, 1, 2, 3, 2],
                [3, 2, 1, 0, 1, 2, 3],
            ],
        },
        todaysWorkout: {
            day: 3,
            focus: 'Push',
            title: 'Upper Body Power',
            durationMin: 55,
            exerciseCount: 6,
            calories: 420,
            muscleStatus: [
                { part: 'Chest', status: 'fresh', icon: 'flash' },
                { part: 'Shoulders', status: 'fresh', icon: 'flash' },
                { part: 'Triceps', status: 'recovering', icon: 'time' },
            ],
        },
        quickStats: {
            totalVolume: 48500,
            volumeUnit: 'kg',
            volumeTrend: 12,
            activeMinutesAvg: 47,
            streakDays: 14,
            isStreakRecord: true,
        },
    });

    // DEV MODE: Always use mock data immediately
    useEffect(() => {
        // Skip API calls, use mock data directly for UI development
        setData(getMockData());
        setLoading(false);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh with mock data
        setTimeout(() => {
            setData(getMockData());
            setRefreshing(false);
        }, 500);
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={{ color: colors.foreground, marginTop: 12 }}>Loading stats...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <Text style={{ color: '#ef4444', marginBottom: 16 }}>{error}</Text>
                <Text onPress={() => { setData(getMockData()); setError(null); }} style={{ color: colors.primary.main }}>Tap to retry</Text>
            </View>
        );
    }

    const getIntensityColor = (intensity: number) => {
        if (intensity === 0) return mode === 'dark' ? '#1f2937' : '#e5e7eb';
        if (intensity === 1) return colors.primary.main + '40'; // 25% opacity
        if (intensity === 2) return colors.primary.main + '80'; // 50% opacity
        if (intensity === 3) return colors.primary.main;        // 100% opacity
        return colors.primary.main;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 24, backgroundColor: colors.background }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.greeting, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Good morning, {user?.firstName || 'User'}!
                    </Text>
                </View>
                {/* Theme Toggle */}
                <TouchableOpacity
                    style={[styles.notificationBtn, { backgroundColor: colors.card, borderColor: colors.border, marginRight: 8 }]}
                    onPress={toggleTheme}
                >
                    <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.foreground} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.notificationBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('HomeNotifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
                    <View style={styles.notificationDot}>
                        <View style={[styles.dotPing, { backgroundColor: colors.primary.main }]} />
                        <View style={[styles.dotCore, { backgroundColor: colors.primary.main }]} />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Elite Level Card */}
                {data?.userLevel && (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('XPLevelDetail')}>
                        <Card variant="featured" style={styles.section} padding="none">
                            <View style={[styles.levelCardInner, { backgroundColor: colors.card }]}>
                                <View style={styles.levelHeader}>
                                    <View>
                                        <View style={[styles.badge, { backgroundColor: colors.primary.main + '10' }]}>
                                            <Text style={[styles.badgeText, { color: colors.primary.main }]}>WEEKLY GOAL</Text>
                                        </View>
                                        <Text style={[styles.levelTitle, { color: colors.foreground }]}>
                                            {data.userLevel.title} {data.userLevel.currentLevel}
                                        </Text>
                                    </View>
                                    <View style={[styles.iconCircle, { backgroundColor: colors.primary.main + '10' }]}>
                                        <MaterialCommunityIcons name="medal" size={24} color={colors.primary.main} />
                                    </View>
                                </View>

                                <View style={styles.levelProgressContainer}>
                                    <View style={styles.levelMeta}>
                                        <Text style={[styles.nextLevel, { color: colors.mutedForeground }]}>
                                            Next: {data.userLevel.nextTitle}
                                        </Text>
                                        <Text style={[styles.xpText, { color: colors.foreground }]}>
                                            <Text style={{ color: colors.primary.main, fontWeight: '700' }}>
                                                {data.userLevel.currentXp}
                                            </Text>
                                            /{data.userLevel.nextLevelXp} XP
                                        </Text>
                                    </View>
                                    <View style={[styles.progressBarBg, { backgroundColor: colors.slate[200] }]}>
                                        <LinearGradient
                                            colors={(colors.primary.gradient || [colors.primary.main || '#0052FF', colors.primary.light || '#4D7CFF']) as any}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[styles.progressBarFill, { width: `${data.userLevel.progress * 100}%` }]}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                )}

                {/* Consistency Heatmap */}
                {data?.heatmap && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Consistency</Text>
                            <View style={styles.legend}>
                                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Less</Text>
                                <View style={[styles.legendDot, { backgroundColor: mode === 'dark' ? '#1f2937' : '#e5e7eb' }]} />
                                <View style={[styles.legendDot, { backgroundColor: colors.primary.main + '60' }]} />
                                <View style={[styles.legendDot, { backgroundColor: colors.primary.main }]} />
                                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>More</Text>
                            </View>
                        </View>

                        <Card style={styles.heatmapCard}>
                            <View style={styles.heatmapGrid}>
                                {/* Day Labels */}
                                <View style={styles.dayLabels}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <Text key={i} style={[styles.dayLabelText, { color: colors.mutedForeground }]}>{d}</Text>
                                    ))}
                                </View>
                                {/* Weeks */}
                                {data.heatmap.data.map((week: number[], wIndex: number) => (
                                    <View key={wIndex} style={styles.weekColumn}>
                                        {week.map((intensity: number, dIndex: number) => (
                                            <View
                                                key={dIndex}
                                                style={[
                                                    styles.heatmapCell,
                                                    { backgroundColor: getIntensityColor(intensity) }
                                                ]}
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </Card>
                    </View>
                )}

                {/* Today's Workout */}
                {data?.todaysWorkout && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display, paddingHorizontal: 4 }]}>
                            Today's Workout
                        </Text>
                        <Card variant="elevated" style={styles.workoutCard}>
                            <View style={styles.workoutHeader}>
                                <View>
                                    <Text style={[styles.workoutSub, { color: colors.mutedForeground }]}>
                                        DAY {data.todaysWorkout.day} • {data.todaysWorkout.focus.toUpperCase()}
                                    </Text>
                                    <Text style={[styles.workoutTitle, { color: colors.foreground }]}>
                                        {data.todaysWorkout.title}
                                    </Text>
                                </View>
                                <View style={[styles.dumbbellIcon, { backgroundColor: colors.slate[100] }]}>
                                    <MaterialCommunityIcons name="dumbbell" size={28} color={colors.slate[600]} />
                                </View>
                            </View>

                            <View style={styles.badgesRow}>
                                {data.todaysWorkout.muscleStatus.map((status: { part: string; status: 'fresh' | 'recovering' | 'fatigued'; icon: string }, i: number) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor: status.status === 'fresh'
                                                    ? (mode === 'dark' ? '#064e3b' : '#ecfdf5')
                                                    : (mode === 'dark' ? '#78350f' : '#fffbeb'),
                                                borderColor: status.status === 'fresh'
                                                    ? (mode === 'dark' ? '#065f46' : '#d1fae5')
                                                    : (mode === 'dark' ? '#92400e' : '#fef3c7')
                                            }
                                        ]}
                                    >
                                        <Ionicons
                                            name={status.icon === 'flash' ? 'flash' : 'time'}
                                            size={14}
                                            color={status.status === 'fresh' ? '#059669' : '#d97706'}
                                        />
                                        <Text style={[
                                            styles.statusText,
                                            { color: status.status === 'fresh' ? '#047857' : '#b45309' }
                                        ]}>
                                            {status.part}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.workoutStatsRow}>
                                <View style={styles.workoutStat}>
                                    <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
                                    <Text style={[styles.statValue, { color: colors.mutedForeground }]}>{data.todaysWorkout.durationMin} min</Text>
                                </View>
                                <View style={styles.workoutStat}>
                                    <MaterialCommunityIcons name="weight" size={18} color={colors.mutedForeground} />
                                    <Text style={[styles.statValue, { color: colors.mutedForeground }]}>{data.todaysWorkout.exerciseCount} Exercises</Text>
                                </View>
                                <View style={styles.workoutStat}>
                                    <Ionicons name="flame-outline" size={18} color={colors.mutedForeground} />
                                    <Text style={[styles.statValue, { color: colors.mutedForeground }]}>~{data.todaysWorkout.calories} kcal</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.startBtnContainer} activeOpacity={0.9}>
                                <LinearGradient
                                    colors={[colors.primary.main || '#0052FF', colors.primary.dark || '#0039B3'] as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.startBtn}
                                >
                                    <Text style={styles.startBtnText}>START WORKOUT</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Card>
                    </View>
                )}

                {/* Quick Stats Scroll */}
                {data?.quickStats && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display, paddingHorizontal: 4 }]}>
                            Quick Stats
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                            {/* Volume Card */}
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.statHeader}>
                                    <MaterialCommunityIcons name="scale-bathroom" size={20} color={colors.primary.main} />
                                    <Text style={styles.statLabel}>TOTAL VOL</Text>
                                </View>
                                <Text style={[styles.statMainValue, { color: colors.foreground }]}>
                                    {data.quickStats.totalVolume.toLocaleString()}
                                    <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>{data.quickStats.volumeUnit}</Text>
                                </Text>
                                <View style={styles.trendRow}>
                                    <Ionicons name="trending-up" size={14} color={colors.success} />
                                    <Text style={[styles.trendText, { color: colors.success }]}>+{data.quickStats.volumeTrend}%</Text>
                                </View>
                            </View>

                            {/* Active Time Card */}
                            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.statHeader}>
                                    <MaterialCommunityIcons name="timer-outline" size={20} color={colors.primary.main} />
                                    <Text style={styles.statLabel}>ACTIVE</Text>
                                </View>
                                <Text style={[styles.statMainValue, { color: colors.foreground }]}>
                                    {data.quickStats.activeMinutesAvg}
                                    <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>min</Text>
                                </Text>
                                <Text style={[styles.trendText, { color: colors.mutedForeground }]}>Avg per session</Text>
                            </View>

                            {/* Streak Card */}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('FullStreakCalendar')}
                                style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                <View style={styles.statHeader}>
                                    <Ionicons name="flame" size={20} color={colors.primary.main} />
                                    <Text style={styles.statLabel}>STREAK</Text>
                                </View>
                                <Text style={[styles.statMainValue, { color: colors.foreground }]}>
                                    {data.quickStats.streakDays}
                                    <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>days</Text>
                                </Text>
                                {data.quickStats.isStreakRecord && (
                                    <Text style={[styles.trendText, { color: colors.success }]}>Personal Best!</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        zIndex: 10,
    },
    greeting: {
        fontSize: 24,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotPing: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 5,
        opacity: 0.75,
        transform: [{ scale: 1.5 }],
    },
    dotCore: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 24,
    },
    section: {
        marginBottom: 8,
    },
    // Elite Level Card
    levelCardInner: {
        padding: 20,
        borderRadius: 14,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    levelTitle: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelProgressContainer: {
        gap: 8,
    },
    levelMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    nextLevel: {
        fontSize: 14,
        fontWeight: '500',
    },
    xpText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: fontFamilies.mono,
    },
    progressBarBg: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    // Heatmap
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendText: {
        fontSize: 10,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    heatmapCard: {
        padding: 16,
    },
    heatmapGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayLabels: {
        justifyContent: 'space-between',
        paddingVertical: 2,
        marginRight: 8,
        height: 116,
    },
    dayLabelText: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    weekColumn: {
        justifyContent: 'space-between',
        height: 116,
    },
    heatmapCell: {
        width: 14, // Roughly matches w-4 in tailwind
        height: 14,
        borderRadius: 3,
    },
    // Today's Workout
    workoutCard: {
        padding: 20,
        borderRadius: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    workoutSub: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    workoutTitle: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 28,
    },
    dumbbellIcon: {
        padding: 8,
        borderRadius: 8,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    workoutStatsRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 24,
    },
    workoutStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    startBtnContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#0052FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    startBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Quick Stats
    statsScroll: {
        paddingHorizontal: 4,
        gap: 16,
        paddingBottom: 16,
    },
    statBox: {
        minWidth: 140,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    statMainValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '400',
        marginLeft: 4,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

