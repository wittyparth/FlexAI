import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, usePublicRoutines } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { NavigationBar, Chip } from '../../components/ui';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function PublicRoutinesScreen({ navigation }: any) {
    const colors = useColors();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const normalizedSearch = search.trim() || undefined;

    const { data: publicResponse, isLoading } = usePublicRoutines({
        page: 1,
        limit: 100,
        search: normalizedSearch,
    });

    const routines = publicResponse?.data?.routines || [];

    const filtered = routines.filter((r: any) => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || r.difficulty === filter.toLowerCase();
        return matchSearch && matchFilter;
    });

    const renderRoutine = ({ item }: { item: any }) => (
        <TouchableOpacity style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('RoutineTemplate', { routineId: item.id })}>
            <View style={[styles.routineImage, { backgroundColor: colors.primary.main }]}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={28} color="#FFF" />
            </View>
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.routineDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{item.description}</Text>
                <View style={styles.routineMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="barbell-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.exercises?.length ?? 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.estimatedDuration}m</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{((item.copiedCount || 0) / 1000).toFixed(1)}k</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar title="Public Routines" onBack={() => navigation.goBack()} />

            <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search routines..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
                </View>
            </View>

            <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {FILTERS.map(f => (
                    <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} size="sm" />
                ))}
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderRoutine}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No public routines found</Text>
                            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Try a different search or difficulty filter.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1 },
    btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700' },
    searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 12, height: 44, gap: 10 },
    searchInput: { flex: 1, fontSize: 15 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    filterText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 16, gap: 12 },
    routineCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    routineImage: { width: 90, alignItems: 'center', justifyContent: 'center' },
    routineInfo: { flex: 1, padding: 14 },
    routineName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    routineDesc: { fontSize: 13, marginBottom: 10 },
    routineMeta: { flexDirection: 'row', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyState: { paddingTop: 40, alignItems: 'center' },
    emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    emptySub: { fontSize: 13 },
});
