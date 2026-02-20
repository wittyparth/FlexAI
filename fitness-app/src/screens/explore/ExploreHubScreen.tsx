import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts';
import {
    EXPLORE_CATEGORIES, EXPLORE_FEATURED, EXPLORE_COMMUNITY_ROUTINES, EXPLORE_CHALLENGES,
} from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Classic, no rainbow, no gradient backgrounds
const C = {
    dark:  { bg: '#0A0E1A', card: '#131C2E', border: '#1F2D45', text: '#F1F5FF', muted: '#7A8BAA', primary: '#3B82F6', surface: '#1A2540' },
    light: { bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F8', text: '#0D1526', muted: '#64748B', primary: '#2563EB', surface: '#EEF2FF' },
};
const FNT = { display: 'Calistoga', semi: 'Inter-SemiBold' };
const DIFF_COLOR: Record<string, string> = { Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444' };

function SectionHeader({ title, onViewAll, c }: { title: string; onViewAll?: () => void; c: typeof C.dark }) {
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: c.text, fontFamily: FNT.display }]}>{title}</Text>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.viewAll, { color: c.primary }]}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── CATEGORY CARD (grid card, not pill) ───
function CategoryCard({ cat, onPress, c }: { cat: any; onPress: () => void; c: typeof C.dark }) {
    const CARD_W = (SCREEN_WIDTH - 52) / 2;
    return (
        <TouchableOpacity
            style={[styles.catCard, { backgroundColor: c.card, borderColor: c.border, width: CARD_W }]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.catCardIcon, { backgroundColor: `${cat.color}18` }]}>
                <MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} />
            </View>
            <View style={styles.catCardText}>
                <Text style={[styles.catCardLabel, { color: c.text }]}>{cat.label}</Text>
                <Text style={[styles.catCardCount, { color: c.muted }]}>{cat.count} items</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.muted} />
        </TouchableOpacity>
    );
}

