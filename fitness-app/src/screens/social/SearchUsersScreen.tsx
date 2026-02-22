import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useSearchUsers, useFollowUser, useUnfollowUser } from '../../hooks/queries/useSocialQueries';
import { useAuthStore } from '../../store/authStore';
import type { UserProfile } from '../../api/social.api';
import { IconButton } from '../../components/ui';

const RECENT_SEARCHES = ['strength', 'hypertrophy', 'coach'];

export function SearchUsersScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const authUserId = useAuthStore((state) => state.user?.id);
    const [search, setSearch] = useState('');
    const [recent, setRecent] = useState(RECENT_SEARCHES);

    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const { data, isLoading, isFetching, error } = useSearchUsers(search, search.trim().length >= 2);

    const users = data?.users ?? [];
    const isMutating = followMutation.isPending || unfollowMutation.isPending;

    const results = useMemo(
        () => users.filter((user) => Number(user.id) !== Number(authUserId)),
        [authUserId, users]
    );

    const formatFollowers = (n?: number) => {
        const count = Number(n ?? 0);
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return `${count}`;
    };

    const onSubmitSearch = (value: string) => {
        const normalized = value.trim();
        if (!normalized) return;
        setRecent((prev) => {
            const without = prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
            return [normalized, ...without].slice(0, 5);
        });
    };

    const handleFollowToggle = (user: UserProfile) => {
        if (user.isFollowing) {
            unfollowMutation.mutate(user.id);
            return;
        }
        followMutation.mutate(user.id);
    };

    const renderUser = ({ item }: { item: UserProfile }) => {
        const displayName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'User';
        return (
            <TouchableOpacity
                style={[styles.userItem, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('UserProfile', { userId: Number(item.id) })}
            >
                <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.username, { color: colors.foreground }]}>@{item.username || `user${item.id}`}</Text>
                        <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.level, { color: colors.primary.main }]}>Lv.{item.level || 1}</Text>
                        </View>
                    </View>
                    <Text style={[styles.name, { color: colors.mutedForeground }]}>{displayName}</Text>
                    <Text style={[styles.followers, { color: colors.mutedForeground }]}>
                        {formatFollowers(item.followersCount)} followers
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.followBtn, { backgroundColor: item.isFollowing ? colors.muted : colors.primary.main }]}
                    onPress={() => handleFollowToggle(item)}
                    disabled={isMutating}
                >
                    {isMutating ? (
                        <ActivityIndicator size="small" color={item.isFollowing ? colors.foreground : '#FFF'} />
                    ) : (
                        <Text style={[styles.followText, { color: item.isFollowing ? colors.foreground : '#FFF' }]}>
                            {item.isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <IconButton icon="arrow-back" variant="ghost" onPress={() => navigation.goBack()} />
                <View style={[styles.searchBar, { backgroundColor: colors.muted, flex: 1, marginHorizontal: 12 }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search users..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                        autoFocus
                        onSubmitEditing={(e) => onSubmitSearch(e.nativeEvent.text)}
                        returnKeyType="search"
                    />
                    {search.length > 0 ? (
                        <IconButton icon="close-circle" variant="ghost" size="sm" onPress={() => setSearch('')} />
                    ) : null}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.cancel, { color: colors.primary.main }]}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {search.trim().length < 2 ? (
                <View style={[styles.recentSection, { backgroundColor: colors.card }]}>
                    <View style={styles.recentHeader}>
                        <Text style={[styles.recentTitle, { color: colors.foreground }]}>Recent Searches</Text>
                        <TouchableOpacity onPress={() => setRecent([])}>
                            <Text style={[styles.clearText, { color: colors.primary.main }]}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.recentTags}>
                        {recent.map((term) => (
                            <TouchableOpacity key={term} style={[styles.recentTag, { backgroundColor: colors.muted }]} onPress={() => setSearch(term)}>
                                <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.recentTagText, { color: colors.foreground }]}>{term}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={[styles.tipText, { color: colors.mutedForeground }]}>Type at least 2 characters to search.</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderUser}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    ListHeaderComponent={
                        isLoading || isFetching ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="small" color={colors.primary.main} />
                                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Searching users...</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name={error ? 'alert-circle-outline' : 'search-outline'} size={48} color={error ? colors.error : colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: error ? colors.error : colors.mutedForeground }]}>
                                {error ? 'Failed to search users' : `No users found for "${search}"`}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
    btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, height: 44, gap: 10 },
    searchInput: { flex: 1, fontSize: 15 },
    cancel: { fontSize: 15, fontWeight: '600' },
    recentSection: { padding: 16 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    recentTitle: { fontSize: 16, fontWeight: '700' },
    clearText: { fontSize: 14, fontWeight: '600' },
    recentTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recentTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    recentTagText: { fontSize: 14 },
    tipText: { marginTop: 14, fontSize: 13 },
    loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
    loadingText: { fontSize: 14 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },
    userInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    username: { fontSize: 15, fontWeight: '700' },
    levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    level: { fontSize: 11, fontWeight: '700', fontFamily: fontFamilies.mono },
    name: { fontSize: 13, marginTop: 2 },
    followers: { fontSize: 12, marginTop: 2 },
    followBtn: { minWidth: 92, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
    followText: { fontSize: 13, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
    emptyText: { fontSize: 16, marginTop: 12, textAlign: 'center' },
});
