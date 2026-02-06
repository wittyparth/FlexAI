import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

import { useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '../../hooks/queries/useSocialQueries';
import { useAuthStore } from '../../store/authStore';

export function FollowersListScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const userAuth = useAuthStore(state => state.user);

    // Get userId from route params or fallback to current user
    const userId = route.params?.userId || userAuth?.id;

    const { data, isLoading } = useFollowers(userId);
    const followers = data?.users || [];
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    // Filter based on search
    const filtered = followers.filter((u: any) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase())
    );

    const handleFollowToggle = (user: any) => {
        if (user.isFollowing) {
            unfollowMutation.mutate(user.id);
        } else {
            followMutation.mutate(user.id);
        }
    };

    const renderUser = ({ item }: any) => (
        <TouchableOpacity style={[styles.userItem, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
            <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.username, { color: colors.foreground }]}>@{item.username}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.level, { color: colors.primary.main }]}>Lv.{item.level || 1}</Text>
                    </View>
                </View>
                <Text style={[styles.name, { color: colors.mutedForeground }]}>{item.firstName} {item.lastName}</Text>
            </View>
            {item.id !== userAuth?.id && (
                <TouchableOpacity
                    onPress={() => handleFollowToggle(item)}
                    style={[styles.followBtn, item.isFollowing && { backgroundColor: colors.muted }]}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                    {item.isFollowing ? (
                        <Text style={[styles.followText, { color: colors.foreground }]}>Following</Text>
                    ) : (
                        <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.followGrad}>
                            <Text style={styles.followTextWhite}>Follow</Text>
                        </LinearGradient>
                    )}
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Followers</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search followers..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
                    {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={colors.mutedForeground} /></TouchableOpacity>}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderUser}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No followers found</Text>
                    </View>
                }
            />
        </View>
    );
}

export function FollowingListScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const userAuth = useAuthStore(state => state.user);

    const userId = route.params?.userId || userAuth?.id;

    const { data, isLoading } = useFollowing(userId);
    const following = data?.users || [];
    const unfollowMutation = useUnfollowUser();

    const filtered = following.filter((u: any) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase())
    );

    const handleUnfollow = (targetUserId: string) => {
        unfollowMutation.mutate(targetUserId);
    };

    const renderUser = ({ item }: any) => (
        <TouchableOpacity style={[styles.userItem, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
            <Image source={{ uri: item.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.username, { color: colors.foreground }]}>@{item.username}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.level, { color: colors.primary.main }]}>Lv.{item.level || 1}</Text>
                    </View>
                </View>
                <Text style={[styles.name, { color: colors.mutedForeground }]}>{item.firstName} {item.lastName}</Text>
            </View>
            {item.id !== userAuth?.id && (
                <TouchableOpacity onPress={() => handleUnfollow(item.id)} style={[styles.followBtn, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.followText, { color: colors.foreground }]}>Following</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Following</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search following..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
                    {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={colors.mutedForeground} /></TouchableOpacity>}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderUser}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Not following anyone</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, height: 44, gap: 10 },
    searchInput: { flex: 1, fontSize: 15 },
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },
    userInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    username: { fontSize: 15, fontWeight: '700' },
    levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    level: { fontSize: 11, fontWeight: '700', fontFamily: fontFamilies.mono },
    name: { fontSize: 13, marginTop: 2 },
    followBtn: { minWidth: 90, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    followGrad: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
    followText: { fontSize: 13, fontWeight: '600' },
    followTextWhite: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12 },
});
