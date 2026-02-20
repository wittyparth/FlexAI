import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import { useUserProfile, useFollowUser, useUnfollowUser } from '../../hooks/queries/useSocialQueries';
import { useUserPosts } from '../../hooks/queries/useFeedQueries';
import { useAuthStore } from '../../store/authStore';

const MOCK_ACHIEVEMENTS = [
    { id: 1, icon: 'trophy', color: '#F59E0B', name: 'First PR' },
    { id: 2, icon: 'fire', color: '#EF4444', name: '30 Day Streak' },
    { id: 3, icon: 'medal', color: '#8B5CF6', name: 'Top 10%' },
];

const { width } = Dimensions.get('window');

export function UserProfileScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'posts' | 'workouts' | 'achievements'>('posts');

    // Get current user from auth store
    const userAuth = useAuthStore(state => state.user);

    // Determine target user ID
    // If route params has userId, use it. Otherwise use current user's ID
    const paramUserId = route.params?.userId;
    const authUserId = userAuth?.id;
    const userId = (paramUserId || authUserId)?.toString();

    const isOwnProfile = !paramUserId || paramUserId === authUserId;

    // Fetch user profile
    const { data: userProfile, isLoading: isProfileLoading } = useUserProfile(userId);

    // Fetch user posts
    const {
        data: postsData,
        isLoading: isPostsLoading,
        fetchNextPage,
        hasNextPage
    } = useUserPosts(userId);

    // Mutations
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const handleFollow = () => {
        if (!userProfile) return;

        if (userProfile.isFollowing) {
            unfollowMutation.mutate(userId);
        } else {
            followMutation.mutate(userId);
        }
    };

    const formatNumber = (num: number) => {
        if (!num) return '0';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const posts = postsData?.pages.flatMap(page => page.posts) || [];
    const isLoading = isProfileLoading || (isPostsLoading && !posts.length);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (!userProfile && !isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.foreground }}>User not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerUsername, { color: colors.foreground }]}>@{userProfile?.username || 'user'}</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
                    {/* Avatar & Level */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <View
                                style={styles.avatarRing}
                            >
                                <View style={[styles.avatarInner, { backgroundColor: colors.card }]}>
                                    <Image
                                        source={{ uri: userProfile?.avatarUrl || 'https://i.pravatar.cc/150' }}
                                        style={styles.avatar}
                                    />
                                </View>
                            </View>
                            <View style={[styles.levelBadge, { backgroundColor: colors.primary.main }]}>
                                <Text style={styles.levelText}>Lv.{userProfile?.level || 1}</Text>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(userProfile?.workoutsCount || 0)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Workouts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => navigation.navigate('FollowersList', { userId: userProfile?.id })}
                            >
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(userProfile?.followersCount || 0)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => navigation.navigate('FollowingList', { userId: userProfile?.id })}
                            >
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(userProfile?.followingCount || 0)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Following</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Name & Bio */}
                    <View style={styles.infoSection}>
                        <View style={styles.nameRow}>
                            <Text style={[styles.name, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                                {userProfile?.firstName} {userProfile?.lastName}
                            </Text>
                            <View style={[styles.tierBadge, { backgroundColor: `${colors.stats.pr}15` }]}>
                                <MaterialCommunityIcons name="star" size={14} color={colors.stats.pr} />
                                <Text style={[styles.tierText, { color: colors.stats.pr }]}>Gold</Text>
                            </View>
                        </View>
                        {userProfile?.bio && (
                            <Text style={[styles.bio, { color: colors.mutedForeground }]}>{userProfile.bio}</Text>
                        )}

                        {/* XP Progress */}
                        <View style={styles.xpSection}>
                            <View style={styles.xpHeader}>
                                <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP Progress</Text>
                                <Text style={[styles.xpValue, { color: colors.primary.main }]}>{formatNumber(userProfile?.xp || 0)} XP</Text>
                            </View>
                            <View style={[styles.xpBarBg, { backgroundColor: colors.muted }]}>
                                <View
                                    style={[styles.xpBarFill, { width: '65%' }]}
                                />
                            </View>
                        </View>

                        {/* Achievements Preview */}
                        <View style={styles.achievementsRow}>
                            {MOCK_ACHIEVEMENTS.map((achievement) => (
                                <View key={achievement.id} style={[styles.achievementBadge, { backgroundColor: `${achievement.color}15` }]}>
                                    <MaterialCommunityIcons name={achievement.icon as any} size={18} color={achievement.color} />
                                </View>
                            ))}
                            <View style={[styles.achievementMore, { backgroundColor: colors.muted }]}>
                                <Text style={[styles.achievementMoreText, { color: colors.mutedForeground }]}>+5</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        {isOwnProfile ? (
                            <TouchableOpacity
                                style={styles.followButton}
                                onPress={() => navigation.navigate('SettingsStack', { screen: 'EditProfile' })}
                            >
                                <View style={[styles.followButtonGradient, { backgroundColor: colors.muted }]}>
                                    <Text style={[styles.followButtonText, { color: colors.foreground }]}>
                                        Edit Profile
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.followButton}
                                onPress={handleFollow}
                                disabled={followMutation.isPending || unfollowMutation.isPending}
                            >
                                <View
                                    style={styles.followButtonGradient}
                                >
                                    {followMutation.isPending || unfollowMutation.isPending ? (
                                        <ActivityIndicator size="small" color={userProfile?.isFollowing ? colors.foreground : '#FFF'} />
                                    ) : (
                                        <Text style={[styles.followButtonText, userProfile?.isFollowing && { color: colors.foreground }]}>
                                            {userProfile?.isFollowing ? 'Following' : 'Follow'}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}

                        {!isOwnProfile && (
                            <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.muted }]}>
                                <Ionicons name="chatbubble-outline" size={20} color={colors.foreground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    {(['posts', 'workouts', 'achievements'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tab}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Ionicons
                                name={tab === 'posts' ? 'grid-outline' : tab === 'workouts' ? 'barbell-outline' : 'trophy-outline'}
                                size={22}
                                color={activeTab === tab ? colors.primary.main : colors.mutedForeground}
                            />
                            {activeTab === tab && (
                                <View style={[styles.tabIndicator, { backgroundColor: colors.primary.main }]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Posts Grid */}
                {activeTab === 'posts' && (
                    <View style={styles.postsGrid}>
                        {posts.map((post) => (
                            <TouchableOpacity
                                key={post.id}
                                style={[styles.postThumbnail, { backgroundColor: colors.muted }]}
                                onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                            >
                                <Image
                                    source={{ uri: post.imageUrl || 'https://via.placeholder.com/300' }}
                                    style={styles.postImage}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Empty State for other tabs */}
                {(activeTab !== 'posts' || posts.length === 0) && activeTab === 'posts' && (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                            <Ionicons name="images-outline" size={40} color={colors.mutedForeground} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            {isOwnProfile ? 'Create your first post to see it here' : 'This user hasn\'t posted anything yet'}
                        </Text>
                    </View>
                )}

                {activeTab !== 'posts' && (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                            <Ionicons
                                name={activeTab === 'workouts' ? 'barbell-outline' : 'trophy-outline'}
                                size={40}
                                color={colors.mutedForeground}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            No {activeTab} yet
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            {activeTab === 'workouts'
                                ? 'Start logging workouts to see them here'
                                : 'Complete challenges to earn achievements'}
                        </Text>
                    </View>
                )}

                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerUsername: {
        fontSize: 16,
        fontWeight: '600',
    },
    moreButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileHeader: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 32,
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        padding: 3,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 43,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    levelText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
        fontFamily: fontFamilies.mono,
    },
    statsRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        fontFamily: fontFamilies.display,
    },
    statLabel: {
        fontSize: 13,
        marginTop: 2,
    },
    infoSection: {
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '700',
    },
    bio: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    xpSection: {
        marginBottom: 16,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    xpLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    xpValue: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    xpBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    achievementsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    achievementBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    achievementMore: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    achievementMoreText: {
        fontSize: 13,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    followButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        overflow: 'hidden',
    },
    followButtonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    messageButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 40,
        height: 3,
        borderRadius: 2,
    },
    postsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    postThumbnail: {
        width: width / 3,
        height: width / 3,
        padding: 1,
    },
    postImage: {
        width: '100%',
        height: '100%',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: fontFamilies.display,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
