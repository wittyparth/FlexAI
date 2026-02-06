import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

// Mock aligned with Exercise schema
const EXERCISES = [
    { id: 1, name: 'Barbell Bench Press', primaryMuscleGroups: ['Chest'], equipment: ['Barbell'], difficulty: 'intermediate' },
    { id: 2, name: 'Deadlift', primaryMuscleGroups: ['Back', 'Legs'], equipment: ['Barbell'], difficulty: 'advanced' },
    { id: 3, name: 'Squat', primaryMuscleGroups: ['Legs'], equipment: ['Barbell'], difficulty: 'intermediate' },
    { id: 4, name: 'Pull-up', primaryMuscleGroups: ['Back'], equipment: ['Bodyweight'], difficulty: 'intermediate' },
    { id: 5, name: 'Overhead Press', primaryMuscleGroups: ['Shoulders'], equipment: ['Barbell'], difficulty: 'intermediate' },
    { id: 6, name: 'Dumbbell Curl', primaryMuscleGroups: ['Biceps'], equipment: ['Dumbbell'], difficulty: 'beginner' },
    { id: 7, name: 'Tricep Pushdown', primaryMuscleGroups: ['Triceps'], equipment: ['Cable'], difficulty: 'beginner' },
    { id: 8, name: 'Leg Press', primaryMuscleGroups: ['Legs'], equipment: ['Machine'], difficulty: 'beginner' },
];

const FILTERS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export function ExerciseLibraryScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const filtered = EXERCISES.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || e.primaryMuscleGroups.some(m => m.toLowerCase().includes(filter.toLowerCase()));
        return matchSearch && matchFilter;
    });

    const renderExercise = ({ item }: { item: typeof EXERCISES[0] }) => (
        <TouchableOpacity style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}>
            <View style={[styles.exerciseIcon, { backgroundColor: colors.primary.main + '15' }]}>
                <MaterialCommunityIcons name="dumbbell" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>{item.primaryMuscleGroups.join(', ')} • {item.equipment[0]}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: item.difficulty === 'beginner' ? colors.success + '20' : item.difficulty === 'intermediate' ? colors.warning + '20' : colors.error + '20' }]}>
                <Text style={[styles.diffText, { color: item.difficulty === 'beginner' ? colors.success : item.difficulty === 'intermediate' ? colors.warning : colors.error }]}>{item.difficulty.charAt(0).toUpperCase()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Exercise Library</Text>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ExerciseFilter')}>
                    <Ionicons name="options-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchWrap, { backgroundColor: colors.card }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                    <Ionicons name="search" size={20} color={colors.mutedForeground} />
                    <TextInput style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search exercises..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} />
                </View>
            </View>

            <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {FILTERS.slice(0, 6).map(f => (
                    <TouchableOpacity key={f} style={[styles.filterChip, filter === f && { backgroundColor: colors.primary.main }]} onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, { color: filter === f ? '#FFF' : colors.foreground }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList data={filtered} renderItem={renderExercise} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
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
    filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1, flexWrap: 'wrap' },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    filterText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 16, gap: 12 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
    exerciseIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    exerciseMeta: { fontSize: 13 },
    diffBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    diffText: { fontSize: 14, fontWeight: '800' },
});
