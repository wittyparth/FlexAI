import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, useChallenges, useFollowing, useRankings } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useMyFeed, useGlobalFeed, useToggleLike } from '../../hooks/queries/useFeedQueries';
import { useAuthStore } from '../../store/authStore';
import type { FeedPost } from '../../api/feed.api';
import type { ThemeColors } from '../../hooks/useColors';
import { Card, Avatar, IconButton } from '../../components/ui';

const TABS: Array<'Feed' | 'Leaderboard' | 'Challenges' | 'Friends'> = ['Feed', 'Leaderboard', 'Challenges', 'Friends'];

const fmtTime = (iso: string) => {
    const createdAt = new Date(iso).getTime();
    const minutes = Math.floor((Date.now() - createdAt) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const fmtNum = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`);

const fmtMinutes = (minutes?: number) => (minutes && minutes > 0 ? `${minutes}m` : '0m');

function SectionHeader({
    title,
    action,
    colors,
}: {
    title: string;
    action?: { label: string; onPress: () => void };
    colors: ThemeColors;
}) {
    return (
        <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>{title}</Text>
            {action ? (
                <TouchableOpacity onPress={action.onPress}>
                    <Text style={[styles.viewAll, { color: colors.primary.main }]}>{action.label}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

function PostCard({
    post,
    onLike,
    onOpen,
    colors,
}: {
    post: FeedPost;
    onLike: () => void;
    onOpen: () => void;
    colors: ThemeColors;
}) {
    return (
        <Card
            variant="elevated"
            onPress={onOpen}
            style={styles.postCard}
        >
            <View style={styles.postHeader}>
                <Avatar
                    uri={post.user.avatarUrl || undefined}
                    initials={`${post.user.firstName?.[0] ?? ''}${post.user.lastName?.[0] ?? ''}`}
                    size="sm"
                />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.postUsername, { color: colors.foreground }]}>
                        {post.user.firstName} {post.user.lastName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                        @{post.user.username} - {fmtTime(post.createdAt)}
                    </Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.mutedForeground} />
            </View>

            <Text style={[styles.postContent, { color: colors.foreground }]}>{post.content}</Text>

            {post.workout ? (
                <View style={[styles.workoutChip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="barbell-outline" size={16} color={colors.primary.main} />
                    <Text style={[styles.chipName, { color: colors.foreground }]}>{post.workout.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                        {post.workout.exerciseCount ?? 0} ex - {fmtNum(post.workout.totalVolume ?? 0)} volume - {fmtMinutes(post.workout.duration)}
                    </Text>
                </View>
            ) : null}

            {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.postImage} contentFit="cover" /> : null}

            <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={onLike}>
                    <Ionicons
                        name={post.isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={post.isLiked ? colors.destructive : colors.mutedForeground}
                    />
                    <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{post.likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.postAction} onPress={onOpen}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{post.commentsCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-outline" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
            </View>
        </Card>
    );
}

function LeaderboardRow({ entry, colors }: { entry: any; colors: ThemeColors }) {
    return (
        <View style={[styles.lbRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.lbRank, { color: colors.mutedForeground, fontFamily: fontFamilies.mono }]}>#{entry.rank}</Text>
            <Avatar
                uri={entry.user?.avatarUrl || undefined}
                initials={entry.user?.username?.slice(0, 2)?.toUpperCase() || '?'}
                size="sm"
            />
            <View style={{ flex: 1 }}>
                <Text style={[styles.lbUsername, { color: colors.foreground }]}>
                    @{entry.user?.username || `user${entry.user?.id ?? '0'}`}
                </Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: fontFamilies.mono }}>
                    {fmtNum(entry.score)} XP
                </Text>
            </View>
        </View>
    );
}

function ChallengeCard({ challenge, colors, onPress }: { challenge: any; colors: ThemeColors; onPress: () => void }) {
    const endAt = new Date(challenge.endDate).getTime();
    const daysLeft = Math.max(0, Math.ceil((endAt - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
        >
            <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.challengeName, { color: colors.foreground }]}>{challenge.name}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {fmtNum(challenge.participantsCount ?? 0)} participants - {daysLeft}d left
                </Text>
            </View>
            <View style={[styles.joinBtn, { backgroundColor: `${colors.primary.main}20`, borderColor: colors.primary.main }]}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary.main }}>View</Text>
            </View>
        </TouchableOpacity>
    );
}

export function SocialHomeScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const authUserId = useAuthStore((state) => state.user?.id);
    const [activeTab, setActiveTab] = useState<'Feed' | 'Leaderboard' | 'Challenges' | 'Friends'>('Feed');
    const [localLikeState, setLocalLikeState] = useState<Record<string, { isLiked: boolean; likesCount: number }>>({});

    const myFeedQuery = useMyFeed();
    const globalFeedQuery = useGlobalFeed();
    const toggleLikeMutation = useToggleLike();
    const { data: rankingsData, isLoading: rankingsLoading } = useRankings({ period: 'weekly', metric: 'xp', limit: 10 });
    const { data: challengesData, isLoading: challengesLoading } = useChallenges({ status: 'active', limit: 10 });
    const {
        data: followingData,
        isLoading: followingLoading,
    } = useFollowing(String(authUserId ?? ''), { page: 1, limit: 25 });

    const myPosts = useMemo(
        () => myFeedQuery.data?.pages.flatMap((page) => page.posts) ?? [],
        [myFeedQuery.data]
    );
    const globalPosts = useMemo(
        () => globalFeedQuery.data?.pages.flatMap((page) => page.posts) ?? [],
        [globalFeedQuery.data]
    );

    const activeFeedSource = myPosts.length > 0 ? myFeedQuery : globalFeedQuery;
    const feedPosts = myPosts.length > 0 ? myPosts : globalPosts;

    const leaderboardEntries = rankingsData?.rankings ?? [];
    const challengeEntries = challengesData?.challenges ?? [];
    const friends = followingData?.users ?? [];

    const handleToggleLike = (post: FeedPost) => {
        const current = localLikeState[post.id] ?? { isLiked: Boolean(post.isLiked), likesCount: post.likesCount };
        const next = {
            isLiked: !current.isLiked,
            likesCount: current.isLiked ? Math.max(0, current.likesCount - 1) : current.likesCount + 1,
        };

        setLocalLikeState((prev) => ({ ...prev, [post.id]: next }));

        toggleLikeMutation.mutate(post.id, {
            onError: () => {
                setLocalLikeState((prev) => ({
                    ...prev,
                    [post.id]: current,
                }));
            },
        });
    };

    const mergePostState = (post: FeedPost): FeedPost => {
        const local = localLikeState[post.id];
        if (!local) return post;
        return { ...post, isLiked: local.isLiked, likesCount: local.likesCount };
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <View>
                        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>FITNESS COMMUNITY</Text>
                        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Community</Text>
                    </View>
                    <View style={styles.headerBtns}>
                        <TouchableOpacity
                            style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('SearchUsers')}
                        >
                            <Ionicons name="search-outline" size={20} color={colors.foreground} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerBtn, { backgroundColor: colors.primary.main }]}
                            onPress={() => navigation.navigate('CreatePost')}
                        >
                            <Ionicons name="add" size={22} color={colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabPill,
                                {
                                    backgroundColor: activeTab === tab ? colors.primary.main : colors.card,
                                    borderColor: activeTab === tab ? colors.primary.main : colors.border,
                                },
                            ]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.primaryForeground : colors.mutedForeground }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {activeTab === 'Feed' ? (
                    <View style={styles.px}>
                        {activeFeedSource.isLoading ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : feedPosts.length > 0 ? (
                            <>
                                {feedPosts.map((post) => {
                                    const merged = mergePostState(post);
                                    return (
                                        <PostCard
                                            key={merged.id}
                                            post={merged}
                                            onLike={() => handleToggleLike(merged)}
                                            onOpen={() => navigation.navigate('PostDetail', { post: merged })}
                                            colors={colors}
                                        />
                                    );
                                })}
                                {activeFeedSource.hasNextPage ? (
                                    <TouchableOpacity
                                        style={[styles.loadMoreBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                                        onPress={() => activeFeedSource.fetchNextPage()}
                                        disabled={activeFeedSource.isFetchingNextPage}
                                    >
                                        {activeFeedSource.isFetchingNextPage ? (
                                            <ActivityIndicator size="small" color={colors.primary.main} />
                                        ) : (
                                            <Text style={{ color: colors.primary.main, fontWeight: '700' }}>Load more posts</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : null}
                            </>
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>No posts yet.</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {activeTab === 'Leaderboard' ? (
                    <View style={styles.px}>
                        <SectionHeader
                            title="This Week"
                            action={{ label: 'View All', onPress: () => navigation.navigate('Leaderboard') }}
                            colors={colors}
                        />
                        {rankingsLoading ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : leaderboardEntries.length > 0 ? (
                            <>
                                {leaderboardEntries.slice(0, 6).map((entry) => (
                                    <LeaderboardRow key={`${entry.userId}-${entry.rank}`} entry={entry} colors={colors} />
                                ))}
                                <TouchableOpacity
                                    style={[styles.viewFullLb, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate('Leaderboard')}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary.main }}>Open Leaderboard</Text>
                                    <Ionicons name="arrow-forward" size={16} color={colors.primary.main} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>No leaderboard data yet.</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {activeTab === 'Challenges' ? (
                    <View style={styles.px}>
                        <SectionHeader
                            title="Active Challenges"
                            action={{ label: 'View All', onPress: () => navigation.navigate('ChallengesList') }}
                            colors={colors}
                        />
                        {challengesLoading ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : challengeEntries.length > 0 ? (
                            challengeEntries.slice(0, 6).map((challenge) => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    colors={colors}
                                    onPress={() => navigation.navigate('ChallengeDetail', { challengeId: Number(challenge.id) })}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>No challenges available.</Text>
                            </View>
                        )}
                    </View>
                ) : null}

                {activeTab === 'Friends' ? (
                    <View style={styles.px}>
                        <SectionHeader
                            title="Following"
                            action={{ label: 'Search', onPress: () => navigation.navigate('SearchUsers') }}
                            colors={colors}
                        />
                        {followingLoading ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                            </View>
                        ) : friends.length > 0 ? (
                            <>
                                {friends.map((friend) => (
                                    <TouchableOpacity
                                        key={friend.id}
                                        style={[styles.friendRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        activeOpacity={0.85}
                                        onPress={() => navigation.navigate('UserProfile', { userId: Number(friend.id) })}
                                    >
                                        <Image source={{ uri: friend.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.friendAvatar} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>
                                                {friend.firstName} {friend.lastName}
                                            </Text>
                                            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>@{friend.username}</Text>
                                        </View>
                                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Lv.{friend.level ?? 1}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[styles.findFriendsBtn, { borderColor: colors.primary.main }]}
                                    onPress={() => navigation.navigate('SearchUsers')}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="person-add-outline" size={18} color={colors.primary.main} />
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary.main }}>Find More Users</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
                                    You are not following anyone yet.
                                </Text>
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    px: { paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 32 },
    headerBtns: { flexDirection: 'row', gap: 10 },
    headerBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    tabScroll: { gap: 10, paddingHorizontal: 20, paddingRight: 28, marginBottom: 24 },
    tabPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
    tabLabel: { fontSize: 14, fontWeight: '700' },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 21 },
    viewAll: { fontSize: 13, fontWeight: '600' },
    postCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16, gap: 12 },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    postAvatar: { width: 42, height: 42, borderRadius: 21 },
    postUsername: { fontSize: 15, fontWeight: '700' },
    postContent: { fontSize: 15, lineHeight: 22 },
    workoutChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14 },
    chipName: { fontSize: 13, fontWeight: '700' },
    postImage: { width: '100%', height: 200, borderRadius: 14 },
    postActions: { flexDirection: 'row', gap: 20, paddingTop: 4 },
    postAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    lbRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    lbRank: { fontSize: 16, fontWeight: '800', width: 36, textAlign: 'center' },
    lbAvatar: { width: 42, height: 42, borderRadius: 21 },
    lbUsername: { fontSize: 15, fontWeight: '700' },
    viewFullLb: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        marginTop: 4,
    },
    challengeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
        gap: 14,
    },
    challengeName: { fontSize: 15, fontWeight: '700' },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    friendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    friendAvatar: { width: 46, height: 46, borderRadius: 23 },
    findFriendsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        marginTop: 4,
    },
    loaderBox: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
    emptyBox: { paddingVertical: 28 },
    loadMoreBtn: {
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
});
