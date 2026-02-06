import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useGlobalFeed, useToggleLike } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { FeedPost } from '../../api/feed.api';

const { width } = Dimensions.get('window');

// ============================================================
// HELPERS
// ============================================================
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
};

export function SocialHomeScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Fetch feed from backend
    const {
        data: feedData,
        isLoading,
        isError,
        refetch,
        isFetching,
        fetchNextPage,
        hasNextPage,
    } = useGlobalFeed();

    // Like mutation
    const toggleLikeMutation = useToggleLike();

    // Flatten paginated data
    const posts = useMemo(() => {
        if (!feedData?.pages) return [];
        return feedData.pages.flatMap(page => page.posts);
    }, [feedData]);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleToggleLike = useCallback((postId: string) => {
        toggleLikeMutation.mutate(postId);
    }, [toggleLikeMutation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    Community
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('Activity')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
                        <View style={[styles.notificationDot, { backgroundColor: colors.error }]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('SearchUsers')}
                    >
                        <Ionicons name="search-outline" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 20;
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                        if (hasNextPage && !isFetching) {
                            fetchNextPage();
                        }
                    }
                }}
                scrollEventThrottle={400}
            >

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Leaderboard')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${colors.stats.pr}15` }]}>
                            <MaterialCommunityIcons name="trophy-outline" size={22} color={colors.stats.pr} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.foreground }]}>Leaderboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('ChallengesList')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}15` }]}>
                            <MaterialCommunityIcons name="flag-checkered" size={22} color={colors.success} />
                        </View>
                        <Text style={[styles.quickActionText, { color: colors.foreground }]}>Challenges</Text>
                    </TouchableOpacity>
                </View>

                {/* Feed */}
                <View style={styles.feed}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary.main} />
                            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                                Loading feed...
                            </Text>
                        </View>
                    ) : posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="newspaper-outline" size={48} color={colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                No posts yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                                Be the first to share your workout!
                            </Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                            >
                                {/* Post Header */}
                                <View style={styles.postHeader}>
                                    <TouchableOpacity
                                        style={styles.postUserInfo}
                                        onPress={() => navigation.navigate('UserProfile', { userId: post.user.id })}
                                    >
                                        <Image source={{ uri: post.user.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.postAvatar} />
                                        <View>
                                            <View style={styles.usernameRow}>
                                                <Text style={[styles.postUsername, { color: colors.foreground }]}>
                                                    @{post.user.username || `${post.user.firstName.toLowerCase()}`}
                                                </Text>
                                            </View>
                                            <Text style={[styles.postTime, { color: colors.mutedForeground }]}>
                                                {formatTimeAgo(post.createdAt)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.moreButton}>
                                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>

                                {/* Post Content */}
                                <Text style={[styles.postCaption, { color: colors.foreground }]}>
                                    {post.content}
                                </Text>

                                {/* Workout Card (if attached) */}
                                {post.workout && (
                                    <View style={[styles.workoutCard, { borderColor: colors.primary.main }]}>
                                        <LinearGradient
                                            colors={[`${colors.primary.main}08`, `${colors.primary.main}02`]}
                                            style={styles.workoutCardGradient}
                                        >
                                            <View style={styles.workoutHeader}>
                                                <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                                                <Text style={[styles.workoutName, { color: colors.foreground }]}>
                                                    {post.workout.name}
                                                </Text>
                                            </View>
                                            <View style={styles.workoutStats}>
                                                {post.workout.exerciseCount && (
                                                    <>
                                                        <Text style={[styles.workoutStat, { color: colors.mutedForeground }]}>
                                                            {post.workout.exerciseCount} exercises
                                                        </Text>
                                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                                    </>
                                                )}
                                                {post.workout.duration && (
                                                    <>
                                                        <Text style={[styles.workoutStat, { color: colors.mutedForeground }]}>
                                                            {Math.round(post.workout.duration / 60)}m
                                                        </Text>
                                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                                    </>
                                                )}
                                                {post.workout.totalVolume && (
                                                    <Text style={[styles.workoutStat, { color: colors.primary.main, fontWeight: '700' }]}>
                                                        {post.workout.totalVolume.toLocaleString()} lbs
                                                    </Text>
                                                )}
                                            </View>
                                        </LinearGradient>
                                    </View>
                                )}

                                {/* Image (if attached) */}
                                {post.imageUrl && (
                                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                                )}

                                {/* Post Actions */}
                                <View style={styles.postActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleToggleLike(post.id)}
                                    >
                                        <Ionicons
                                            name={post.isLiked ? "heart" : "heart-outline"}
                                            size={24}
                                            color={post.isLiked ? colors.error : colors.mutedForeground}
                                        />
                                        <Text style={[
                                            styles.actionCount,
                                            { color: post.isLiked ? colors.error : colors.mutedForeground }
                                        ]}>
                                            {post.likesCount}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="chatbubble-outline" size={22} color={colors.mutedForeground} />
                                        <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
                                            {post.commentsCount}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="share-outline" size={24} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]}>
                                        <Ionicons name="bookmark-outline" size={22} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Create Post FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <LinearGradient
                    colors={colors.primary.gradient as [string, string]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    storiesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    storyItem: {
        alignItems: 'center',
        width: 72,
    },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        padding: 3,
    },
    storyRingInactive: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    storyAvatarContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 31,
        padding: 2,
    },
    storyAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    addStoryBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    storyName: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionText: {
        fontSize: 15,
        fontWeight: '600',
    },
    feed: {
        paddingHorizontal: 16,
        gap: 16,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 15,
        marginTop: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
    },
    postCard: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    postUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    postAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    postUsername: {
        fontSize: 15,
        fontWeight: '700',
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    postTime: {
        fontSize: 13,
        marginTop: 2,
    },
    moreButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postCaption: {
        fontSize: 15,
        lineHeight: 22,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    workoutCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    workoutCardGradient: {
        padding: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    workoutName: {
        fontSize: 16,
        fontWeight: '700',
    },
    workoutStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workoutStat: {
        fontSize: 13,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 8,
    },
    postImage: {
        width: '100%',
        height: 240,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
    },
    actionCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: themeColors.primary.main,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
    },
    fabGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
