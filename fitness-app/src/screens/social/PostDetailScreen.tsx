import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors, useComments, useToggleLike, useAddComment } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import type { FeedPost } from '../../api/feed.api';
// Format time ago helper (Native implementation)
const formatTimeAgo = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 5) return 'just now';

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'y ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'mo ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm ago';

        return Math.floor(seconds) + 's ago';
    } catch (e) {
        return 'recently';
    }
};

export function PostDetailScreen({ route, navigation }: any) {
    const { post: initialPost } = route.params as { post: FeedPost };
    const colors = useColors();
    const insets = useSafeAreaInsets();


    // Local state for post to handle optimistic updates locally or from params
    const [post, setPost] = useState<FeedPost>(initialPost);

    const [newComment, setNewComment] = useState('');

    // Queries & Mutations
    const { data: comments, isLoading: isLoadingComments } = useComments(post.id);
    const { mutate: toggleLike } = useToggleLike();
    const { mutate: addComment, isPending: isPostingComment } = useAddComment();

    // Handle Like
    const handleToggleLike = () => {
        // Optimistic update locally
        setPost(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likesCount: (prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1),
        }));

        toggleLike(post.id, {
            onError: () => {
                // Revert if error
                setPost(prev => ({
                    ...prev,
                    isLiked: !prev.isLiked,
                    likesCount: (prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1),
                }));
            }
        });
    };

    // Handle Submit Comment
    const handleSubmitComment = () => {
        if (!newComment.trim()) return;

        addComment({ postId: post.id, content: newComment }, {
            onSuccess: () => {
                setNewComment('');
                // Increment comment count locally
                setPost(prev => ({
                    ...prev,
                    commentsCount: prev.commentsCount + 1
                }));
            },
            onError: (error) => {
                Alert.alert('Error', 'Failed to post comment. Please try again.');
            }
        });
    };

    const getAvatarUrl = (url?: string) => {
        return url && url.startsWith('http')
            ? { uri: url }
            : { uri: 'https://i.pravatar.cc/150?u=default' }; // Fallback
    };

    // Helper to get formatted volume
    const getFormattedVolume = (vol?: number) => {
        return vol ? `${vol.toLocaleString()} lbs` : '-';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Post</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Post Content */}
                    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {/* User Info */}
                        <TouchableOpacity
                            style={styles.userInfo}
                            onPress={() => navigation.navigate('UserProfile', { userId: post.userId })}
                        >
                            <Image source={getAvatarUrl(post.user.avatarUrl)} style={styles.avatar} />
                            <View style={styles.userMeta}>
                                <View style={styles.usernameRow}>
                                    <Text style={[styles.username, { color: colors.foreground }]}>
                                        {post.user.username || post.user.firstName}
                                    </Text>
                                    {/* Level badge removed as it's not in FeedPost type yet */}
                                </View>
                                <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>{formatTimeAgo(post.createdAt)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Caption (Content) */}
                        <Text style={[styles.caption, { color: colors.foreground }]}>{post.content}</Text>

                        {/* Workout Card */}
                        {post.workout && (
                            <View style={[styles.workoutCard, { borderColor: colors.primary.main }]}>
                                <LinearGradient
                                    colors={[`${colors.primary.main}08`, `${colors.primary.main}02`]}
                                    style={styles.workoutGradient}
                                >
                                    <View style={styles.workoutHeader}>
                                        <MaterialCommunityIcons name="dumbbell" size={22} color={colors.primary.main} />
                                        <Text style={[styles.workoutName, { color: colors.foreground }]}>
                                            {post.workout.name}
                                        </Text>
                                    </View>
                                    <View style={styles.workoutStats}>
                                        <View style={styles.workoutStat}>
                                            <Text style={[styles.statValue, { color: colors.foreground }]}>{post.workout.exerciseCount || 0}</Text>
                                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>exercises</Text>
                                        </View>
                                        <View style={styles.workoutStat}>
                                            <Text style={[styles.statValue, { color: colors.foreground }]}>{post.workout.duration || 0}m</Text>
                                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>duration</Text>
                                        </View>
                                        <View style={styles.workoutStat}>
                                            <Text style={[styles.statValue, { color: colors.primary.main }]}>{getFormattedVolume(post.workout.totalVolume)}</Text>
                                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>volume</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={[styles.actions, { borderTopColor: colors.border }]}>
                            <TouchableOpacity style={styles.actionBtn} onPress={handleToggleLike}>
                                <Ionicons
                                    name={post.isLiked ? "heart" : "heart-outline"}
                                    size={26}
                                    color={post.isLiked ? colors.error : colors.mutedForeground}
                                />
                                <Text style={[styles.actionCount, { color: post.isLiked ? colors.error : colors.mutedForeground }]}>
                                    {post.likesCount}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Ionicons name="chatbubble-outline" size={24} color={colors.mutedForeground} />
                                <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.commentsCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Ionicons name="share-outline" size={26} color={colors.mutedForeground} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                                <Ionicons name="bookmark-outline" size={24} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <Text style={[styles.commentsTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                            Comments ({comments?.length || 0})
                        </Text>

                        {isLoadingComments ? (
                            <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                            comments?.map((comment) => (
                                <View key={comment.id} style={[styles.commentItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Image source={getAvatarUrl(comment.user.avatarUrl)} style={styles.commentAvatar} />
                                    <View style={styles.commentContent}>
                                        <View style={styles.commentHeader}>
                                            <Text style={[styles.commentUsername, { color: colors.foreground }]}>
                                                @{comment.user.username || comment.user.firstName}
                                            </Text>
                                            <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
                                                {formatTimeAgo(comment.createdAt)}
                                            </Text>
                                        </View>
                                        <Text style={[styles.commentText, { color: colors.foreground }]}>{comment.content}</Text>
                                        <View style={styles.commentActions}>
                                            {/* Likes on comments not yet supported by API */}
                                            {/* 
                                            <TouchableOpacity style={styles.commentAction}>
                                                <Ionicons name="heart-outline" size={16} color={colors.mutedForeground} />
                                                <Text style={[styles.commentActionText, { color: colors.mutedForeground }]}>
                                                    0
                                                </Text>
                                            </TouchableOpacity>
                                            */}
                                            <TouchableOpacity style={styles.commentAction}>
                                                <Text style={[styles.commentActionText, { color: colors.primary.main }]}>Reply</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                        {!isLoadingComments && (!comments || comments.length === 0) && (
                            <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 20 }}>
                                No comments yet. Be the first to say something!
                            </Text>
                        )}
                    </View>
                </ScrollView>

                {/* Comment Input */}
                <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    {/* Assuming current user avatar is not readily available in global state here easily without prop drilling, using default or placeholder */}
                    <View style={[styles.inputAvatar, { backgroundColor: colors.muted, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={20} color={colors.mutedForeground} />
                    </View>

                    <TextInput
                        style={[styles.commentInput, { backgroundColor: colors.muted, color: colors.foreground }]}
                        placeholder="Add a comment..."
                        placeholderTextColor={colors.mutedForeground}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSubmitComment}
                        disabled={!newComment.trim() || isPostingComment}
                    >
                        {isPostingComment ? (
                            <ActivityIndicator size="small" color={colors.primary.main} />
                        ) : (
                            <Ionicons
                                name="send"
                                size={24}
                                color={newComment.trim() ? colors.primary.main : colors.mutedForeground}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    moreButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    postCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        marginBottom: 24,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
    },
    userMeta: {
        flex: 1,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    timeAgo: {
        fontSize: 13,
        marginTop: 2,
    },
    caption: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    workoutCard: {
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
        marginBottom: 20,
    },
    workoutGradient: {
        padding: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    workoutName: {
        fontSize: 17,
        fontWeight: '700',
    },
    workoutStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    workoutStat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        gap: 24,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
    },
    actionCount: {
        fontSize: 15,
        fontWeight: '600',
    },
    commentsSection: {
        gap: 12,
    },
    commentsTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    commentItem: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: '700',
    },
    commentTime: {
        fontSize: 12,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 12,
        gap: 12,
        borderTopWidth: 1,
    },
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    commentInput: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
    },
});
