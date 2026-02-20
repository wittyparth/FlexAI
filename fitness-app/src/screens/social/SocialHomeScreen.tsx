import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts';
import {
    SOCIAL_POSTS, SOCIAL_LEADERBOARD, SOCIAL_FRIENDS, SOCIAL_CHALLENGES,
} from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
    dark:  { bg: '#0A0E1A', card: '#131C2E', border: '#1F2D45', text: '#F1F5FF', muted: '#7A8BAA', primary: '#3B82F6', surface: '#1A2540' },
    light: { bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F8', text: '#0D1526', muted: '#64748B', primary: '#2563EB', surface: '#EEF2FF' },
};
const FNT = { display: 'Calistoga', mono: 'JetBrainsMono', semi: 'Inter-SemiBold' };

const TABS = ['Feed', 'Leaderboard', 'Challenges', 'Friends'];

const fmtTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const fmtVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
const fmtDur = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

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

// ─── POST CARD ───
function PostCard({ post, onLike, c }: { post: any; onLike: () => void; c: typeof C.dark }) {
    return (
        <View style={[styles.postCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.postHeader}>
                <Image source={{ uri: post.user.avatarUrl }} style={styles.postAvatar} />
                <View style={styles.postUserInfo}>
                    <Text style={[styles.postUsername, { color: c.text }]}>{post.user.firstName}</Text>
                    <Text style={[styles.postHandle, { color: c.muted }]}>@{post.user.username} • {fmtTime(post.createdAt)}</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color={c.muted} />
            </View>

            <Text style={[styles.postContent, { color: c.text }]}>{post.content}</Text>

            {post.workout && (
                <View style={[styles.workoutChip, { backgroundColor: c.surface }]}>
                    <Ionicons name="barbell-outline" size={16} color={c.primary} />
                    <Text style={[styles.workoutChipName, { color: c.text }]}>{post.workout.name}</Text>
                    <Text style={[styles.workoutChipMeta, { color: c.muted }]}>
                        {post.workout.exerciseCount} ex • {fmtVol(post.workout.totalVolume)} kg
                        {post.workout.duration > 0 ? ` • ${fmtDur(post.workout.duration)}` : ''}
                    </Text>
                </View>
            )}

            {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
            )}

            <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={onLike}>
                    <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={20} color={post.isLiked ? '#EF4444' : c.muted} />
                    <Text style={[styles.postActionCount, { color: c.muted }]}>{post.likesCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={20} color={c.muted} />
                    <Text style={[styles.postActionCount, { color: c.muted }]}>{post.commentsCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-outline" size={20} color={c.muted} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── LEADERBOARD ROW ───
function LeaderboardRow({ entry, c }: { entry: any; c: typeof C.dark }) {
    const rankColors: Record<number, string> = { 1: '#F59E0B', 2: '#9CA3AF', 3: '#CD7C2F' };
    const rc = rankColors[entry.rank] || c.muted;
    return (
        <View style={[styles.lbRow, { backgroundColor: entry.isMe ? `${c.primary}18` : c.card, borderColor: entry.isMe ? c.primary + '44' : c.border }]}>
            <Text style={[styles.lbRank, { color: rc, fontFamily: FNT.mono }]}>#{entry.rank}</Text>
            <Image source={{ uri: entry.avatar }} style={styles.lbAvatar} />
            <View style={styles.lbInfo}>
                <Text style={[styles.lbUsername, { color: c.text }]}>{entry.isMe ? 'You 🎯' : entry.username}</Text>
                <Text style={[styles.lbVolume, { color: c.muted, fontFamily: FNT.mono }]}>{fmtVol(entry.volume)} kg</Text>
            </View>
            <View style={[styles.lbChange, { backgroundColor: entry.change === '+2' || entry.change === '+1' ? '#10B98118' : entry.change === '0' ? c.surface : '#EF444418' }]}>
                <Text style={[styles.lbChangeText, { color: entry.change.startsWith('+') ? '#10B981' : entry.change === '0' ? c.muted : '#EF4444' }]}>
                    {entry.change === '0' ? '—' : entry.change}
                </Text>
            </View>
        </View>
    );
}

// ─── CHALLENGE CARD ───
function ChallengeCard({ ch, c }: { ch: any; c: typeof C.dark }) {
    return (
        <View style={[styles.challengeCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={styles.challengeIcon}>{ch.badge}</Text>
            <View style={styles.challengeInfo}>
                <Text style={[styles.challengeName, { color: c.text }]}>{ch.name}</Text>
                <Text style={[styles.challengeMeta, { color: c.muted }]}>{ch.participants.toLocaleString()} participants • {ch.daysLeft}d left</Text>
            </View>
            <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: ch.isJoined ? '#10B98120' : `${c.primary}20`, borderColor: ch.isJoined ? '#10B981' : c.primary }]}
                activeOpacity={0.8}
            >
                <Text style={[styles.joinText, { color: ch.isJoined ? '#10B981' : c.primary }]}>{ch.isJoined ? '✓ Joined' : 'Join'}</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── MAIN SCREEN ───
export function SocialHomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const c = isDark ? C.dark : C.light;
    const fade = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState('Feed');

    useEffect(() => {
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

                {/* ─── HEADER ─── */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <View>
                        <Text style={[styles.headerSub, { color: c.muted }]}>FITNESS COMMUNITY</Text>
                        <Text style={[styles.headerTitle, { color: c.text, fontFamily: FNT.display }]}>Community</Text>
                    </View>
                    <View style={styles.headerBtns}>
                        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: c.card, borderColor: c.border }]} onPress={() => navigation.navigate('SearchUsers')}>
                            <Ionicons name="search-outline" size={20} color={c.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.headerBtn, { backgroundColor: c.primary }]} onPress={() => navigation.navigate('CreatePost')}>
                            <Ionicons name="add" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ─── TAB NAV (pill style) ─── */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tabPill,
                                    { backgroundColor: isActive ? c.primary : c.card, borderColor: isActive ? c.primary : c.border },
                                ]}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.tabLabel, { color: isActive ? '#FFF' : c.muted }]}>{tab}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Animated.View style={{ opacity: fade }}>

                {/* ─── FEED ─── */}
                {activeTab === 'Feed' && (
                    <View style={styles.px}>
                        {SOCIAL_POSTS.map(post => (
                            <PostCard key={post.id} post={post} onLike={() => {}} c={c} />
                        ))}
                    </View>
                )}

                {/* ─── LEADERBOARD ─── */}
                {activeTab === 'Leaderboard' && (
                    <View style={styles.px}>
                        <SectionHeader title="This Week" onViewAll={() => navigation.navigate('Leaderboard')} c={c} />
                        {/* Top 3 podium */}
                        <View style={styles.podium}>
                            {[SOCIAL_LEADERBOARD[1], SOCIAL_LEADERBOARD[0], SOCIAL_LEADERBOARD[2]].map((e, i) => {
                                const height = i === 1 ? 90 : i === 0 ? 70 : 55;
                                const medalColors: Record<number, string> = { 0: '#9CA3AF', 1: '#F59E0B', 2: '#CD7C2F' };
                                const ranks = [2, 1, 3];
                                return (
                                    <View key={e.rank} style={styles.podiumItem}>
                                        <Image source={{ uri: e.avatar }} style={[styles.podiumAvatar, e.isMe && { borderColor: c.primary, borderWidth: 2 }]} />
                                        <Text style={[styles.podiumName, { color: c.text }]}>{e.username.slice(0, 8)}</Text>
                                        <View style={[styles.podiumPlatform, { height, backgroundColor: medalColors[i] }]}>
                                            <Text style={styles.podiumRank}>#{ranks[i]}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        {/* Full list */}
                        {SOCIAL_LEADERBOARD.slice(3).map(e => (
                            <LeaderboardRow key={e.rank} entry={e} c={c} />
                        ))}
                        <TouchableOpacity
                            style={[styles.viewFullLb, { backgroundColor: c.card, borderColor: c.border }]}
                            onPress={() => navigation.navigate('Leaderboard')}
                        >
                            <Text style={[styles.viewFullLbText, { color: c.primary }]}>View Full Leaderboard</Text>
                            <Ionicons name="arrow-forward" size={16} color={c.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ─── CHALLENGES ─── */}
                {activeTab === 'Challenges' && (
                    <View style={styles.px}>
                        <SectionHeader title="Active Challenges" onViewAll={() => navigation.navigate('ChallengesList')} c={c} />
                        {SOCIAL_CHALLENGES.map(ch => (
                            <ChallengeCard key={ch.id} ch={ch} c={c} />
                        ))}
                    </View>
                )}

                {/* ─── FRIENDS ─── */}
                {activeTab === 'Friends' && (
                    <View style={styles.px}>
                        <SectionHeader title="Friends" onViewAll={() => navigation.navigate('SearchUsers')} c={c} />
                        {SOCIAL_FRIENDS.map(f => (
                            <TouchableOpacity key={f.id} style={[styles.friendRow, { backgroundColor: c.card, borderColor: c.border }]} activeOpacity={0.75}>
                                <View style={styles.friendAvatarWrap}>
                                    <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                                    <View style={[styles.friendDot, { backgroundColor: f.isActive ? '#10B981' : '#4B5563' }]} />
                                </View>
                                <View style={styles.friendInfo}>
                                    <Text style={[styles.friendName, { color: c.text }]}>{f.firstName}</Text>
                                    <Text style={[styles.friendHandle, { color: c.muted }]}>@{f.username}</Text>
                                </View>
                                <Text style={[styles.friendStatus, { color: f.isActive ? '#10B981' : c.muted }]}>
                                    {f.isActive ? 'Training' : 'Offline'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {/* Find Friends CTA */}
                        <TouchableOpacity
                            style={[styles.findFriendsBtn, { borderColor: c.primary }]}
                            onPress={() => navigation.navigate('SearchUsers')}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="person-add-outline" size={18} color={c.primary} />
                            <Text style={[styles.findFriendsText, { color: c.primary }]}>Find More Friends</Text>
                        </TouchableOpacity>
                    </View>
                )}

                </Animated.View>
            </ScrollView>
        </View>
    );
}

// ─── STYLES ───
const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 32 },
    headerBtns: { flexDirection: 'row', gap: 10 },
    headerBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

    // Tab pills
    tabScroll: { gap: 10, paddingHorizontal: 20, paddingRight: 28, marginBottom: 24 },
    tabPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
    tabLabel: { fontSize: 14, fontWeight: '700' },

    // Section header
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    viewAll: { fontSize: 13, fontWeight: '600' },

    // Post card
    postCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16, gap: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    postAvatar: { width: 42, height: 42, borderRadius: 21 },
    postUserInfo: { flex: 1 },
    postUsername: { fontSize: 15, fontWeight: '700' },
    postHandle: { fontSize: 12 },
    postContent: { fontSize: 15, lineHeight: 22 },
    workoutChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14 },
    workoutChipName: { fontSize: 13, fontWeight: '700' },
    workoutChipMeta: { fontSize: 12 },
    postImage: { width: '100%', height: 200, borderRadius: 14 },
    postActions: { flexDirection: 'row', gap: 20, paddingTop: 4 },
    postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    postActionCount: { fontSize: 14 },

    // Leaderboard
    podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20 },
    podiumItem: { flex: 1, alignItems: 'center', gap: 8 },
    podiumAvatar: { width: 50, height: 50, borderRadius: 25 },
    podiumName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
    podiumPlatform: { width: '100%', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    podiumRank: { fontSize: 15, fontWeight: '800', color: '#FFF' },
    lbRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
    lbRank: { fontSize: 16, fontWeight: '800', width: 36, textAlign: 'center' },
    lbAvatar: { width: 42, height: 42, borderRadius: 21 },
    lbInfo: { flex: 1 },
    lbUsername: { fontSize: 15, fontWeight: '700' },
    lbVolume: { fontSize: 13 },
    lbChange: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    lbChangeText: { fontSize: 13, fontWeight: '800' },
    viewFullLb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
    viewFullLbText: { fontSize: 14, fontWeight: '700' },

    // Challenges
    challengeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12, gap: 14 },
    challengeIcon: { fontSize: 28 },
    challengeInfo: { flex: 1, gap: 4 },
    challengeName: { fontSize: 15, fontWeight: '700' },
    challengeMeta: { fontSize: 12 },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    joinText: { fontSize: 13, fontWeight: '700' },

    // Friends
    friendRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
    friendAvatarWrap: { position: 'relative' },
    friendAvatar: { width: 46, height: 46, borderRadius: 23 },
    friendDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, right: 0, bottom: 0, borderWidth: 2, borderColor: '#0A0E1A' },
    friendInfo: { flex: 1 },
    friendName: { fontSize: 15, fontWeight: '700' },
    friendHandle: { fontSize: 12 },
    friendStatus: { fontSize: 13, fontWeight: '600' },
    findFriendsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
    findFriendsText: { fontSize: 14, fontWeight: '700' },
});
