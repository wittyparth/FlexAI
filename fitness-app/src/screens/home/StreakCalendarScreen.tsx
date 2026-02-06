import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { HomeStackScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Ionicons } from '@expo/vector-icons';
import { gamificationApi, StreakData } from '../../api/gamification.api';

// Mock data for development
const MOCK_STREAK_DATA: StreakData = {
    currentStreak: 14,
    longestStreak: 21,
    lastWorkoutDate: new Date().toISOString(),
    weeklyData: [3, 2, 0, 4, 2, 3, 0], // Last 7 days intensity
    monthlyData: generateMockMonthlyData(),
};

function generateMockMonthlyData() {
    const data = [];
    const today = new Date();
    for (let i = 34; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Random intensity with some pattern (weekends less likely)
        const dayOfWeek = date.getDay();
        const intensity = dayOfWeek === 0 || dayOfWeek === 6
            ? Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0
            : Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
        data.push({
            date: date.toISOString().split('T')[0],
            intensity,
        });
    }
    return data;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StreakCalendarScreen({ navigation }: HomeStackScreenProps<'FullStreakCalendar'>) {
    const colors = useColors();
    const { mode } = useTheme();

    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStreakData = useCallback(async () => {
        try {
            setError(null);
            const data = await gamificationApi.getStreakData();
            setStreakData(data);
        } catch (err: any) {
            console.error('Failed to fetch streak data:', err);
            if (__DEV__) {
                console.log('Using mock streak data for development');
                setStreakData(MOCK_STREAK_DATA);
            } else {
                setError(err.message || 'Failed to load streak data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStreakData();
    }, [fetchStreakData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStreakData();
    }, [fetchStreakData]);

    // Get intensity color
    const getIntensityColor = (intensity: number): string => {
        if (intensity === 0) return mode === 'dark' ? '#1f2937' : '#e5e7eb';
        if (intensity === 1) return colors.primary.main + '40';
        if (intensity === 2) return colors.primary.main + '70';
        if (intensity === 3) return colors.primary.main + 'B0';
        return colors.primary.main;
    };

    // Loading state
    if (loading && !refreshing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                    Loading streak data...
                </Text>
            </View>
        );
    }

    // Error state
    if (error || !streakData) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text style={[styles.errorText, { color: '#ef4444' }]}>
                    {error || 'Failed to load data'}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
                    onPress={fetchStreakData}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Organize monthly data into weeks (7 columns)
    const weeks: { date: string; intensity: number }[][] = [];
    let currentWeek: { date: string; intensity: number }[] = [];

    // Pad start to align with day of week
    const firstDate = new Date(streakData.monthlyData[0]?.date || new Date());
    const startDayOfWeek = (firstDate.getDay() + 6) % 7; // Convert to Mon=0 format
    for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push({ date: '', intensity: -1 }); // Placeholder
    }

    streakData.monthlyData.forEach((day, index) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    // Pad end
    while (currentWeek.length > 0 && currentWeek.length < 7) {
        currentWeek.push({ date: '', intensity: -1 });
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Streak Stats */}
                <View style={styles.statsRow}>
                    <StatCard
                        icon="flame"
                        iconColor="#f97316"
                        iconBackground="#f9731620"
                        label="Current"
                        value={streakData.currentStreak}
                        unit="days"
                        style={styles.statCard}
                    />
                    <StatCard
                        icon="trophy"
                        iconColor={colors.primary.main}
                        iconBackground={colors.primary.main + '20'}
                        label="Longest"
                        value={streakData.longestStreak}
                        unit="days"
                        style={styles.statCard}
                    />
                </View>

                {/* Calendar Heatmap */}
                <Card style={styles.calendarCard}>
                    <Text style={[styles.calendarTitle, { color: colors.foreground }]}>
                        Activity
                    </Text>
                    <Text style={[styles.calendarSubtitle, { color: colors.mutedForeground }]}>
                        Last 5 weeks
                    </Text>

                    {/* Day Labels */}
                    <View style={styles.dayLabelsRow}>
                        <View style={styles.dayLabelSpacer} />
                        {DAY_LABELS.map((day) => (
                            <Text key={day} style={[styles.dayLabel, { color: colors.mutedForeground }]}>
                                {day.charAt(0)}
                            </Text>
                        ))}
                    </View>

                    {/* Weeks Grid */}
                    <View style={styles.weeksContainer}>
                        {weeks.map((week, weekIndex) => (
                            <View key={weekIndex} style={styles.weekRow}>
                                {/* Week number/label */}
                                <Text style={[styles.weekLabel, { color: colors.mutedForeground }]}>
                                    {/* W{weekIndex + 1} */}
                                </Text>
                                {week.map((day, dayIndex) => (
                                    <View
                                        key={dayIndex}
                                        style={[
                                            styles.dayCell,
                                            {
                                                backgroundColor:
                                                    day.intensity === -1
                                                        ? 'transparent'
                                                        : getIntensityColor(day.intensity),
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Less</Text>
                        <View style={styles.legendCells}>
                            {[0, 1, 2, 3, 4].map((intensity) => (
                                <View
                                    key={intensity}
                                    style={[
                                        styles.legendCell,
                                        { backgroundColor: getIntensityColor(intensity) },
                                    ]}
                                />
                            ))}
                        </View>
                        <Text style={[styles.legendText, { color: colors.mutedForeground }]}>More</Text>
                    </View>
                </Card>

                {/* This Week Summary */}
                <Card style={styles.weekSummaryCard}>
                    <Text style={[styles.weekSummaryTitle, { color: colors.foreground }]}>
                        This Week
                    </Text>
                    <View style={styles.weekBars}>
                        {DAY_LABELS.map((day, index) => {
                            const intensity = streakData.weeklyData[index] || 0;
                            const maxHeight = 60;
                            const barHeight = intensity > 0 ? Math.max(12, (intensity / 4) * maxHeight) : 4;

                            return (
                                <View key={day} style={styles.weekBarColumn}>
                                    <View
                                        style={[
                                            styles.weekBar,
                                            {
                                                height: barHeight,
                                                backgroundColor:
                                                    intensity > 0 ? colors.primary.main : colors.muted,
                                            },
                                        ]}
                                    />
                                    <Text style={[styles.weekBarLabel, { color: colors.mutedForeground }]}>
                                        {day.charAt(0)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.weekSummaryStats}>
                        <View style={styles.weekSummaryStat}>
                            <Text style={[styles.weekStatValue, { color: colors.foreground }]}>
                                {streakData.weeklyData.filter((d) => d > 0).length}
                            </Text>
                            <Text style={[styles.weekStatLabel, { color: colors.mutedForeground }]}>
                                Workouts
                            </Text>
                        </View>
                        <View style={[styles.weekStatDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.weekSummaryStat}>
                            <Text style={[styles.weekStatValue, { color: colors.foreground }]}>
                                {Math.round((streakData.weeklyData.filter((d) => d > 0).length / 7) * 100)}%
                            </Text>
                            <Text style={[styles.weekStatLabel, { color: colors.mutedForeground }]}>
                                Consistency
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
    },
    calendarCard: {
        padding: 16,
        marginBottom: 16,
    },
    calendarTitle: {
        fontSize: 18,
        fontFamily: fontFamilies.display,
        marginBottom: 4,
    },
    calendarSubtitle: {
        fontSize: 12,
        marginBottom: 16,
    },
    dayLabelsRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayLabelSpacer: {
        width: 20,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '600',
    },
    weeksContainer: {
        gap: 4,
    },
    weekRow: {
        flexDirection: 'row',
        gap: 4,
    },
    weekLabel: {
        width: 20,
        fontSize: 9,
        textAlign: 'right',
        paddingRight: 4,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 4,
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
    },
    legendCells: {
        flexDirection: 'row',
        gap: 4,
    },
    legendCell: {
        width: 14,
        height: 14,
        borderRadius: 3,
    },
    legendText: {
        fontSize: 10,
    },
    weekSummaryCard: {
        padding: 16,
    },
    weekSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    weekBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 80,
        marginBottom: 16,
    },
    weekBarColumn: {
        alignItems: 'center',
        flex: 1,
    },
    weekBar: {
        width: '60%',
        borderRadius: 4,
        marginBottom: 8,
    },
    weekBarLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    weekSummaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    weekSummaryStat: {
        flex: 1,
        alignItems: 'center',
    },
    weekStatDivider: {
        width: 1,
        height: 30,
    },
    weekStatValue: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    weekStatLabel: {
        fontSize: 11,
        marginTop: 2,
    },
});
