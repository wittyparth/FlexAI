import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const MOCK_USERS = [
    { id: 1, username: 'alex_lifts', name: 'Alex Martinez', avatar: 'https://i.pravatar.cc/150?img=2', level: 32, followers: 1250 },
    { id: 2, username: 'fit_jordan', name: 'Jordan Lee', avatar: 'https://i.pravatar.cc/150?img=3', level: 28, followers: 3420 },
    { id: 3, username: 'sam_strength', name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?img=4', level: 45, followers: 8900 },
    { id: 4, username: 'taylor_fit', name: 'Taylor Smith', avatar: 'https://i.pravatar.cc/150?img=5', level: 22, followers: 520 },
    { id: 5, username: 'casey_gains', name: 'Casey Brown', avatar: 'https://i.pravatar.cc/150?img=6', level: 38, followers: 2100 },
    { id: 6, username: 'max_power', name: 'Max Power', avatar: 'https://i.pravatar.cc/150?img=7', level: 55, followers: 15000 },
];

const RECENT_SEARCHES = ['push ups', 'alex_lifts', 'chest workout', 'marathon training'];

export function SearchUsersScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [recent, setRecent] = useState(RECENT_SEARCHES);

    const filtered = MOCK_USERS.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));

    const formatFollowers = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

    const clearRecent = () => setRecent([]);

    const renderUser = ({ item }: any) => (
        <TouchableOpacity style={[styles.userItem, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.username, { color: colors.foreground }]}>@{item.username}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.level, { color: colors.primary.main }]}>Lv.{item.level}</Text>
                    </View>
                </View>
                <Text style={[styles.name, { color: colors.mutedForeground }]}>{item.name}</Text>
            </View>
            <Text style={[styles.followers, { color: colors.mutedForeground }]}>{formatFollowers(item.followers)} followers</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View style={[styles.searchBar, { backgroundColor: colors.muted, flex: 1, marginHorizontal: 12 }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search users..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} autoFocus />
                    {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={colors.mutedForeground} /></TouchableOpacity>}
                </View>
                <TouchableOpacity><Text style={[styles.cancel, { color: colors.primary.main }]}>Cancel</Text></TouchableOpacity>
            </View>

            {search.length === 0 && recent.length > 0 && (
                <View style={[styles.recentSection, { backgroundColor: colors.card }]}>
                    <View style={styles.recentHeader}>
                        <Text style={[styles.recentTitle, { color: colors.foreground }]}>Recent Searches</Text>
                        <TouchableOpacity onPress={clearRecent}><Text style={[styles.clearText, { color: colors.primary.main }]}>Clear All</Text></TouchableOpacity>
                    </View>
                    <View style={styles.recentTags}>
                        {recent.map((term, i) => (
                            <TouchableOpacity key={i} style={[styles.recentTag, { backgroundColor: colors.muted }]} onPress={() => setSearch(term)}>
                                <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.recentTagText, { color: colors.foreground }]}>{term}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {search.length > 0 && (
                <FlatList data={filtered} keyExtractor={(item) => item.id.toString()} renderItem={renderUser} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={48} color={colors.mutedForeground} /><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No users found for "{search}"</Text></View>} />
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
    userItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 14 },
    userInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    username: { fontSize: 15, fontWeight: '700' },
    levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    level: { fontSize: 11, fontWeight: '700', fontFamily: fontFamilies.mono },
    name: { fontSize: 13, marginTop: 2 },
    followers: { fontSize: 12 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12, textAlign: 'center' },
});
