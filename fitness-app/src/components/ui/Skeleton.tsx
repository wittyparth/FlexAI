/**
 * Skeleton Loading System
 *
 * Animated shimmer skeletons for every major screen layout.
 *
 * Usage:
 *   import { Skeleton, SkeletonCard, WorkoutHistorySkeleton, ... } from '../components/ui';
 *
 * Primitives:
 *   <Skeleton width={200} height={16} radius={8} />
 *   <SkeletonLine />            — full-width text line
 *   <SkeletonLine width="60%" />
 *   <SkeletonCircle size={48} />
 *   <SkeletonCard height={120} />
 *
 * Screen-level:
 *   <HomeDashboardSkeleton />
 *   <WorkoutHubSkeleton />
 *   <WorkoutHistorySkeleton />
 *   <WorkoutDetailSkeleton />
 *   <AnalyticsHubSkeleton />
 *   <ProfileHubSkeleton />
 *   <ExerciseLibrarySkeleton />
 *   <SessionInsightsSkeleton />
 *   <CoachHubSkeleton />
 *   <RoutineDetailSkeleton />
 *   <PersonalRecordsSkeleton />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useColors } from '../../hooks';

// ─────────────────────────────────────────────
// Primitive: Skeleton
// ─────────────────────────────────────────────

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    radius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
    const colors = useColors();
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) }),
                withTiming(1.0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    const base = colors.muted;
    const shimmer = colors.border;

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: shimmer,
                    overflow: 'hidden',
                },
                animStyle,
                style,
            ]}
        />
    );
}

// ─────────────────────────────────────────────
// Helpers built on top of Skeleton
// ─────────────────────────────────────────────

export function SkeletonLine({ width = '100%', height = 14, radius = 6, style }: { width?: DimensionValue; height?: number; radius?: number; style?: ViewStyle }) {
    return <Skeleton width={width} height={height} radius={radius} style={style} />;
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: ViewStyle }) {
    return <Skeleton width={size} height={size} radius={size / 2} style={style} />;
}

export function SkeletonCard({ height = 120, radius = 16, style }: { height?: number; radius?: number; style?: ViewStyle }) {
    return <Skeleton width="100%" height={height} radius={radius} style={style} />;
}

// ─────────────────────────────────────────────
// Composite: SkeletonListItem
// ─────────────────────────────────────────────
export function SkeletonListItem({ showIcon = true }: { showIcon?: boolean }) {
    return (
        <View style={listItemStyles.row}>
            {showIcon && <SkeletonCircle size={40} style={{ marginRight: 12 }} />}
            <View style={{ flex: 1, gap: 8 }}>
                <SkeletonLine width="60%" height={14} />
                <SkeletonLine width="40%" height={11} />
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// Composite: SkeletonStatRow (3 stat tiles)
// ─────────────────────────────────────────────
export function SkeletonStatRow() {
    return (
        <View style={statRowStyles.row}>
            {[0, 1, 2].map((i) => (
                <View key={i} style={statRowStyles.tile}>
                    <SkeletonCircle size={32} style={{ marginBottom: 8 }} />
                    <SkeletonLine width="70%" height={20} style={{ marginBottom: 6 }} />
                    <SkeletonLine width="50%" height={11} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// Screen Skeletons
// ─────────────────────────────────────────────

/** Home Dashboard */
export function HomeDashboardSkeleton() {
    return (
        <View style={screen.container}>
            {/* Header greeting */}
            <View style={screen.section}>
                <SkeletonLine width="45%" height={13} style={{ marginBottom: 8 }} />
                <SkeletonLine width="65%" height={26} />
            </View>

            {/* Stat row */}
            <View style={screen.px}>
                <SkeletonStatRow />
            </View>

            {/* Heatmap card */}
            <View style={screen.px}>
                <SkeletonCard height={110} style={{ marginTop: 16 }} />
            </View>

            {/* XP card */}
            <View style={screen.px}>
                <SkeletonCard height={88} style={{ marginTop: 16 }} />
            </View>

            {/* Today's workout card */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 12 }} />
                <SkeletonCard height={160} />
            </View>

            {/* Quick stats */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="35%" height={13} style={{ marginBottom: 12 }} />
                <View style={{ gap: 10 }}>
                    {[0, 1, 2].map(i => (
                        <View key={i} style={listItemStyles.row}>
                            <SkeletonCircle size={36} style={{ marginRight: 12 }} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <SkeletonLine width="55%" height={14} />
                                <SkeletonLine width="35%" height={11} />
                            </View>
                            <SkeletonLine width={48} height={20} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

/** Workout Hub */
export function WorkoutHubSkeleton() {
    return (
        <View style={screen.container}>
            {/* Header */}
            <View style={screen.section}>
                <SkeletonLine width="30%" height={12} style={{ marginBottom: 8 }} />
                <SkeletonLine width="50%" height={28} />
            </View>

            {/* Stats row */}
            <View style={screen.px}>
                <SkeletonStatRow />
            </View>

            {/* Heatmap */}
            <View style={screen.px}>
                <SkeletonCard height={100} style={{ marginTop: 16 }} />
            </View>

            {/* Start workout card */}
            <View style={screen.px}>
                <SkeletonCard height={80} radius={20} style={{ marginTop: 16 }} />
            </View>

            {/* Routines section */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="35%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2].map(i => (
                    <View key={i} style={[listItemStyles.row, { marginBottom: 10 }]}>
                        <Skeleton width={4} height={48} radius={2} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="60%" height={14} />
                            <SkeletonLine width="40%" height={11} />
                        </View>
                        <SkeletonLine width={64} height={22} radius={10} />
                    </View>
                ))}
            </View>

            {/* Recent activity */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2].map(i => (
                    <View key={i} style={[listItemStyles.row, { marginBottom: 10 }]}>
                        <SkeletonCircle size={36} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="55%" height={14} />
                            <SkeletonLine width="38%" height={11} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

/** Workout History list */
export function WorkoutHistorySkeleton() {
    return (
        <View style={[screen.container, { padding: 16, gap: 12 }]}>
            {[0, 1, 2, 3, 4].map(i => (
                <View key={i} style={workoutCardStyles.card}>
                    {/* title + badge row */}
                    <View style={workoutCardStyles.headerRow}>
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="65%" height={15} />
                            <SkeletonLine width="45%" height={11} />
                        </View>
                        <SkeletonLine width={48} height={20} radius={10} />
                    </View>
                    {/* divider + stats */}
                    <Skeleton width="100%" height={1} radius={0} style={{ marginVertical: 12 }} />
                    <View style={workoutCardStyles.statsRow}>
                        {[0, 1, 2].map(j => (
                            <View key={j} style={workoutCardStyles.stat}>
                                <SkeletonCircle size={16} />
                                <SkeletonLine width={48} height={12} style={{ marginLeft: 6 }} />
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

/** Workout Detail */
export function WorkoutDetailSkeleton() {
    return (
        <View style={screen.container}>
            {/* Hero header */}
            <SkeletonCard height={180} radius={0} />

            {/* Stats strip */}
            <View style={[screen.px, { paddingVertical: 16 }]}>
                <View style={statRowStyles.row}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                            <SkeletonLine width={44} height={18} />
                            <SkeletonLine width={36} height={10} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Exercise cards */}
            {[0, 1, 2].map(i => (
                <View key={i} style={[screen.px, { marginBottom: 16 }]}>
                    <View style={listItemStyles.row}>
                        <SkeletonCircle size={40} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="55%" height={14} />
                            <SkeletonLine width="35%" height={11} />
                        </View>
                    </View>
                    {/* Set rows */}
                    <View style={{ marginTop: 10, gap: 8 }}>
                        {[0, 1, 2].map(j => (
                            <View key={j} style={{ flexDirection: 'row', gap: 12 }}>
                                <SkeletonLine width={30} height={12} />
                                <SkeletonLine width={60} height={12} />
                                <SkeletonLine width={60} height={12} />
                                <SkeletonLine width={48} height={12} />
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

/** Analytics Hub */
export function AnalyticsHubSkeleton() {
    return (
        <View style={screen.container}>
            {/* Quick stats */}
            <View style={screen.px}>
                <SkeletonStatRow />
            </View>

            {/* Chart card */}
            <View style={[screen.px, { marginTop: 20 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 12 }} />
                <SkeletonCard height={200} />
            </View>

            {/* Secondary chart */}
            <View style={[screen.px, { marginTop: 20 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 12 }} />
                <SkeletonCard height={160} />
            </View>

            {/* Activity list */}
            <View style={[screen.px, { marginTop: 20 }]}>
                <SkeletonLine width="45%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2, 3].map(i => (
                    <View key={i} style={[listItemStyles.row, { marginBottom: 12 }]}>
                        <SkeletonCircle size={36} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="60%" height={14} />
                            <SkeletonLine width="38%" height={11} />
                        </View>
                        <SkeletonLine width={40} height={18} />
                    </View>
                ))}
            </View>
        </View>
    );
}

/** Profile Hub */
export function ProfileHubSkeleton() {
    return (
        <View style={screen.container}>
            {/* Cover + avatar */}
            <SkeletonCard height={140} radius={0} />
            <View style={[screen.px, { marginTop: -32, flexDirection: 'row', alignItems: 'flex-end', gap: 14 }]}>
                <SkeletonCircle size={88} />
                <View style={{ flex: 1, gap: 8, paddingBottom: 8 }}>
                    <SkeletonLine width="55%" height={18} />
                    <SkeletonLine width="40%" height={12} />
                </View>
            </View>

            {/* Stats row */}
            <View style={[screen.px, { marginTop: 20 }]}>
                <SkeletonStatRow />
            </View>

            {/* Achievements */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                            <SkeletonCircle size={52} />
                            <SkeletonLine width={52} height={10} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent workouts */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="45%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2].map(i => <SkeletonListItem key={i} />)}
            </View>
        </View>
    );
}

/** Exercise Library */
export function ExerciseLibrarySkeleton() {
    return (
        <View style={[screen.container, { padding: 16 }]}>
            {/* Search bar */}
            <SkeletonCard height={46} radius={14} style={{ marginBottom: 16 }} />

            {/* Filter chips */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {[80, 100, 72, 90].map((w, i) => (
                    <Skeleton key={i} width={w} height={32} radius={16} />
                ))}
            </View>

            {/* Exercise list */}
            <View style={{ gap: 12 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <View key={i} style={listItemStyles.row}>
                        <SkeletonCircle size={44} style={{ marginRight: 14 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="60%" height={14} />
                            <SkeletonLine width="40%" height={11} />
                        </View>
                        <SkeletonCircle size={20} />
                    </View>
                ))}
            </View>
        </View>
    );
}

/** Session Insights */
export function SessionInsightsSkeleton() {
    return (
        <View style={screen.container}>
            {/* Score card */}
            <View style={screen.px}>
                <SkeletonCard height={160} style={{ marginTop: 16 }} />
            </View>

            {/* Stat strip */}
            <View style={[screen.px, { marginTop: 20 }]}>
                <SkeletonStatRow />
            </View>

            {/* PRs list */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="30%" height={13} style={{ marginBottom: 12 }} />
                {[0, 1].map(i => <SkeletonListItem key={i} showIcon={false} />)}
            </View>

            {/* Radar chart */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 12 }} />
                <SkeletonCard height={200} />
            </View>
        </View>
    );
}

/** Coach Hub */
export function CoachHubSkeleton() {
    return (
        <View style={screen.container}>
            {/* Hero card */}
            <View style={screen.px}>
                <SkeletonCard height={130} style={{ marginTop: 16 }} />
            </View>

            {/* Quick prompts */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="35%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2, 3].map(i => (
                    <View key={i} style={[listItemStyles.row, { marginBottom: 10 }]}>
                        <SkeletonCircle size={36} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <SkeletonLine width="65%" height={14} />
                            <SkeletonLine width="45%" height={11} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Chat history */}
            <View style={[screen.px, { marginTop: 24 }]}>
                <SkeletonLine width="40%" height={13} style={{ marginBottom: 14 }} />
                {[0, 1, 2].map(i => <SkeletonListItem key={i} />)}
            </View>
        </View>
    );
}

/** Routine Detail */
export function RoutineDetailSkeleton() {
    return (
        <View style={screen.container}>
            {/* Hero */}
            <SkeletonCard height={200} radius={0} />

            {/* Meta */}
            <View style={[screen.px, { marginTop: 20, gap: 12 }]}>
                <SkeletonLine width="50%" height={20} />
                <SkeletonLine width="35%" height={13} />
            </View>

            {/* Day tabs */}
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 20 }}>
                {[60, 60, 60, 60, 60].map((w, i) => (
                    <Skeleton key={i} width={w} height={32} radius={16} />
                ))}
            </View>

            {/* Exercises */}
            <View style={[screen.px, { marginTop: 20, gap: 14 }]}>
                {[0, 1, 2, 3, 4].map(i => <SkeletonListItem key={i} />)}
            </View>
        </View>
    );
}

/** Personal Records */
export function PersonalRecordsSkeleton() {
    return (
        <View style={[screen.container, { padding: 16, gap: 12 }]}>
            {/* Search */}
            <SkeletonCard height={46} radius={14} style={{ marginBottom: 4 }} />

            {/* PR cards */}
            {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={workoutCardStyles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ gap: 8 }}>
                            <SkeletonLine width={120} height={14} />
                            <SkeletonLine width={80} height={11} />
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 8 }}>
                            <SkeletonLine width={60} height={20} />
                            <SkeletonLine width={44} height={11} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

/** Generic full-page skeleton (fallback) */
export function GenericScreenSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <View style={[screen.container, { padding: 16, gap: 14 }]}>
            <SkeletonLine width="50%" height={22} style={{ marginBottom: 4 }} />
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonListItem key={i} showIcon={i % 3 !== 0} />
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// Internal styles
// ─────────────────────────────────────────────

const screen = StyleSheet.create({
    container: { flex: 1 },
    section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    px: { paddingHorizontal: 16 },
});

const listItemStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
});

const statRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 8,
    },
    tile: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        gap: 4,
    },
});

const workoutCardStyles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

// ─────────────────────────────────────────────
// Social list skeleton (leaderboard, follow lists, challenges)
// ─────────────────────────────────────────────
export function SocialListSkeleton() {
    return (
        <View style={[screen.container, { paddingHorizontal: 16, paddingTop: 16, gap: 12 }]}>
            {[0, 1, 2, 3, 4, 5].map(i => (
                <View key={i} style={[listItemStyles.row, { marginBottom: 4 }]}>
                    <SkeletonCircle size={44} style={{ marginRight: 12 }} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <SkeletonLine width="55%" height={14} />
                        <SkeletonLine width="35%" height={11} />
                    </View>
                    <SkeletonCard height={30} style={{ width: 70, borderRadius: 8 }} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// Explore Hub section skeleton (inline section loading)
// ─────────────────────────────────────────────
export function ExploreHubSectionSkeleton() {
    return (
        <View style={{ gap: 10, paddingVertical: 8 }}>
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
        </View>
    );
}

// ─────────────────────────────────────────────
// Analytics Detail skeleton (content-only, NavigationBar pre-rendered)
// ─────────────────────────────────────────────
export function AnalyticsDetailSkeleton() {
    return (
        <View style={{ padding: 16, gap: 14 }}>
            {/* Summary row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={{ flex: 1, gap: 8 }}>
                        <SkeletonLine height={11} />
                        <SkeletonLine height={22} width="70%" />
                        <SkeletonLine height={11} width="50%" />
                    </View>
                ))}
            </View>
            {/* Chart placeholder */}
            <SkeletonCard height={200} style={{ marginTop: 8 }} />
            {/* List rows */}
            {[0, 1, 2, 3].map(i => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <SkeletonCircle size={36} />
                    <View style={{ flex: 1, gap: 7 }}>
                        <SkeletonLine width="60%" height={13} />
                        <SkeletonLine width="40%" height={11} />
                    </View>
                    <SkeletonLine width={52} height={20} radius={6} />
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// Body tracking content skeleton (content-only)
// ─────────────────────────────────────────────
export function BodyTrackingSkeleton() {
    return (
        <View style={{ padding: 16, gap: 14 }}>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={{ flex: 1, gap: 8 }}>
                        <SkeletonCircle size={28} style={{ alignSelf: 'center' }} />
                        <SkeletonLine height={22} width="60%" style={{ alignSelf: 'center' } as any} />
                        <SkeletonLine height={11} />
                    </View>
                ))}
            </View>
            {/* Chart */}
            <SkeletonCard height={180} style={{ marginTop: 8 }} />
            {/* Log entries */}
            {[0, 1, 2, 3].map(i => (
                <SkeletonListItem key={i} />
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────
// User profile skeleton (for viewing other users)
// ─────────────────────────────────────────────
export function UserProfileSkeleton() {
    return (
        <View style={screen.container}>
            {/* Hero header */}
            <View style={{ padding: 20, alignItems: 'center', gap: 12 }}>
                <SkeletonCircle size={80} />
                <SkeletonLine width="50%" height={18} />
                <SkeletonLine width="35%" height={13} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <SkeletonCard height={34} style={{ width: 100, borderRadius: 20 }} />
                    <SkeletonCard height={34} style={{ width: 80, borderRadius: 20 }} />
                </View>
            </View>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginHorizontal: 16 }}>
                {[0, 1, 2].map(i => (
                    <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                        <SkeletonLine width={40} height={20} />
                        <SkeletonLine width={55} height={11} />
                    </View>
                ))}
            </View>
            {/* Post/content grid */}
            <View style={{ padding: 16, gap: 12, marginTop: 12 }}>
                {[0, 1, 2, 3].map(i => (
                    <SkeletonCard key={i} height={80} />
                ))}
            </View>
        </View>
    );
}
