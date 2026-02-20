import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import {
    EXPLORE_CATEGORIES, EXPLORE_FEATURED, EXPLORE_COMMUNITY_ROUTINES, EXPLORE_CHALLENGES,
} from '../../data/mockData';
import type { ThemeColors } from '../../hooks/useColors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIFF_COLOR: Record<string, string> = { Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444' };

function SectionHeader({ title, onViewAll, colors }: { title: string; onViewAll?: () => void; colors: ThemeColors }) {
    return (
        <View style={s.sectionHeaderRow}>
            <Text style={[s.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>{title}</Text>
            {onViewAll && <TouchableOpacity onPress={onViewAll}><Text style={[s.viewAll, { color: colors.primary.main }]}>View All</Text></TouchableOpacity>}
        </View>
    );
}

function CategoryCard({ cat, onPress, colors }: { cat: any; onPress: () => void; colors: ThemeColors }) {
    return (
        <TouchableOpacity style={[s.catCard, { backgroundColor: colors.card, borderColor: colors.border, width: (SCREEN_WIDTH - 52) / 2 }]} onPress={onPress} activeOpacity={0.75}>
            <View style={[s.catIcon, { backgroundColor: `${cat.color}18` }]}><MaterialCommunityIcons name={cat.icon} size={22} color={cat.color} /></View>
            <View style={s.catText}><Text style={[s.catLabel, { color: colors.foreground }]}>{cat.label}</Text><Text style={[s.catCount, { color: colors.mutedForeground }]}>{cat.count} items</Text></View>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
}

function FeaturedCard({ item, onPress, colors }: { item: any; onPress: () => void; colors: ThemeColors }) {
    return (
        <TouchableOpacity style={[s.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.8}>
            <View style={[s.featBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}><Text style={[s.featBadgeText, { color: colors.mutedForeground }]}>{item.type}</Text></View>
            <Text style={[s.featTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
            <View style={s.featMeta}>
                <Ionicons name="star" size={12} color={colors.warning} /><Text style={[s.featRating, { color: colors.foreground }]}>{item.rating}</Text>
                <Text style={{ color: colors.mutedForeground }}>•</Text><Ionicons name="people-outline" size={12} color={colors.mutedForeground} />
                <Text style={[s.featUsers, { color: colors.mutedForeground }]}>{item.users.toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );
}

function CommunityCard({ routine, onPress, colors }: { routine: any; onPress: () => void; colors: ThemeColors }) {
    const dc = DIFF_COLOR[routine.difficulty] || colors.chart4;
    return (
        <TouchableOpacity style={[s.commCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.8}>
            <View style={s.commHeader}>
                <View style={{ flex: 1 }}><Text style={[s.commName, { color: colors.foreground }]}>{routine.name}</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>by {routine.author}</Text></View>
                <View style={[s.diffBadge, { backgroundColor: `${dc}15`, borderColor: `${dc}30`, borderWidth: 1 }]}><Text style={[s.diffText, { color: dc }]}>{routine.difficulty}</Text></View>
            </View>
            <View style={[s.divider, { backgroundColor: colors.border }]} />
            <View style={s.commFooter}>
                <View style={s.metaItem}><Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} /><Text style={{ fontSize: 12, color: colors.mutedForeground }}>{routine.days}×/week</Text></View>
                <View style={s.metaItem}><Ionicons name="heart" size={13} color={colors.destructive} /><Text style={{ fontSize: 12, color: colors.mutedForeground }}>{routine.likes.toLocaleString()}</Text></View>
                <TouchableOpacity style={[s.useBtn, { borderColor: colors.primary.main }]} onPress={onPress}><Text style={[s.useBtnText, { color: colors.primary.main }]}>Use</Text></TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

function ChallengeCard({ ch, onPress, colors }: { ch: any; onPress: () => void; colors: ThemeColors }) {
    return (
        <TouchableOpacity style={[s.challCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.8}>
            <View style={[s.challIcon, { backgroundColor: colors.muted }]}><Text style={{ fontSize: 24 }}>{ch.badge}</Text></View>
            <View style={{ flex: 1 }}><Text style={[s.challName, { color: colors.foreground }]}>{ch.name}</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>{ch.participants.toLocaleString()} participants • {ch.daysLeft} days left</Text></View>
            <TouchableOpacity style={[s.joinBtn, { borderColor: colors.primary.main }]} onPress={onPress}><Text style={[s.joinText, { color: colors.primary.main }]}>Join</Text></TouchableOpacity>
        </TouchableOpacity>
    );
}

export function ExploreHubScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const fade = useRef(new Animated.Value(0)).current;
    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;
    const getTabNav = () => navigation.getParent() ?? navigation;
    React.useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);
    const handleCat = (id: string) => {
        if (id === 'exercises') navigation.navigate('ExerciseLibrary');
        else if (id === 'routines') navigation.navigate('PublicRoutines');
        else if (id === 'templates') getTabNav().navigate('WorkoutTab', { screen: 'RoutineList' });
        else if (id === 'challenges') getDrawerNav().navigate('SocialTab', { screen: 'ChallengesList' });
    };

    return (
        <View style={[s.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
                <View style={[s.header, { paddingTop: insets.top + 16 }]}>
                    <View><Text style={[s.headerSub, { color: colors.mutedForeground }]}>DISCOVER</Text><Text style={[s.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Explore</Text></View>
                    <TouchableOpacity style={[s.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}><Ionicons name="search-outline" size={20} color={colors.foreground} /></TouchableOpacity>
                </View>
                <Animated.View style={{ opacity: fade }}>
                    <View style={[s.px, s.mt]}><SectionHeader title="Browse" colors={colors} /><View style={s.catGrid}>{EXPLORE_CATEGORIES.map(c => <CategoryCard key={c.id} cat={c} colors={colors} onPress={() => handleCat(c.id)} />)}</View></View>
                    <View style={s.mt}><View style={s.px}><SectionHeader title="Featured" colors={colors} /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.featScroll}>{EXPLORE_FEATURED.map(i => <FeaturedCard key={i.id} item={i} colors={colors} onPress={() => {}} />)}</ScrollView></View>
                    <View style={[s.px, s.mt]}><SectionHeader title="Community Routines" onViewAll={() => navigation.navigate('PublicRoutines')} colors={colors} />{EXPLORE_COMMUNITY_ROUTINES.map(r => <CommunityCard key={r.id} routine={r} colors={colors} onPress={() => navigation.navigate('PublicRoutines')} />)}</View>
                    <View style={[s.px, s.mt]}><SectionHeader title="Active Challenges" colors={colors} />{EXPLORE_CHALLENGES.map(ch => <ChallengeCard key={ch.id} ch={ch} colors={colors} onPress={() => {}} />)}</View>
                </Animated.View>
            </ScrollView>
            <TouchableOpacity style={[s.fab, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => getDrawerNav().navigate('Coach', { screen: 'CoachHub' })} activeOpacity={0.9}>
                <Ionicons name="sparkles" size={20} color={colors.primary.main} /><Text style={[s.fabLabel, { color: colors.primary.main }]}>AI Coach</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 }, px: { paddingHorizontal: 20 }, mt: { marginTop: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 8 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 }, headerTitle: { fontSize: 32 },
    headerBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 20 }, viewAll: { fontSize: 13, fontWeight: '600' },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    catCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    catIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    catText: { flex: 1 }, catLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 }, catCount: { fontSize: 11 },
    featScroll: { gap: 12, paddingHorizontal: 20, paddingRight: 28, paddingBottom: 4 },
    featuredCard: { width: SCREEN_WIDTH * 0.62, borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
    featBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    featBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    featTitle: { fontSize: 18, fontWeight: '800', lineHeight: 23 },
    featMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 }, featRating: { fontSize: 12, fontWeight: '700' }, featUsers: { fontSize: 12 },
    commCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12 },
    commHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    commName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
    diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, diffText: { fontSize: 11, fontWeight: '700' },
    divider: { height: 1 },
    commFooter: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    useBtn: { marginLeft: 'auto' as any, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    useBtnText: { fontSize: 13, fontWeight: '700' },
    challCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    challIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    challName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 }, joinText: { fontSize: 13, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 28, right: 20, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 28, borderWidth: 1 },
    fabLabel: { fontSize: 14, fontWeight: '700' },
});
