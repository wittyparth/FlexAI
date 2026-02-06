import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const USER_DATA = {
    name: 'Alex Johnson',
    username: '@alexfit',
    avatar: null,
    level: 42,
    xp: 12450,
    xpToNext: 15000,
    streak: 127,
    totalWorkouts: 342,
    joinedDate: 'Jan 2024',
};

const QUICK_STATS = [
    { label: 'Workouts', value: '342', icon: 'barbell-outline', color: '#6366F1' },
    { label: 'PRs', value: '47', icon: 'trophy', color: '#F59E0B' },
    { label: 'Streak', value: '127', icon: 'flame', color: '#EF4444' },
];

const MENU_SECTIONS = [
    {
        title: 'Analytics',
        items: [
            { id: 'stats', label: 'Stats Hub', icon: 'bar-chart', color: '#6366F1', route: 'StatsHub' },
            { id: 'records', label: 'Personal Records', icon: 'trophy', color: '#F59E0B', route: 'PersonalRecords' },
            { id: 'heatmap', label: 'Muscle Heatmap', icon: 'body', color: '#EC4899', route: 'MuscleHeatmap' },
        ],
    },
    {
        title: 'Body',
        items: [
            { id: 'body', label: 'Body Tracking', icon: 'scale', color: '#10B981', route: 'BodyTrackingHub' },
            { id: 'photos', label: 'Progress Photos', icon: 'camera', color: '#8B5CF6', route: 'ProgressPhotos' },
        ],
    },
    {
        title: 'AI Coach',
        items: [
            { id: 'coach', label: 'AI Coach', icon: 'chatbubbles', color: '#0EA5E9', route: 'CoachHub' },
        ],
    },
    {
        title: 'Settings',
        items: [
            { id: 'settings', label: 'Settings', icon: 'settings', color: '#6B7280', route: 'Settings' },
            { id: 'help', label: 'Help & Support', icon: 'help-circle', color: '#6B7280', route: 'HelpSupport' },
        ],
    },
];

export function ProfileHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const xpProgress = (USER_DATA.xp / USER_DATA.xpToNext) * 100;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <LinearGradient
                    colors={colors.primary.gradient as [string, string]}
                    style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
                >
                    <View style={styles.headerTop}>
                        <View style={{ width: 44 }} />
                        <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>Profile</Text>
                        <TouchableOpacity style={styles.headerBtn}>
                            <Ionicons name="settings-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <LinearGradient colors={['#FFF', '#E5E7EB'] as [string, string]} style={styles.avatarBg}>
                                <Text style={styles.avatarText}>{USER_DATA.name.charAt(0)}</Text>
                            </LinearGradient>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>{USER_DATA.level}</Text>
                            </View>
                        </View>
                        <Text style={styles.userName}>{USER_DATA.name}</Text>
                        <Text style={styles.userHandle}>{USER_DATA.username}</Text>

                        {/* XP Progress */}
                        <View style={styles.xpContainer}>
                            <View style={styles.xpHeader}>
                                <Text style={styles.xpLabel}>Level {USER_DATA.level}</Text>
                                <Text style={styles.xpValue}>{USER_DATA.xp.toLocaleString()} / {USER_DATA.xpToNext.toLocaleString()} XP</Text>
                            </View>
                            <View style={styles.xpBar}>
                                <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Stats */}
                <Animated.View style={[styles.quickStatsRow, { opacity: fadeAnim, marginTop: -30 }]}>
                    {QUICK_STATS.map((stat) => (
                        <View key={stat.label} style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.quickStatIcon, { backgroundColor: `${stat.color}15` }]}>
                                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                            </View>
                            <Text style={[styles.quickStatValue, { color: colors.foreground }]}>{stat.value}</Text>
                            <Text style={[styles.quickStatLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Menu Sections */}
                {MENU_SECTIONS.map((section, sectionIndex) => (
                    <View key={section.title} style={styles.menuSection}>
                        <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
                        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        itemIndex < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                    ]}
                                    onPress={() => navigation.navigate(item.route)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout */}
                <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: { paddingBottom: 60 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    profileSection: { alignItems: 'center', paddingHorizontal: 16 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatarBg: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 40, fontWeight: '700', color: '#6366F1' },
    levelBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
    levelText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    userName: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 4 },
    userHandle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
    xpContainer: { width: '100%', maxWidth: 280 },
    xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    xpLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
    xpValue: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    xpBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
    xpFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
    quickStatsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
    quickStatCard: { flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    quickStatIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    quickStatValue: { fontSize: 24, fontWeight: '800', fontFamily: fontFamilies.mono },
    quickStatLabel: { fontSize: 12, marginTop: 4 },
    menuSection: { marginTop: 24, paddingHorizontal: 16 },
    menuSectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
    logoutText: { fontSize: 16, fontWeight: '600' },
});
