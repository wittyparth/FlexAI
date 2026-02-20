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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useCreatePost } from '../../hooks/queries/useFeedQueries';
import { useDashboardStats } from '../../hooks/queries/useStatsQueries';

export function CreatePostScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [caption, setCaption] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState<{ id: string; name: string; volume: number; date: string; prCount: number } | null>(null);
    const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    const createPostMutation = useCreatePost();
    const { data: dashboardStats } = useDashboardStats();

    // Reverse recent workouts to show newest first if they aren't already
    const recentWorkouts = dashboardStats?.recentWorkouts ? [...dashboardStats.recentWorkouts] : [];

    const canPost = (caption.trim().length > 0 || selectedWorkout) && !createPostMutation.isPending;

    const handlePost = async () => {
        try {
            await createPostMutation.mutateAsync({
                content: caption,
                workoutId: selectedWorkout?.id,
                visibility: isPublic ? 'public' : 'followers',
            });
            navigation.goBack();
        } catch (error) {
            console.error('Failed to create post:', error);
            // Optionally add toast/alert here
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
                    <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    New Post
                </Text>
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={!canPost}
                    style={[styles.postButton, !canPost && { opacity: 0.5 }]}
                >
                    <View
                        style={styles.postButtonGradient}
                    >
                        {createPostMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.postButtonText}>Post</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* User Row */}
                    <View style={styles.userRow}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150?img=1' }} // TODO: Use real user avatar
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={[styles.username, { color: colors.foreground }]}>@your_username</Text>
                            <TouchableOpacity
                                style={[styles.privacyToggle, { backgroundColor: colors.muted }]}
                                onPress={() => setIsPublic(!isPublic)}
                            >
                                <Ionicons
                                    name={isPublic ? "globe-outline" : "people-outline"}
                                    size={14}
                                    color={colors.primary.main}
                                />
                                <Text style={[styles.privacyText, { color: colors.primary.main }]}>
                                    {isPublic ? 'Public' : 'Followers'}
                                </Text>
                                <Ionicons name="chevron-down" size={14} color={colors.primary.main} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Caption Input */}
                    <TextInput
                        style={[styles.captionInput, { color: colors.foreground }]}
                        placeholder="Share your progress, thoughts, or achievements..."
                        placeholderTextColor={colors.mutedForeground}
                        value={caption}
                        onChangeText={setCaption}
                        multiline
                        textAlignVertical="top"
                    />

                    {/* Selected Workout */}
                    {selectedWorkout && (
                        <View style={[styles.selectedWorkout, { borderColor: colors.primary.main }]}>
                            <View08`, `${colors.primary.main}02`]}
                                style={styles.workoutGradient}
                            >
                                <View style={styles.workoutHeader}>
                                    <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                                    <Text style={[styles.workoutName, { color: colors.foreground }]}>
                                        {selectedWorkout.name}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setSelectedWorkout(null)}
                                        style={styles.removeWorkout}
                                    >
                                        <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.workoutMeta}>
                                    <Text style={[styles.workoutDetail, { color: colors.mutedForeground }]}>
                                        {formatDate(selectedWorkout.date)}
                                    </Text>
                                    <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.workoutDetail, { color: colors.mutedForeground }]}>
                                        {selectedWorkout.prCount} PRs
                                    </Text>
                                    <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                    <Text style={[styles.workoutDetail, { color: colors.primary.main, fontWeight: '700' }]}>
                                        {selectedWorkout.volume.toLocaleString()} lbs
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Attach Options */}
                    <View style={styles.attachSection}>
                        <Text style={[styles.attachTitle, { color: colors.mutedForeground }]}>ATTACH</Text>
                        <View style={styles.attachOptions}>
                            <TouchableOpacity
                                style={[styles.attachButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => setShowWorkoutPicker(!showWorkoutPicker)}
                            >
                                <View style={[styles.attachIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                    <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                                </View>
                                <Text style={[styles.attachText, { color: colors.foreground }]}>Workout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.attachButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.attachIcon, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="image-outline" size={20} color={colors.success} />
                                </View>
                                <Text style={[styles.attachText, { color: colors.foreground }]}>Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.attachButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.attachIcon, { backgroundColor: `${colors.stats.pr}15` }]}>
                                    <Ionicons name="trophy-outline" size={20} color={colors.stats.pr} />
                                </View>
                                <Text style={[styles.attachText, { color: colors.foreground }]}>PR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Workout Picker */}
                    {showWorkoutPicker && (
                        <View style={styles.workoutPicker}>
                            <Text style={[styles.pickerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                                Recent Workouts
                            </Text>
                            {recentWorkouts.length > 0 ? (
                                recentWorkouts.map((workout) => (
                                    <TouchableOpacity
                                        key={workout.id}
                                        style={[
                                            styles.workoutOption,
                                            { backgroundColor: colors.card, borderColor: colors.border },
                                            selectedWorkout?.id === workout.id && { borderColor: colors.primary.main, borderWidth: 2 }
                                        ]}
                                        onPress={() => {
                                            setSelectedWorkout(workout);
                                            setShowWorkoutPicker(false);
                                        }}
                                    >
                                        <View style={[styles.workoutIcon, { backgroundColor: colors.muted }]}>
                                            <MaterialCommunityIcons name="dumbbell" size={18} color={colors.primary.main} />
                                        </View>
                                        <View style={styles.workoutOptionInfo}>
                                            <Text style={[styles.workoutOptionName, { color: colors.foreground }]}>
                                                {workout.name}
                                            </Text>
                                            <Text style={[styles.workoutOptionMeta, { color: colors.mutedForeground }]}>
                                                {formatDate(workout.date)} · {workout.prCount} PRs · {workout.volume.toLocaleString()} lbs
                                            </Text>
                                        </View>
                                        {selectedWorkout?.id === workout.id && (
                                            <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 10 }}>
                                    No recent workouts found.
                                </Text>
                            )}
                        </View>
                    )}
                </ScrollView>
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
    cancelButton: {
        minWidth: 60,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    postButton: {
        minWidth: 60,
    },
    postButtonGradient: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    postButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    privacyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    privacyText: {
        fontSize: 13,
        fontWeight: '600',
    },
    captionInput: {
        fontSize: 17,
        lineHeight: 24,
        minHeight: 120,
        marginBottom: 24,
    },
    selectedWorkout: {
        borderRadius: 16,
        borderWidth: 1.5,
        overflow: 'hidden',
        marginBottom: 24,
    },
    workoutGradient: {
        padding: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    workoutName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    removeWorkout: {
        padding: 4,
    },
    workoutMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workoutDetail: {
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 10,
    },
    attachSection: {
        marginBottom: 24,
    },
    attachTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
        fontFamily: fontFamilies.mono,
    },
    attachOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    attachButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
    },
    attachIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachText: {
        fontSize: 13,
        fontWeight: '600',
    },
    workoutPicker: {
        gap: 12,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    workoutOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    workoutIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    workoutOptionInfo: {
        flex: 1,
    },
    workoutOptionName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    workoutOptionMeta: {
        fontSize: 13,
    },
});
