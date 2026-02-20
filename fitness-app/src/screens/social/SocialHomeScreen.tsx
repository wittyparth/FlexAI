import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import {
    SOCIAL_POSTS, SOCIAL_LEADERBOARD, SOCIAL_FRIENDS, SOCIAL_CHALLENGES,
} from '../../data/mockData';
import type { ThemeColors } from '../../hooks/useColors';

const TABS = ['Feed', 'Leaderboard', 'Challenges', 'Friends'];
const fmtTime = (iso: string) => { const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`; };
const fmtVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();
const fmtDur = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

function SectionHeader({ title, onViewAll, colors }: { title: string; onViewAll?: () => void; colors: ThemeColors }) {
    return (
        <View style={st.sectionHeaderRow}>
            <Text style={[st.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>{title}</Text>
            {onViewAll && <TouchableOpacity onPress={onViewAll}><Text style={[st.viewAll, { color: colors.primary.main }]}>View All</Text></TouchableOpacity>}
        </View>
    );
}

function PostCard({ post, onLike, colors }: { post: any; onLike: () => void; colors: ThemeColors }) {
    return (
        <View style={[st.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={st.postHeader}>
                <Image source={{ uri: post.user.avatarUrl }} style={st.postAvatar} />
                <View style={{ flex: 1 }}><Text style={[st.postUsername, { color: colors.foreground }]}>{post.user.firstName}</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>@{post.user.username} • {fmtTime(post.createdAt)}</Text></View>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.mutedForeground} />
            </View>
            <Text style={[st.postContent, { color: colors.foreground }]}>{post.content}</Text>
            {post.workout && (
                <View style={[st.workoutChip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="barbell-outline" size={16} color={colors.primary.main} />
                    <Text style={[st.chipName, { color: colors.foreground }]}>{post.workout.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{post.workout.exerciseCount} ex • {fmtVol(post.workout.totalVolume)} kg{post.workout.duration > 0 ? ` • ${fmtDur(post.workout.duration)}` : ''}</Text>
                </View>
            )}
            {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={st.postImage} resizeMode="cover" />}
            <View style={st.postActions}>
                <TouchableOpacity style={st.postAction} onPress={onLike}><Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={20} color={post.isLiked ? colors.destructive : colors.mutedForeground} /><Text style={{ fontSize: 14, color: colors.mutedForeground }}>{post.likesCount}</Text></TouchableOpacity>
                <TouchableOpacity style={st.postAction}><Ionicons name="chatbubble-outline" size={20} color={colors.mutedForeground} /><Text style={{ fontSize: 14, color: colors.mutedForeground }}>{post.commentsCount}</Text></TouchableOpacity>
                <TouchableOpacity style={st.postAction}><Ionicons name="share-outline" size={20} color={colors.mutedForeground} /></TouchableOpacity>
            </View>
        </View>
    );
}

function LeaderboardRow({ entry, colors }: { entry: any; colors: ThemeColors }) {
    const rankColors: Record<number, string> = { 1: '#F59E0B', 2: '#9CA3AF', 3: '#CD7C2F' };
    const rc = rankColors[entry.rank] || colors.mutedForeground;
    return (
        <View style={[st.lbRow, { backgroundColor: entry.isMe ? `${colors.primary.main}18` : colors.card, borderColor: entry.isMe ? colors.primary.main + '44' : colors.border }]}>
            <Text style={[st.lbRank, { color: rc, fontFamily: fontFamilies.mono }]}>#{entry.rank}</Text>
            <Image source={{ uri: entry.avatar }} style={st.lbAvatar} />
            <View style={{ flex: 1 }}><Text style={[st.lbUsername, { color: colors.foreground }]}>{entry.isMe ? 'You 🎯' : entry.username}</Text><Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: fontFamilies.mono }}>{fmtVol(entry.volume)} kg</Text></View>
            <View style={[st.lbChange, { backgroundColor: entry.change.startsWith('+') ? `${colors.success}18` : entry.change === '0' ? colors.muted : `${colors.destructive}18` }]}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: entry.change.startsWith('+') ? colors.success : entry.change === '0' ? colors.mutedForeground : colors.destructive }}>{entry.change === '0' ? '—' : entry.change}</Text>
            </View>
        </View>
    );
}

function ChallengeCard({ ch, colors }: { ch: any; colors: ThemeColors }) {
    return (
        <View style={[st.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28 }}>{ch.badge}</Text>
            <View style={{ flex: 1, gap: 4 }}><Text style={[st.challengeName, { color: colors.foreground }]}>{ch.name}</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>{ch.participants.toLocaleString()} participants • {ch.daysLeft}d left</Text></View>
            <TouchableOpacity style={[st.joinBtn, { backgroundColor: ch.isJoined ? `${colors.success}20` : `${colors.primary.main}20`, borderColor: ch.isJoined ? colors.success : colors.primary.main }]} activeOpacity={0.8}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: ch.isJoined ? colors.success : colors.primary.main }}>{ch.isJoined ? '✓ Joined' : 'Join'}</Text>
            </TouchableOpacity>
        </View>
    );
}

export function SocialHomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const fade = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState('Feed');
    useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

    return (
        <View style={[st.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                <View style={[st.header, { paddingTop: insets.top + 16 }]}>
                    <View><Text style={[st.headerSub, { color: colors.mutedForeground }]}>FITNESS COMMUNITY</Text><Text style={[st.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Community</Text></View>
                    <View style={st.headerBtns}>
                        <TouchableOpacity style={[st.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('SearchUsers')}><Ionicons name="search-outline" size={20} color={colors.foreground} /></TouchableOpacity>
                        <TouchableOpacity style={[st.headerBtn, { backgroundColor: colors.primary.main }]} onPress={() => navigation.navigate('CreatePost')}><Ionicons name="add" size={22} color={colors.primaryForeground} /></TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.tabScroll}>
                    {TABS.map(tab => (
                        <TouchableOpacity key={tab} style={[st.tabPill, { backgroundColor: activeTab === tab ? colors.primary.main : colors.card, borderColor: activeTab === tab ? colors.primary.main : colors.border }]} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
                            <Text style={[st.tabLabel, { color: activeTab === tab ? colors.primaryForeground : colors.mutedForeground }]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Animated.View style={{ opacity: fade }}>
                    {activeTab === 'Feed' && <View style={st.px}>{SOCIAL_POSTS.map(p => <PostCard key={p.id} post={p} onLike={() => {}} colors={colors} />)}</View>}

                    {activeTab === 'Leaderboard' && (
                        <View style={st.px}>
                            <SectionHeader title="This Week" onViewAll={() => navigation.navigate('Leaderboard')} colors={colors} />
                            <View style={st.podium}>
                                {[SOCIAL_LEADERBOARD[1], SOCIAL_LEADERBOARD[0], SOCIAL_LEADERBOARD[2]].map((e, i) => {
                                    const h = i === 1 ? 90 : i === 0 ? 70 : 55;
                                    const mc: Record<number, string> = { 0: '#9CA3AF', 1: '#F59E0B', 2: '#CD7C2F' };
                                    return (
                                        <View key={e.rank} style={st.podiumItem}>
                                            <Image source={{ uri: e.avatar }} style={[st.podiumAvatar, e.isMe && { borderColor: colors.primary.main, borderWidth: 2 }]} />
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>{e.username.slice(0, 8)}</Text>
                                            <View style={[st.podiumPlatform, { height: h, backgroundColor: mc[i] }]}><Text style={st.podiumRank}>#{[2, 1, 3][i]}</Text></View>
                                        </View>
                                    );
                                })}
                            </View>
                            {SOCIAL_LEADERBOARD.slice(3).map(e => <LeaderboardRow key={e.rank} entry={e} colors={colors} />)}
                            <TouchableOpacity style={[st.viewFullLb, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('Leaderboard')}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary.main }}>View Full Leaderboard</Text><Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeTab === 'Challenges' && <View style={st.px}><SectionHeader title="Active Challenges" onViewAll={() => navigation.navigate('ChallengesList')} colors={colors} />{SOCIAL_CHALLENGES.map(ch => <ChallengeCard key={ch.id} ch={ch} colors={colors} />)}</View>}

                    {activeTab === 'Friends' && (
                        <View style={st.px}>
                            <SectionHeader title="Friends" onViewAll={() => navigation.navigate('SearchUsers')} colors={colors} />
                            {SOCIAL_FRIENDS.map(f => (
                                <TouchableOpacity key={f.id} style={[st.friendRow, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.75}>
                                    <View style={{ position: 'relative' }}><Image source={{ uri: f.avatar }} style={st.friendAvatar} /><View style={[st.friendDot, { backgroundColor: f.isActive ? colors.success : colors.mutedForeground, borderColor: colors.card }]} /></View>
                                    <View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>{f.firstName}</Text><Text style={{ fontSize: 12, color: colors.mutedForeground }}>@{f.username}</Text></View>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: f.isActive ? colors.success : colors.mutedForeground }}>{f.isActive ? 'Training' : 'Offline'}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={[st.findFriendsBtn, { borderColor: colors.primary.main }]} onPress={() => navigation.navigate('SearchUsers')} activeOpacity={0.85}>
                                <Ionicons name="person-add-outline" size={18} color={colors.primary.main} /><Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary.main }}>Find More Friends</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 }, px: { paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 }, headerTitle: { fontSize: 32 },
    headerBtns: { flexDirection: 'row', gap: 10 }, headerBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    tabScroll: { gap: 10, paddingHorizontal: 20, paddingRight: 28, marginBottom: 24 },
    tabPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1 }, tabLabel: { fontSize: 14, fontWeight: '700' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, sectionTitle: { fontSize: 21 }, viewAll: { fontSize: 13, fontWeight: '600' },
    postCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16, gap: 12 }, postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 }, postAvatar: { width: 42, height: 42, borderRadius: 21 },
    postUsername: { fontSize: 15, fontWeight: '700' }, postContent: { fontSize: 15, lineHeight: 22 },
    workoutChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14 }, chipName: { fontSize: 13, fontWeight: '700' },
    postImage: { width: '100%', height: 200, borderRadius: 14 }, postActions: { flexDirection: 'row', gap: 20, paddingTop: 4 }, postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20 }, podiumItem: { flex: 1, alignItems: 'center', gap: 8 },
    podiumAvatar: { width: 50, height: 50, borderRadius: 25 }, podiumPlatform: { width: '100%', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, podiumRank: { fontSize: 15, fontWeight: '800', color: '#FFF' },
    lbRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 }, lbRank: { fontSize: 16, fontWeight: '800', width: 36, textAlign: 'center' }, lbAvatar: { width: 42, height: 42, borderRadius: 21 },
    lbUsername: { fontSize: 15, fontWeight: '700' }, lbChange: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    viewFullLb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
    challengeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12, gap: 14 }, challengeName: { fontSize: 15, fontWeight: '700' },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    friendRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 }, friendAvatar: { width: 46, height: 46, borderRadius: 23 },
    friendDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, right: 0, bottom: 0, borderWidth: 2 },
    findFriendsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 4 },
});
