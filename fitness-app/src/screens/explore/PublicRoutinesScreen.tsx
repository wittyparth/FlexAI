import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// Mock aligned with Routine schema
const ROUTINES = [
    { id: 1, name: 'PPL - Push Day', description: 'Classic push workout', exerciseCount: 6, estimatedDuration: 60, difficulty: 'intermediate', usageCount: 2400 },
    { id: 2, name: 'Full Body Blast', description: 'Hit every muscle group', exerciseCount: 8, estimatedDuration: 75, difficulty: 'advanced', usageCount: 1800 },
    { id: 3, name: 'Beginner Upper', description: 'Perfect for beginners', exerciseCount: 5, estimatedDuration: 45, difficulty: 'beginner', usageCount: 3200 },
    { id: 4, name: 'Leg Destroyer', description: 'Intense leg workout', exerciseCount: 7, estimatedDuration: 65, difficulty: 'advanced', usageCount: 1200 },
];

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function PublicRoutinesScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filtered = ROUTINES.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || r.difficulty === filter.toLowerCase();
        return matchSearch && matchFilter;
    });

    const renderRoutine = ({ item }: { item: typeof ROUTINES[0] }) => (
        <TouchableOpacity style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('RoutineTemplate', { routineId: item.id })}>
            <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.routineImage}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={28} color="#FFF" />
            </LinearGradient>
            <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.routineDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{item.description}</Text>
                <View style={styles.routineMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="barbell-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.exerciseCount}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.estimatedDuration}m</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{(item.usageCount / 1000).toFixed(1)}k</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Public Routines</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search routines..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
                </View>
            </View>

            <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {FILTERS.map(f => (
                    <TouchableOpacity key={f} style={[styles.filterChip, filter === f && { backgroundColor: colors.primary.main }]} onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, { color: filter === f ? '#FFF' : colors.foreground }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList data={filtered} renderItem={renderRoutine} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
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
});