// ─── FEATURED CARD — classic (no gradient, plain card) ───
function FeaturedCard({ item, onPress, c }: { item: any; onPress: () => void; c: typeof C.dark }) {
    return (
        <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.featuredCardTop}>
                <View style={[styles.featuredTypeBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
                    <Text style={[styles.featuredTypeText, { color: c.muted }]}>{item.type}</Text>
                </View>
            </View>
            <Text style={[styles.featuredTitle, { color: c.text }]} numberOfLines={2}>{item.title}</Text>
            <View style={styles.featuredMeta}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={[styles.featuredRating, { color: c.text }]}>{item.rating}</Text>
                <Text style={[styles.featuredSep, { color: c.muted }]}>•</Text>
                <Ionicons name="people-outline" size={12} color={c.muted} />
                <Text style={[styles.featuredUsers, { color: c.muted }]}>{item.users.toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── COMMUNITY ROUTINE CARD (classic, no gradient) ───
function CommunityCard({ routine, onPress, c }: { routine: any; onPress: () => void; c: typeof C.dark }) {
    const diffColor = DIFF_COLOR[routine.difficulty] || '#6366F1';
    return (
        <TouchableOpacity
            style={[styles.communityCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.communityCardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.communityCardName, { color: c.text }]}>{routine.name}</Text>
                    <Text style={[styles.communityCardAuthor, { color: c.muted }]}>by {routine.author}</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: `${diffColor}15`, borderColor: `${diffColor}30`, borderWidth: 1 }]}>
                    <Text style={[styles.diffText, { color: diffColor }]}>{routine.difficulty}</Text>
                </View>
            </View>
            <View style={[styles.communityCardDivider, { backgroundColor: c.border }]} />
            <View style={styles.communityCardFooter}>
                <View style={styles.communityMetaItem}>
                    <Ionicons name="calendar-outline" size={13} color={c.muted} />
                    <Text style={[styles.communityMetaText, { color: c.muted }]}>{routine.days}×/week</Text>
                </View>
                <View style={styles.communityMetaItem}>
                    <Ionicons name="heart" size={13} color="#EF4444" />
                    <Text style={[styles.communityMetaText, { color: c.muted }]}>{routine.likes.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.useBtn, { borderColor: c.primary, borderWidth: 1 }]}
                    onPress={onPress}
                >
                    <Text style={[styles.useBtnText, { color: c.primary }]}>Use</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// ─── CHALLENGE CARD (classic, no gradient) ───
function ChallengeCard({ ch, onPress, c }: { ch: any; onPress: () => void; c: typeof C.dark }) {
    return (
        <TouchableOpacity
            style={[styles.challengeCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.challengeIconBg, { backgroundColor: c.surface }]}>
                <Text style={styles.challengeEmoji}>{ch.badge}</Text>
            </View>
            <View style={styles.challengeInfo}>
                <Text style={[styles.challengeName, { color: c.text }]}>{ch.name}</Text>
                <Text style={[styles.challengeMeta, { color: c.muted }]}>
                    {ch.participants.toLocaleString()} participants • {ch.daysLeft} days left
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.joinBtn, { borderColor: c.primary, borderWidth: 1 }]}
                onPress={onPress}
            >
                <Text style={[styles.joinText, { color: c.primary }]}>Join</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

export function ExploreHubScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const c = isDark ? C.dark : C.light;
    const fade = useRef(new Animated.Value(0)).current;

    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;
    const getTabNav = () => navigation.getParent() ?? navigation;

    React.useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const handleCategoryPress = (id: string) => {
        if (id === 'exercises') navigation.navigate('ExerciseLibrary');
        else if (id === 'routines') navigation.navigate('PublicRoutines');
        else if (id === 'templates') getTabNav().navigate('WorkoutTab', { screen: 'RoutineList' });
        else if (id === 'challenges') getDrawerNav().navigate('SocialTab', { screen: 'ChallengesList' });
    };

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                {/* ─── HEADER ─── */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <View>
                        <Text style={[styles.headerSub, { color: c.muted }]}>DISCOVER</Text>
                        <Text style={[styles.headerTitle, { color: c.text, fontFamily: FNT.display }]}>Explore</Text>
                    </View>
                    <TouchableOpacity style={[styles.headerBtn, { backgroundColor: c.card, borderColor: c.border }]}>
                        <Ionicons name="search-outline" size={20} color={c.text} />
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ opacity: fade }}>

                    {/* ─── BROWSE CATEGORIES (2×2 card grid) ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="Browse" c={c} />
                        <View style={styles.catGrid}>
                            {EXPLORE_CATEGORIES.map(cat => (
                                <CategoryCard
                                    key={cat.id}
                                    cat={cat}
                                    c={c}
                                    onPress={() => handleCategoryPress(cat.id)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* ─── FEATURED (horizontal scroll, classic cards) ─── */}
                    <View style={styles.mt}>
                        <View style={styles.px}>
                            <SectionHeader title="Featured" c={c} />
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.featuredScroll}
                        >
                            {EXPLORE_FEATURED.map(item => (
                                <FeaturedCard
                                    key={item.id}
                                    item={item}
                                    c={c}
                                    onPress={() => {}}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* ─── COMMUNITY ROUTINES ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader
                            title="Community Routines"
                            onViewAll={() => navigation.navigate('PublicRoutines')}
                            c={c}
                        />
                        {EXPLORE_COMMUNITY_ROUTINES.map(r => (
                            <CommunityCard
                                key={r.id}
                                routine={r}
                                c={c}
                                onPress={() => navigation.navigate('PublicRoutines')}
                            />
                        ))}
                    </View>

                    {/* ─── CHALLENGES (classic cards) ─── */}
                    <View style={[styles.px, styles.mt]}>
                        <SectionHeader title="Active Challenges" c={c} />
                        {EXPLORE_CHALLENGES.map(ch => (
                            <ChallengeCard
                                key={ch.id}
                                ch={ch}
                                c={c}
                                onPress={() => {}}
                            />
                        ))}
                    </View>

                </Animated.View>
            </ScrollView>

            {/* ─── FLOATING AI COACH BUTTON ─── */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() => getDrawerNav().navigate('Coach', { screen: 'CoachHub' })}
                activeOpacity={0.9}
            >
                <Ionicons name="sparkles" size={20} color={c.primary} />
                <Text style={[styles.fabLabel, { color: c.primary }]}>AI Coach</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20 },
    mt: { marginTop: 24 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 32 },
    headerBtn: {
        width: 42, height: 42, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },

    // Category section
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 20 },
    viewAll: { fontSize: 13, fontWeight: '600' },

    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 0,
    },
    catCardIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    catCardText: { flex: 1 },
    catCardLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    catCardCount: { fontSize: 11 },

    // Featured
    featuredScroll: { gap: 12, paddingHorizontal: 20, paddingRight: 28, paddingBottom: 4 },
    featuredCard: {
        width: SCREEN_WIDTH * 0.62,
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    featuredCardTop: {},
    featuredTypeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    featuredTypeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    featuredTitle: { fontSize: 18, fontWeight: '800', lineHeight: 23 },
    featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    featuredRating: { fontSize: 12, fontWeight: '700' },
    featuredSep: { fontSize: 12 },
    featuredUsers: { fontSize: 12 },

    // Community routine card
    communityCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    communityCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    communityCardName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
    communityCardAuthor: { fontSize: 12 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 11, fontWeight: '700' },
    communityCardDivider: { height: 1 },
    communityCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    communityMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    communityMetaText: { fontSize: 12 },
    useBtn: { marginLeft: 'auto' as any, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
    useBtnText: { fontSize: 13, fontWeight: '700' },

    // Challenge card
    challengeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    challengeIconBg: {
        width: 46, height: 46, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    challengeEmoji: { fontSize: 24 },
    challengeInfo: { flex: 1 },
    challengeName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    challengeMeta: { fontSize: 12 },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
    joinText: { fontSize: 13, fontWeight: '700' },

    // FAB - classic style, no gradient
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 28,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    fabLabel: { fontSize: 14, fontWeight: '700' },
});
