/**
 * Home Screen - Modern Dashboard
 * Premium fitness dashboard with best-in-class UI/UX
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useDashboardStats } from '../../hooks/queries/useStatsQueries';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing[4] * 3) / 2;

export function HomeScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { data: dashboardData, isLoading, error, refetch, isRefetching } = useDashboardStats();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
        return volume.toString();
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <DashboardSkeleton />
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <View style={[styles.errorCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.errorIconCircle, { backgroundColor: colors.error + '15' }]}>
                        <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
                    </View>
                    <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                        Connection Issue
                    </Text>
                    <Text style={[styles.errorMessage, { color: colors.mutedForeground }]}>
                        {error instanceof Error ? error.message : 'Unable to load dashboard'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
                        onPress={() => refetch()}
                    >
                        <Ionicons name="refresh" size={20} color="#FFF" />
                        <Text style={styles.retryText}>Retry Connection</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Empty state
    if (!dashboardData) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView
                    contentContainerStyle={[styles.emptyContainer, { paddingTop: insets.top }]}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.main} />
                    }
                >
                    <LinearGradient
                        colors={[colors.primary.main + '15', colors.primary.main + '05']}
                        style={styles.emptyGradient}
                    >
                        <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary.main + '20' }]}>
                            <MaterialCommunityIcons name="dumbbell" size={64} color={colors.primary.main} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            Ready to Transform?
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                            Start your fitness journey and track every milestone
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.primary.main }]}
                            onPress={() => navigation.navigate('WorkoutHub')}
                        >
                            <Text style={styles.emptyButtonText}>Begin First Workout</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </LinearGradient>
                </ScrollView>
            </View>
        );
    }

    const { streak, weeklyVolume, recentWorkouts } = dashboardData;
    const isNewStreak = streak.current > 0;
    const isPersonalRecord = streak.current === streak.best && streak.current > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Animated Header with Gradient */}
                <LinearGradient
                    colors={[colors.primary.main + '20', colors.background]}
                    style={[styles.headerGradient, { paddingTop: insets.top + spacing[4] }]}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                                {getGreeting()} 👋
                            </Text>
                            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                                Your Progress
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.profileButton, { backgroundColor: colors.card }]}
                            onPress={() => navigation.navigate('ProfileNavigator')}
                        >
                            <Ionicons name="person-outline" size={24} color={colors.foreground} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Hero Streak Card with Glassmorphism */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={[colors.primary.main, colors.primary.light]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.streakHeroCard}
                        >
                            <View style={styles.streakHeroContent}>
                                <View style={styles.streakHeroLeft}>
                                    <View style={styles.flameContainer}>
                                        <View style={styles.flameGlow} />
                                        <Ionicons name="flame" size={40} color="#FFF" />
                                    </View>
                                    <View style={styles.streakInfo}>
                                        <Text style={styles.streakLabel}>Current Streak</Text>
                                        <View style={styles.streakNumberRow}>
                                            <Text style={styles.streakNumber}>{streak.current}</Text>
                                            <Text style={styles.streakDays}>days</Text>
                                        </View>
                                        {isPersonalRecord && (
                                            <View style={styles.recordBadge}>
                                                <Ionicons name="trophy" size={14} color="#FFD700" />
                                                <Text style={styles.recordText}>Personal Best!</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.streakHeroRight}>
                                    <Text style={styles.bestStreakLabel}>Best</Text>
                                    <Text style={styles.bestStreakNumber}>{streak.best}</Text>
                                </View>
                            </View>

                            {/* Animated Background Pattern */}
                            <View style={styles.patternOverlay}>
                                {[...Array(6)].map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.patternDot,
                                            {
                                                left: `${20 + i * 15}%`,
                                                top: `${30 + (i % 2) * 40}%`,
                                                opacity: 0.1 + (i * 0.03)
                                            }
                                        ]}
                                    />
                                ))}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Start Workout CTA */}
                    <TouchableOpacity
                        style={styles.startWorkoutButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('WorkoutHub')}
                    >
                        <LinearGradient
                            colors={[colors.primary.main, colors.primary.light]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startWorkoutGradient}
                        >
                            <View style={styles.startWorkoutContent}>
                                <View style={styles.startWorkoutLeft}>
                                    <Text style={styles.startWorkoutTitle}>Start New Workout</Text>
                                    <Text style={styles.startWorkoutSubtitle}>Let's crush today's goals 💪</Text>
                                </View>
                                <View style={styles.startWorkoutIconCircle}>
                                    <Ionicons name="add" size={28} color={colors.primary.main} />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Stats Grid - Modern Cards */}
                    <View style={styles.statsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            This Week
                        </Text>
                        <View style={styles.statsGrid}>
                            {/* Weekly Volume Card */}
                            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                                <View style={[styles.statIconBg, { backgroundColor: colors.primary.main + '15' }]}>
                                    <MaterialCommunityIcons name="weight-kilogram" size={24} color={colors.primary.main} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>
                                    {formatVolume(weeklyVolume)}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                                    Volume (kg)
                                </Text>
                            </View>

                            {/* Workouts Count Card */}
                            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                                <View style={[styles.statIconBg, { backgroundColor: colors.success + '15' }]}>
                                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color={colors.success} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>
                                    {recentWorkouts.length}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                                    Workouts
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Recent Workouts Section */}
                    {recentWorkouts.length > 0 && (
                        <View style={styles.recentSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                                    Recent Activity
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')}>
                                    <Text style={[styles.seeAllText, { color: colors.primary.main }]}>
                                        See All
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {recentWorkouts.slice(0, 3).map((workout, index) => (
                                <View
                                    key={workout.id}
                                    style={[
                                        styles.recentWorkoutCard,
                                        { backgroundColor: colors.card },
                                        index < recentWorkouts.length - 1 && { marginBottom: spacing[3] }
                                    ]}
                                >
                                    <View style={styles.recentWorkoutLeft}>
                                        <View style={[styles.workoutIconCircle, { backgroundColor: colors.primary.main + '15' }]}>
                                            <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                                        </View>
                                        <View style={styles.recentWorkoutInfo}>
                                            <Text style={[styles.recentWorkoutName, { color: colors.foreground }]}>
                                                {workout.name}
                                            </Text>
                                            <Text style={[styles.recentWorkoutDate, { color: colors.mutedForeground }]}>
                                                {new Date(workout.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.recentWorkoutRight}>
                                        <Text style={[styles.workoutVolume, { color: colors.foreground }]}>
                                            {formatVolume(workout.volume)} kg
                                        </Text>
                                        {workout.prCount > 0 && (
                                            <View style={[styles.prBadge, { backgroundColor: colors.stats.pr + '15' }]}>
                                                <Ionicons name="trophy" size={12} color={colors.stats.pr} />
                                                <Text style={[styles.prText, { color: colors.stats.pr }]}>
                                                    {workout.prCount} PR
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Quick Actions Grid */}
                    <View style={styles.quickActionsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            Quick Actions
                        </Text>
                        <View style={styles.quickActionsGrid}>
                            <QuickActionCard
                                icon="calendar-outline"
                                title="Templates"
                                gradient={[colors.primary.main + '15', colors.primary.main + '05']}
                                iconColor={colors.primary.main}
                                colors={colors}
                                onPress={() => navigation.navigate('RoutineList')}
                            />
                            <QuickActionCard
                                icon="barbell-outline"
                                title="Exercises"
                                gradient={[colors.success + '15', colors.success + '05']}
                                iconColor={colors.success}
                                colors={colors}
                                onPress={() => navigation.navigate('ExerciseLibrary')}
                            />
                            <QuickActionCard
                                icon="stats-chart-outline"
                                title="Analytics"
                                gradient={[colors.warning + '15', colors.warning + '05']}
                                iconColor={colors.warning}
                                colors={colors}
                                onPress={() => navigation.navigate('StatsScreen')}
                            />
                            <QuickActionCard
                                icon="time-outline"
                                title="History"
                                gradient={['#9333EA15', '#9333EA05']}
                                iconColor="#9333EA"
                                colors={colors}
                                onPress={() => navigation.navigate('WorkoutHistory')}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, gradient, iconColor, colors, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={gradient}
                style={styles.quickActionGradient}
            >
                <View style={styles.quickActionContent}>
                    <Ionicons name={icon} size={28} color={iconColor} />
                    <Text style={[styles.quickActionTitle, { color: colors.foreground }]}>
                        {title}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[6],
    },

    // Error State
    errorCard: {
        borderRadius: 24,
        padding: spacing[8],
        alignItems: 'center',
        maxWidth: 340,
    },
    errorIconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[4],
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
        marginBottom: spacing[2],
    },
    errorMessage: {
        fontSize: 15,
        textAlign: 'center',
        fontFamily: fontFamilies.body,
        lineHeight: 22,
        marginBottom: spacing[6],
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[3],
        borderRadius: 16,
    },
    retryText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        padding: spacing[6],
        justifyContent: 'center',
    },
    emptyGradient: {
        borderRadius: 32,
        padding: spacing[10],
        alignItems: 'center',
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[6],
    },
    emptyTitle: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
        marginBottom: spacing[2],
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: fontFamilies.body,
        marginBottom: spacing[8],
        lineHeight: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingHorizontal: spacing[8],
        paddingVertical: spacing[4],
        borderRadius: 20,
    },
    emptyButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },

    // Header
    headerGradient: {
        paddingBottom: spacing[6],
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[5],
    },
    greeting: {
        fontSize: 15,
        fontFamily: fontFamilies.body,
        marginBottom: spacing[1],
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },

    // Content
    content: {
        paddingHorizontal: spacing[5],
    },

    // Hero Streak Card
    heroSection: {
        marginBottom: spacing[4],
    },
    streakHeroCard: {
        borderRadius: 24,
        padding: spacing[6],
        overflow: 'hidden',
        shadowColor: '#0052FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    streakHeroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    streakHeroLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[4],
    },
    flameContainer: {
        position: 'relative',
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flameGlow: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF',
        opacity: 0.2,
    },
    streakInfo: {
        gap: spacing[1],
    },
    streakLabel: {
        fontSize: 13,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: fontFamilies.body,
        fontWeight: '500',
    },
    streakNumberRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing[2],
    },
    streakNumber: {
        fontSize: 42,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: fontFamilies.display,
        lineHeight: 48,
    },
    streakDays: {
        fontSize: 18,
        color: '#FFF',
        opacity: 0.8,
        fontFamily: fontFamilies.body,
    },
    recordBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    recordText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
    streakHeroRight: {
        alignItems: 'flex-end',
    },
    bestStreakLabel: {
        fontSize: 12,
        color: '#FFF',
        opacity: 0.7,
        fontFamily: fontFamilies.body,
        marginBottom: spacing[1],
    },
    bestStreakNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: fontFamilies.display,
    },
    patternOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    patternDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },

    // Start Workout Button
    startWorkoutButton: {
        marginBottom: spacing[6],
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#0052FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    startWorkoutGradient: {
        padding: spacing[5],
    },
    startWorkoutContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    startWorkoutLeft: {
        flex: 1,
    },
    startWorkoutTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: fontFamilies.display,
        marginBottom: spacing[1],
    },
    startWorkoutSubtitle: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.9,
        fontFamily: fontFamilies.body,
    },
    startWorkoutIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Stats Section
    statsSection: {
        marginBottom: spacing[6],
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
        marginBottom: spacing[4],
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: spacing[5],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    statIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[3],
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
        marginBottom: spacing[1],
    },
    statLabel: {
        fontSize: 13,
        fontFamily: fontFamilies.body,
    },

    // Recent Section
    recentSection: {
        marginBottom: spacing[6],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
    recentWorkoutCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[4],
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recentWorkoutLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        flex: 1,
    },
    workoutIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentWorkoutInfo: {
        flex: 1,
    },
    recentWorkoutName: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
        marginBottom: 2,
    },
    recentWorkoutDate: {
        fontSize: 13,
        fontFamily: fontFamilies.body,
    },
    recentWorkoutRight: {
        alignItems: 'flex-end',
        gap: spacing[1],
    },
    workoutVolume: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
    prBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: 8,
    },
    prText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },

    // Quick Actions
    quickActionsSection: {
        marginBottom: spacing[8],
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[3],
    },
    quickActionCard: {
        width: CARD_WIDTH,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionGradient: {
        padding: spacing[5],
    },
    quickActionContent: {
        alignItems: 'center',
        gap: spacing[2],
    },
    quickActionTitle: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: fontFamilies.body,
    },
});
