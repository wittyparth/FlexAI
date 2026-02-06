/**
 * Elite Home Dashboard - Pixel-Perfect Recreation
 * 
 * Features:
 * - Calistoga font for headings
 * - JetBrains Mono for numbers/metrics
 * - Material Design icons
 * - Gradient CTA button
 * - Horizontal scrolling metrics
 * - Animated streak badge
 * - Light/Dark mode support
 * - Drawer navigation trigger
 * - Hardcoded dummy data for UI demonstration
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// DESIGN TOKENS - Matching dashboard.html exactly
// =============================================================================

const COLORS = {
    light: {
        primary: '#0d59f2',
        primaryDark: '#0b4ecf',
        accent: '#00f2fe',
        background: '#f8f9fc',
        card: '#ffffff',
        textMain: '#0d121c',
        textMuted: '#64748b',
        orange: '#f97316',
        orangeLight: '#fff7ed',
        orangeBorder: '#ffedd5',
        blueLight: '#eff6ff',
        greenLight: '#ecfdf5',
        green: '#10b981',
        border: '#f1f5f9',
        iconBg: '#f8fafc',
    },
    dark: {
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        accent: '#00f2fe',
        background: '#101622',
        card: '#1a2332',
        textMain: '#f1f5f9',
        textMuted: '#94a3b8',
        orange: '#fb923c',
        orangeLight: '#431407',
        orangeBorder: '#7c2d12',
        blueLight: '#1e3a5f',
        greenLight: '#064e3b',
        green: '#34d399',
        border: '#2d3748',
        iconBg: '#1e293b',
    },
};

const FONTS = {
    calistoga: 'Calistoga',
    inter: 'Inter',
    interMedium: 'Inter-Medium',
    interSemiBold: 'Inter-SemiBold',
    interBold: 'Inter-Bold',
    mono: 'JetBrainsMono',
};

// =============================================================================
// DUMMY DATA - For UI demonstration
// =============================================================================

const DUMMY_USER = {
    firstName: 'John',
    streak: 23,
    bestStreak: 45,
};

const DUMMY_METRICS = {
    weeklyVolume: 52400,
    bestStreak: 45,
    recovery: 'Fresh',
};

const DUMMY_RECENT_WORKOUTS = [
    {
        id: '1',
        name: 'Push Day A',
        date: 'Yesterday',
        volume: 12450,
        hasPR: true,
        iconName: 'ruler' as const,
    },
    {
        id: '2',
        name: 'Pull Hypertrophy',
        date: '3 days ago',
        volume: 10200,
        hasPR: false,
        iconName: 'yoga' as const,
    },
    {
        id: '3',
        name: 'Legs & Core',
        date: '5 days ago',
        volume: 15600,
        hasPR: true,
        iconName: 'run' as const,
    },
];

const QUICK_ACTIONS = [
    { id: 'templates', label: 'Templates', iconName: 'file-document-outline' as const, route: 'RoutineList' },
    { id: 'exercises', label: 'Exercises', iconName: 'dumbbell' as const, route: 'ExerciseLibrary' },
    { id: 'progress', label: 'Progress', iconName: 'chart-line' as const, route: 'StatsScreen' },
    { id: 'coach', label: 'Coach', iconName: 'account-outline' as const, route: 'AICoachChat' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatVolume = (value: number): string => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
};

const formatVolumeWithCommas = (value: number): string => {
    return value.toLocaleString();
};

const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Animated Streak Badge
const StreakBadge: React.FC<{ streak: number; colors: typeof COLORS.light }> = ({ streak, colors }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const pingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
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

        Animated.loop(
            Animated.sequence([
                Animated.timing(pingAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pingAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.streakBadge, {
            backgroundColor: colors.orangeLight,
            borderColor: colors.orangeBorder
        }]}>
            <View style={styles.streakDotContainer}>
                <Animated.View
                    style={[
                        styles.streakDotPing,
                        {
                            opacity: pingAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.75, 0],
                            }),
                            transform: [{
                                scale: pingAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 2],
                                })
                            }],
                        },
                    ]}
                />
                <LinearGradient
                    colors={['#f97316', '#facc15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.streakDotInner}
                />
            </View>
            <MaterialCommunityIcons name="fire" size={18} color={colors.orange} />
            <Text style={[styles.streakNumber, { color: colors.orange }]}>{streak}</Text>
        </View>
    );
};

// Metric Card Component
interface MetricCardProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
    iconBgColor: string;
    decorColor: string;
    label: string;
    value: string;
    unit?: string;
    showPulse?: boolean;
    colors: typeof COLORS.light;
}

const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    iconColor,
    iconBgColor,
    decorColor,
    label,
    value,
    unit,
    showPulse,
    colors,
}) => (
    <View style={[styles.metricCard, {
        backgroundColor: colors.card,
        borderColor: colors.border
    }]}>
        <View style={[styles.metricCardDecor, { backgroundColor: decorColor }]} />

        <View style={styles.metricCardHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: iconBgColor }]}>
                <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
            </View>
            {showPulse && (
                <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
            )}
        </View>

        <View style={styles.metricCardContent}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
            <View style={styles.metricValueRow}>
                <Text style={[styles.metricValue, { color: colors.textMain }]}>{value}</Text>
                {unit && <Text style={[styles.metricUnit, { color: colors.textMuted }]}>{unit}</Text>}
            </View>
        </View>
    </View>
);

// Workout Activity Card
interface WorkoutCardProps {
    workout: typeof DUMMY_RECENT_WORKOUTS[0];
    colors: typeof COLORS.light;
    onPress?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, colors, onPress }) => (
    <TouchableOpacity
        style={[styles.workoutCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
        }]}
        activeOpacity={0.7}
        onPress={onPress}
    >
        <View style={styles.workoutCardLeft}>
            <View style={[styles.workoutIconContainer, { backgroundColor: colors.iconBg }]}>
                <MaterialCommunityIcons
                    name={workout.iconName}
                    size={24}
                    color={colors.textMain}
                />
            </View>
            <View style={styles.workoutInfo}>
                <Text style={[styles.workoutName, { color: colors.textMain }]}>{workout.name}</Text>
                <Text style={[styles.workoutDate, { color: colors.textMuted }]}>{workout.date}</Text>
            </View>
        </View>

        <View style={styles.workoutCardRight}>
            <Text style={[styles.workoutVolume, { color: colors.textMain }]}>
                {formatVolumeWithCommas(workout.volume)} kg
            </Text>
            {workout.hasPR ? (
                <LinearGradient
                    colors={[colors.primary, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.prBadge}
                >
                    <Text style={styles.prBadgeText}>NEW PR</Text>
                </LinearGradient>
            ) : (
                <Text style={[styles.standardLabel, { color: colors.textMuted }]}>Standard</Text>
            )}
        </View>
    </TouchableOpacity>
);

// Quick Action Button
interface QuickActionProps {
    action: typeof QUICK_ACTIONS[0];
    colors: typeof COLORS.light;
    onPress?: () => void;
}

const QuickActionButton: React.FC<QuickActionProps> = ({ action, colors, onPress }) => (
    <TouchableOpacity
        style={[styles.quickActionCard, {
            backgroundColor: colors.card,
            borderColor: colors.border
        }]}
        activeOpacity={0.7}
        onPress={onPress}
    >
        <View style={[styles.quickActionIcon, { backgroundColor: colors.blueLight }]}>
            <MaterialCommunityIcons
                name={action.iconName}
                size={24}
                color={colors.primary}
            />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.textMain }]}>{action.label}</Text>
    </TouchableOpacity>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const colors = isDark ? COLORS.dark : COLORS.light;

    const openDrawer = () => {
        if (navigation.openDrawer) {
            navigation.openDrawer();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 100 }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* ========== HEADER ========== */}
                <View style={[styles.header, {
                    paddingTop: insets.top + 16,
                    backgroundColor: colors.background
                }]}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            {/* Menu Button for Drawer */}
                            <TouchableOpacity
                                style={[styles.menuButton, { backgroundColor: colors.card }]}
                                onPress={openDrawer}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="menu"
                                    size={24}
                                    color={colors.textMain}
                                />
                            </TouchableOpacity>
                            <View style={styles.greetingContainer}>
                                <Text style={[styles.dashboardLabel, { color: colors.textMuted }]}>
                                    DASHBOARD
                                </Text>
                                <Text style={[styles.greeting, { color: colors.textMain }]}>
                                    {getGreeting()},{'\n'}{DUMMY_USER.firstName}
                                </Text>
                            </View>
                        </View>
                        <StreakBadge streak={DUMMY_USER.streak} colors={colors} />
                    </View>
                </View>

                {/* ========== MAIN CONTENT ========== */}
                <View style={styles.mainContent}>

                    {/* ========== START WORKOUT CTA ========== */}
                    <TouchableOpacity
                        style={styles.ctaWrapper}
                        activeOpacity={0.95}
                        onPress={() => navigation.navigate('WorkoutHub')}
                    >
                        <LinearGradient
                            colors={[colors.primary, '#2563EB', colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaOuter}
                        >
                            <View style={styles.ctaInner}>
                                <View style={styles.ctaTextContainer}>
                                    <Text style={styles.ctaLabel}>READY TO TRAIN?</Text>
                                    <Text style={styles.ctaTitle}>Start New Workout</Text>
                                </View>
                                <View style={styles.ctaPlayButton}>
                                    <MaterialCommunityIcons
                                        name="play"
                                        size={28}
                                        color="#FFFFFF"
                                    />
                                </View>

                                {/* Decorative blurs */}
                                <View style={styles.ctaBlur1} />
                                <View style={styles.ctaBlur2} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* ========== YOUR METRICS ========== */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                                Your Metrics
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('StatsScreen')}>
                                <Text style={[styles.viewAllLink, { color: colors.primary }]}>
                                    View All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.metricsScroll}
                            style={styles.metricsScrollView}
                        >
                            <MetricCard
                                icon="dumbbell"
                                iconColor={colors.primary}
                                iconBgColor={colors.blueLight}
                                decorColor={colors.blueLight}
                                label="WEEKLY VOLUME"
                                value={formatVolume(DUMMY_METRICS.weeklyVolume)}
                                unit="kg"
                                colors={colors}
                            />
                            <MetricCard
                                icon="trophy"
                                iconColor={colors.orange}
                                iconBgColor={colors.orangeLight}
                                decorColor={colors.orangeLight}
                                label="BEST STREAK"
                                value={DUMMY_METRICS.bestStreak.toString()}
                                unit="days"
                                colors={colors}
                            />
                            <MetricCard
                                icon="heart-pulse"
                                iconColor={colors.green}
                                iconBgColor={colors.greenLight}
                                decorColor={colors.greenLight}
                                label="RECOVERY"
                                value={DUMMY_METRICS.recovery}
                                showPulse
                                colors={colors}
                            />
                        </ScrollView>
                    </View>

                    {/* ========== RECENT ACTIVITY ========== */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain, marginLeft: 4 }]}>
                            Recent Activity
                        </Text>
                        <View style={styles.workoutsList}>
                            {DUMMY_RECENT_WORKOUTS.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    colors={colors}
                                    onPress={() => { }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* ========== QUICK ACTIONS ========== */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textMain, marginLeft: 4 }]}>
                            Quick Actions
                        </Text>
                        <View style={styles.quickActionsGrid}>
                            {QUICK_ACTIONS.map((action) => (
                                <QuickActionButton
                                    key={action.id}
                                    action={action}
                                    colors={colors}
                                    onPress={() => navigation.navigate(action.route)}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

    // ========== HEADER ==========
    header: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    menuButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    greetingContainer: {
        flex: 1,
        gap: 4,
    },
    dashboardLabel: {
        fontFamily: FONTS.interBold,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    greeting: {
        fontFamily: FONTS.calistoga,
        fontSize: 28,
        lineHeight: 34,
    },

    // ========== STREAK BADGE ==========
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
    },
    streakDotContainer: {
        width: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakDotPing: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#f97316',
    },
    streakDotInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    streakNumber: {
        fontFamily: FONTS.mono,
        fontSize: 14,
        fontWeight: '700',
    },

    // ========== MAIN CONTENT ==========
    mainContent: {
        paddingHorizontal: 24,
        gap: 32,
    },

    // ========== CTA BUTTON ==========
    ctaWrapper: {
        borderRadius: 24,
        shadowColor: '#0d59f2',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaOuter: {
        borderRadius: 24,
        padding: 4,
    },
    ctaInner: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    ctaTextContainer: {
        flex: 1,
        gap: 4,
    },
    ctaLabel: {
        fontFamily: FONTS.interBold,
        fontSize: 10,
        letterSpacing: 1.2,
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
    },
    ctaTitle: {
        fontFamily: FONTS.interBold,
        fontSize: 24,
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    ctaPlayButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaBlur1: {
        position: 'absolute',
        right: -24,
        bottom: -24,
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    ctaBlur2: {
        position: 'absolute',
        left: -24,
        top: -24,
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    // ========== SECTIONS ==========
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontFamily: FONTS.calistoga,
        fontSize: 20,
    },
    viewAllLink: {
        fontFamily: FONTS.interMedium,
        fontSize: 12,
    },

    // ========== METRICS ==========
    metricsScrollView: {
        marginHorizontal: -24,
    },
    metricsScroll: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 8,
        gap: 16,
    },
    metricCard: {
        minWidth: 160,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 25,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    metricCardDecor: {
        position: 'absolute',
        top: -16,
        right: -16,
        width: 64,
        height: 64,
        borderBottomLeftRadius: 999,
    },
    metricCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        zIndex: 1,
    },
    metricIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
    },
    metricCardContent: {
        gap: 2,
        zIndex: 1,
    },
    metricLabel: {
        fontFamily: FONTS.interSemiBold,
        fontSize: 10,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    metricValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    metricValue: {
        fontFamily: FONTS.mono,
        fontSize: 24,
        fontWeight: '700',
    },
    metricUnit: {
        fontFamily: FONTS.inter,
        fontSize: 14,
    },

    // ========== WORKOUTS LIST ==========
    workoutsList: {
        gap: 12,
    },
    workoutCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    workoutCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    workoutIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutInfo: {
        gap: 4,
    },
    workoutName: {
        fontFamily: FONTS.interBold,
        fontSize: 16,
    },
    workoutDate: {
        fontFamily: FONTS.inter,
        fontSize: 12,
    },
    workoutCardRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    workoutVolume: {
        fontFamily: FONTS.mono,
        fontSize: 14,
        fontWeight: '500',
    },
    prBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    prBadgeText: {
        fontFamily: FONTS.interBold,
        fontSize: 10,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    standardLabel: {
        fontFamily: FONTS.inter,
        fontSize: 10,
    },

    // ========== QUICK ACTIONS ==========
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        width: (SCREEN_WIDTH - 48 - 12) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        gap: 12,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontFamily: FONTS.interSemiBold,
        fontSize: 14,
    },
});
