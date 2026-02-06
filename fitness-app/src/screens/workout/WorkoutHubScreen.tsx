import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { useWorkoutStore } from '../../store/workoutStore';
import { useShallow } from 'zustand/react/shallow';
// import { useDashboardStats, useRoutines } from '../../hooks';
import { WORKOUT_STATS, ACTIVE_ROUTINES } from '../../data/mockData';
// Native date formatter
const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dateNum = d.getDate();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${day}, ${month} ${dateNum} • ${time}`;
};

const { width } = Dimensions.get('window');

// ============================================================
// PULSING DOT COMPONENT FOR ACTIVE SESSION
// ============================================================
const PulsingDot = () => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.5,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: themeColors.primary.main,
                    opacity: 0.75,
                    transform: [{ scale: pulseAnim }],
                }}
            />
            <View
                style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: themeColors.primary.main,
                }}
            />
        </View>
    );
};

export function WorkoutHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Store Connection
    const {
        activeWorkoutId,
        workoutName,
        elapsedSeconds,
        isLoading: isStoreLoading,
        startWorkout,
        resumeWorkout
    } = useWorkoutStore(useShallow(state => ({
        activeWorkoutId: state.activeWorkoutId,
        workoutName: state.workoutName,
        elapsedSeconds: state.elapsedSeconds,
        isLoading: state.isLoading,
        startWorkout: state.startWorkout,
        resumeWorkout: state.resumeWorkout
    })));

    // Data Fetching
    // const {
    //     data: dashboardStats,
    //     isLoading: isStatsLoading,
    //     refetch: refetchStats,
    //     isRefetching: isStatsRefetching
    // } = useDashboardStats();

    // const {
    //     data: routinesData,
    //     isLoading: isRoutinesLoading,
    //     refetch: refetchRoutines,
    //     isRefetching: isRoutinesRefetching
    // } = useRoutines({ limit: 3, isTemplate: true });

    // Mock Data
    const dashboardStats = WORKOUT_STATS;
    const isStatsLoading = false;
    const refetchStats = () => {};
    const isStatsRefetching = false;

    const routinesData = { data: { routines: ACTIVE_ROUTINES } };
    const isRoutinesLoading = false;
    const refetchRoutines = () => {};
    const isRoutinesRefetching = false;

    // Combined refreshing state
    const isRefreshing = isStatsRefetching || isRoutinesRefetching;

    // Hydrate on mount
    useEffect(() => {
        resumeWorkout();
    }, [resumeWorkout]);

    const onRefresh = () => {
        refetchStats();
        refetchRoutines();
    };

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResumeSession = async () => {
        if (activeWorkoutId) {
            navigation.navigate('ActiveWorkout');
        }
    };

    const handleStartEmpty = async () => {
        await startWorkout({
            name: 'Freestyle Workout',
        });
        navigation.navigate('ActiveWorkout');
    };

    const handleTemplates = () => {
        navigation.navigate('RoutineList');
    };

    const handleCreatePlan = () => {
        // Navigate to routine editor
        navigation.navigate('RoutineEditor', { mode: 'create' });
    };

    const handleLibrary = () => {
        navigation.navigate('RoutineList'); // Or separate library screen if planned
    };

    // Calculate Greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 12,
                        backgroundColor: colors.card,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <View>
                    <Text style={[styles.greetingSub, { color: colors.mutedForeground }]}>
                        {getGreeting()}
                    </Text>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Workout Hub
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: colors.muted }]}
                    onPress={() => navigation.navigate('ProfileStack')}
                >
                    <Ionicons name="person-circle-outline" size={28} color={colors.mutedForeground} />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Stats Overview */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.statIconBadge}>
                            <Ionicons name="flame" size={18} color={themeColors.primary.main} />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {dashboardStats?.streak?.current || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Day Streak</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.statIconBadge, { backgroundColor: themeColors.stats.volume + '20' }]}>
                            <MaterialCommunityIcons name="weight-lifter" size={18} color={themeColors.stats.volume} />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {dashboardStats?.weeklyVolume ? (dashboardStats.weeklyVolume / 1000).toFixed(1) + 'k' : '0'}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Vol (lbs)</Text>
                        </View>
                    </View>
                </View>

                {/* Active Session Banner */}
                {activeWorkoutId ? (
                    <View style={styles.activeSessionContainer}>
                        <TouchableOpacity
                            style={[
                                styles.activeSessionCard,
                                {
                                    backgroundColor: colors.card,
                                    shadowColor: colors.primary.main,
                                },
                            ]}
                            onPress={handleResumeSession}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.accentBar, { backgroundColor: colors.primary.main }]} />
                            <View style={styles.activeSessionContent}>
                                <View style={styles.activeSessionHeader}>
                                    <View>
                                        <View style={styles.activeSessionBadge}>
                                            <PulsingDot />
                                            <Text style={[styles.activeSessionBadgeText, { color: colors.primary.main }]}>
                                                ACTIVE SESSION
                                            </Text>
                                        </View>
                                        <Text style={[styles.activeSessionTitle, { color: colors.foreground }]}>
                                            {workoutName || 'Current Workout'}
                                        </Text>
                                    </View>
                                    <MaterialCommunityIcons
                                        name="dumbbell"
                                        size={32}
                                        color={colors.border}
                                    />
                                </View>

                                <View style={styles.timerRow}>
                                    <Text
                                        style={[
                                            styles.timerText,
                                            { color: colors.foreground, fontFamily: fontFamilies.mono },
                                        ]}
                                    >
                                        {formatTime(elapsedSeconds)}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.resumeButton}
                                    onPress={handleResumeSession}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={colors.primary.gradient as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.resumeGradient}
                                    >
                                        <Ionicons name="play" size={20} color="#FFFFFF" />
                                        <Text style={styles.resumeButtonText}>Resume Session</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Quick Start Call to Action when no active session
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.quickStartBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleStartEmpty}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[colors.primary.main + '20', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.quickStartContent}>
                                <View style={styles.quickStartIcon}>
                                    <Ionicons name="add" size={24} color={colors.primary.main} />
                                </View>
                                <View>
                                    <Text style={[styles.quickStartTitle, { color: colors.foreground }]}>Start Empty Workout</Text>
                                    <Text style={[styles.quickStartSub, { color: colors.mutedForeground }]}>Log as you go</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Actions Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Quick Actions
                    </Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleTemplates}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.muted }]}>
                                <Ionicons name="document-text-outline" size={24} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.foreground }]}>My Plans</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleCreatePlan}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.foreground }]}>Create Plan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('WorkoutHistory')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="history" size={24} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.foreground }]}>History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={handleLibrary}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: colors.muted }]}>
                                <Ionicons name="library-outline" size={24} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.quickActionText, { color: colors.foreground }]}>Discover</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Routines Preview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                            My Active Plans
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('RoutineList')}>
                            <Text style={[styles.viewAllText, { color: colors.primary.main }]}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {isRoutinesLoading ? (
                        <ActivityIndicator />
                    ) : routinesData?.data?.routines?.length ? (
                        <View style={[styles.libraryList, { backgroundColor: colors.card }]}>
                            {routinesData.data.routines.slice(0, 3).map((routine: any, index: number) => (
                                <React.Fragment key={routine.id}>
                                    <TouchableOpacity
                                        style={[
                                            styles.libraryItem,
                                            { borderBottomColor: colors.border },
                                            index === (routinesData.data.routines.length > 3 ? 2 : routinesData.data.routines.length - 1) && { borderBottomWidth: 0 },
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => navigation.navigate('RoutineDetail', { routineId: routine.id })}
                                    >
                                        <View style={[styles.libraryIconBg, { backgroundColor: themeColors.primary.main + '15' }]}>
                                            <MaterialCommunityIcons name="notebook-outline" size={24} color={themeColors.primary.main} />
                                        </View>
                                        <View style={styles.libraryInfo}>
                                            <Text style={[styles.libraryName, { color: colors.foreground }]}>
                                                {routine.name}
                                            </Text>
                                            <Text style={[styles.librarySubtitle, { color: colors.mutedForeground }]}>
                                                {routine.daysPerWeek} Days/Week • {routine.difficulty}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.primary.main} />
                                    </TouchableOpacity>
                                </React.Fragment>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.emptyStateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.emptyStateText, { color: colors.mutedForeground }]}>No plans created yet.</Text>
                            <TouchableOpacity onPress={handleCreatePlan}>
                                <Text style={[styles.emptyStateAction, { color: colors.primary.main }]}>Create your first plan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Recent Activity Feed */}
                <View style={[styles.section, { paddingBottom: 24 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Recent Activity
                    </Text>

                    {isStatsLoading ? (
                        <ActivityIndicator />
                    ) : dashboardStats?.recentWorkouts?.length ? (
                        dashboardStats.recentWorkouts.map((activity) => (
                            <TouchableOpacity
                                key={activity.id}
                                style={[
                                    styles.activityCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                    },
                                ]}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: activity.id })}
                            >
                                <View style={styles.activityHeader}>
                                    <View>
                                        <Text
                                            style={[
                                                styles.activityDate,
                                                { color: colors.mutedForeground, fontFamily: fontFamilies.mono },
                                            ]}
                                        >
                                            {formatDate(activity.date).toUpperCase()}
                                        </Text>
                                        <Text style={[styles.activityName, { color: colors.foreground }]}>
                                            {activity.name}
                                        </Text>
                                    </View>
                                    {activity.prCount > 0 && (
                                        <LinearGradient
                                            colors={['#FCD34D', '#FBBF24']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.prBadge}
                                        >
                                            <Ionicons name="trophy" size={12} color="#78350F" />
                                            <Text style={styles.prBadgeText}>{activity.prCount} PRs</Text>
                                        </LinearGradient>
                                    )}
                                </View>

                                <View style={[styles.activityStats, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                                    <View style={styles.activityStat}>
                                        <Text style={[styles.activityStatLabel, { color: colors.mutedForeground }]}>
                                            VOLUME
                                        </Text>
                                        <Text style={[styles.activityStatValue, { color: colors.foreground, fontFamily: fontFamilies.mono }]}>
                                            {activity.volume.toLocaleString()} <Text style={styles.activityStatUnit}>lbs</Text>
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 10 }}>No recent activity</Text>
                    )}
                </View>

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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    greetingSub: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    profileButton: {
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: themeColors.error,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    scrollContent: {
        paddingTop: 24,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    statIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: themeColors.primary.main + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
    },
    // Active Session Banner Styles
    activeSessionContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    activeSessionCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
    },
    activeSessionContent: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    activeSessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    activeSessionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    activeSessionBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    activeSessionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    timerText: {
        fontSize: 40,
        fontWeight: '600',
        letterSpacing: -1,
    },
    resumeButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    resumeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
    },
    resumeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Quick Start Banner
    quickStartBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        overflow: 'hidden',
    },
    quickStartContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quickStartIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.primary.main + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickStartTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    quickStartSub: {
        fontSize: 13,
    },
    // Section Styles
    section: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Quick Actions Grid
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        minWidth: '47%',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    // Library List Styles
    libraryList: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    libraryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderBottomWidth: 1,
    },
    libraryIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    libraryInfo: {
        flex: 1,
    },
    libraryName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 20,
    },
    librarySubtitle: {
        fontSize: 13,
        lineHeight: 16,
    },
    emptyStateCard: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyStateText: {
        fontSize: 14,
        marginBottom: 8,
    },
    emptyStateAction: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Activity Card Styles
    activityCard: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    activityDate: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    activityName: {
        fontSize: 16,
        fontWeight: '700',
    },
    prBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    prBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#78350F',
        letterSpacing: 0.5,
    },
    activityStats: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    activityStat: {
        flex: 1,
    },
    activityStatLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    activityStatValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    activityStatUnit: {
        fontSize: 12,
        fontWeight: '400',
    },
});

