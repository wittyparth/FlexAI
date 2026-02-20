import React, { useRef, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import {
    DUMMY_USER,
    PROFILE_STATS,
    PROFILE_ANALYTICS_SUMMARY,
    HEATMAP_DATA,
} from '../../data/mockData';
import { WorkoutHeatmap } from '../../components/WorkoutHeatmap';

const { width } = Dimensions.get('window');

// ============================================================
// INLINE STAT STRIP
// ============================================================
function StatStrip({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ============================================================
// SECTION HEADER
// ============================================================
function SectionHeader({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
    const colors = useColors();
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.viewAllText, { color: colors.primary?.main || '#2196F3' }]}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ============================================================
// NAV CARD — clickable destination card
// ============================================================
function NavCard({
    icon,
    label,
    subtitle,
    color,
    onPress,
}: {
    icon: string;
    label: string;
    subtitle?: string;
    color: string;
    onPress: () => void;
}) {
    const colors = useColors();
    return (
        <TouchableOpacity
            style={[styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.navCardIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <View style={styles.navCardText}>
                <Text style={[styles.navCardLabel, { color: colors.foreground }]}>{label}</Text>
                {subtitle && <Text style={[styles.navCardSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
}

// ============================================================
// MAIN SCREEN
// ============================================================
export function ProfileHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const xpProgress = (DUMMY_USER.xp / DUMMY_USER.xpToNext) * 100;

    // Cross-navigator navigation helpers
    // ProfileHub lives in: MainDrawer > MainTabs (ProfileTab) > ProfileNavigator > ProfileHubScreen
    // We need to surface 2 levels up to reach the Drawer-level navigators.
    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;
    const goToAnalytics = (screen = 'AnalyticsHub') => getDrawerNav().navigate('Analytics', { screen });
    const goToBodyTracking = (screen = 'BodyTrackingHub') => getDrawerNav().navigate('BodyTracking', { screen });
    const goToCoach = (screen = 'CoachHub') => getDrawerNav().navigate('Coach', { screen });
    const goToSettings = (screen = 'Settings') => getDrawerNav().navigate('SettingsNavigator', { screen });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}>

                {/* ─── PROFILE HERO ─── */}
                <View
                    style={[styles.heroGradient, { backgroundColor: colors.card, paddingTop: insets.top + 12 }]}
                >
                    {/* Header bar */}
                    <View style={styles.heroTopBar}>
                        <Text style={[styles.heroPageTitle, { fontFamily: fontFamilies.display }]}>Profile</Text>
                        <TouchableOpacity style={styles.heroIconBtn} onPress={() => getDrawerNav().navigate('SettingsNavigator', { screen: 'Settings' })}>
                            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar + info */}
                    <View style={styles.heroBody}>
                        <View style={styles.avatarWrapper}>
                            <View style={[styles.avatarRing, { backgroundColor: colors.primary.main }]}>
                                <View style={[styles.avatarInner, { backgroundColor: colors.card }]}>
                                    <Text style={styles.avatarText}>{DUMMY_USER.firstName.charAt(0)}</Text>
                                </View>
                            </View>
                            <View style={[styles.levelBadge, { backgroundColor: '#F59E0B' }]}>
                                <Text style={styles.levelBadgeText}>{DUMMY_USER.level}</Text>
                            </View>
                        </View>

                        <View style={styles.heroInfo}>
                            <Text style={styles.heroName}>{DUMMY_USER.firstName} {DUMMY_USER.surname}</Text>
                            <Text style={styles.heroHandle}>{DUMMY_USER.username}</Text>
                            <View style={styles.streakPill}>
                                <Ionicons name="flame" size={13} color="#F97316" />
                                <Text style={styles.streakPillText}>{DUMMY_USER.streak} day streak</Text>
                            </View>
                        </View>
                    </View>

                    {/* XP Bar */}
                    <View style={styles.xpSection}>
                        <View style={styles.xpLabelRow}>
                            <Text style={styles.xpLevelText}>Level {DUMMY_USER.level}</Text>
                            <Text style={styles.xpValueText}>{DUMMY_USER.xp.toLocaleString()} / {DUMMY_USER.xpToNext.toLocaleString()} XP</Text>
                        </View>
                        <View style={styles.xpBarBg}>
                            <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
                        </View>
                    </View>
                </View>

                {/* ─── INLINE STATS STRIP ─── */}
                <Animated.View style={[
                    styles.statsStrip,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <StatStrip value="342" label="Workouts" color="#6366F1" />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatStrip value="1.2M" label="Volume (lbs)" color="#3B82F6" />
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <StatStrip value="4/wk" label="This Week" color="#10B981" />
                </Animated.View>

                {/* ─── WORKOUT HEATMAP ─── */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <SectionHeader title="Activity" onViewAll={() => goToAnalytics('AnalyticsHub')} />
                    <View style={[styles.heatmapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <WorkoutHeatmap
                            data={HEATMAP_DATA}
                            showToggle
                            defaultRange="month"
                            compact
                            containerPaddingH={72}
                            showLegend
                        />
                    </View>
                </Animated.View>

                {/* ─── ANALYTICS (inline quick access, not deeply nested) ─── */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <SectionHeader title="Analytics" onViewAll={() => goToAnalytics('AnalyticsHub')} />

                    {/* Summary stat cards */}
                    <View style={styles.analyticsSummaryRow}>
                        {PROFILE_ANALYTICS_SUMMARY.map(item => (
                            <View key={item.label} style={[styles.analyticsMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name={item.icon as any} size={18} color={item.color} />
                                <Text style={[styles.analyticsValue, { color: colors.foreground }]}>{item.value}</Text>
                                <Text style={[styles.analyticsLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Analytics nav cards */}
                    <View style={styles.navCardList}>
                        <NavCard icon="trophy-outline" label="Personal Records" subtitle="47 all-time PRs" color="#F59E0B" onPress={() => goToAnalytics('PersonalRecords')} />
                        <NavCard icon="trending-up" label="Strength Progression" subtitle="Track your lifts over time" color="#6366F1" onPress={() => goToAnalytics('StrengthProgression')} />
                        <NavCard icon="bar-chart-outline" label="Volume Analytics" subtitle="Weekly & monthly volume" color="#3B82F6" onPress={() => goToAnalytics('VolumeAnalytics')} />
                        <NavCard icon="body-outline" label="Muscle Heatmap" subtitle="Muscle group distribution" color="#EC4899" onPress={() => goToAnalytics('MuscleHeatmap')} />
                    </View>
                </Animated.View>

                {/* ─── BODY TRACKING ─── */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <SectionHeader title="Body Tracking" onViewAll={() => goToBodyTracking('BodyTrackingHub')} />
                    <View style={styles.navCardList}>
                        <NavCard icon="scale-outline" label="Weight Log" subtitle="Track weight over time" color="#10B981" onPress={() => goToBodyTracking('WeightLog')} />
                        <NavCard icon="resize-outline" label="Measurements" subtitle="Body measurements" color="#14B8A6" onPress={() => goToBodyTracking('Measurements')} />
                        <NavCard icon="camera-outline" label="Progress Photos" subtitle="Visual progress timeline" color="#8B5CF6" onPress={() => goToBodyTracking('ProgressPhotos')} />
                    </View>
                </Animated.View>

                {/* ─── AI COACH ─── */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <SectionHeader title="AI Coach" />
                    <TouchableOpacity
                        style={styles.coachCard}
                        onPress={() => goToCoach('CoachHub')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient colors={['#1E40AF', '#6366F1']} style={styles.coachGradient}>
                            <View style={styles.coachContent}>
                                <View>
                                    <Text style={styles.coachLabel}>AI-POWERED</Text>
                                    <Text style={styles.coachTitle}>Your Personal Coach</Text>
                                    <Text style={styles.coachSub}>Get personalized advice, form analysis & workout plans</Text>
                                </View>
                                <View style={styles.coachIconBg}>
                                    <Ionicons name="sparkles" size={28} color="#FFF" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* ─── SETTINGS ─── */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <SectionHeader title="Settings" />
                    <View style={styles.navCardList}>
                        <NavCard icon="settings-outline" label="App Settings" subtitle="Notifications, units, theme" color="#6B7280" onPress={() => goToSettings('Settings')} />
                        <NavCard icon="lock-closed-outline" label="Account & Security" subtitle="Password, privacy" color="#EF4444" onPress={() => goToSettings('AccountSecurity')} />
                        <NavCard icon="help-circle-outline" label="Help & Support" subtitle="FAQ, contact us" color="#6B7280" onPress={() => goToSettings('HelpSupport')} />
                    </View>
                </Animated.View>

                {/* ─── LOGOUT ─── */}
                <TouchableOpacity style={[styles.logoutBtn, { borderColor: `${colors.error || '#EF4444'}40` }]} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error || '#EF4444'} />
                    <Text style={[styles.logoutText, { color: colors.error || '#EF4444' }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Hero
    heroGradient: { paddingHorizontal: 20, paddingBottom: 28 },
    heroTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    heroPageTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    heroIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
    heroBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    avatarWrapper: { position: 'relative' },
    avatarRing: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    avatarInner: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 30, fontWeight: '800', color: '#6366F1' },
    levelBadge: { position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0A1628' },
    levelBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
    heroInfo: { flex: 1, gap: 4 },
    heroName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    heroHandle: { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
    streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
    streakPillText: { fontSize: 13, fontWeight: '600', color: '#F97316' },
    xpSection: { gap: 8 },
    xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    xpLevelText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
    xpValueText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    xpBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
    xpBarFill: { height: '100%', borderRadius: 4, backgroundColor: '#3B82F6' },

    // Stats Strip
    statsStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    statDivider: { width: 1, height: 32, marginHorizontal: 4 },

    // Sections
    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800' },
    viewAllText: { fontSize: 13, fontWeight: '600' },
    card: { borderRadius: 16, borderWidth: 1, padding: 16 },
    heatmapCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, overflow: 'hidden' },

    // Analytics summary cards
    analyticsSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    analyticsMiniCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
    analyticsValue: { fontSize: 16, fontWeight: '800' },
    analyticsLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },

    // NavCards
    navCardList: { gap: 8 },
    navCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
    navCardIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    navCardText: { flex: 1 },
    navCardLabel: { fontSize: 15, fontWeight: '700' },
    navCardSub: { fontSize: 12, marginTop: 2 },

    // AI Coach card
    coachCard: { borderRadius: 18, overflow: 'hidden' },
    coachGradient: { padding: 20 },
    coachContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    coachLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 4 },
    coachTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 6 },
    coachSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 220, lineHeight: 18 },
    coachIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

    // Logout
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 16, marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1 },
    logoutText: { fontSize: 16, fontWeight: '700' },
});
