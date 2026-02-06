import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Resistance Band'];
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];
const MOVEMENT = ['Push', 'Pull', 'Compound', 'Isolation'];

export function ExerciseFilterScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['Chest']);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
    const [selectedMovement, setSelectedMovement] = useState<string[]>([]);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showRecent, setShowRecent] = useState(false);

    const toggleSelection = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setter(list.filter(i => i !== item));
        } else {
            setter([...list, item]);
        }
    };

    const clearFilters = () => {
        setSelectedMuscles([]);
        setSelectedEquipment([]);
        setSelectedDifficulty('');
        setSelectedMovement([]);
        setShowFavorites(false);
        setShowRecent(false);
    };

    const applyFilters = () => {
        navigation.goBack();
    };

    const activeCount = selectedMuscles.length + selectedEquipment.length + selectedMovement.length + (selectedDifficulty ? 1 : 0) + (showFavorites ? 1 : 0) + (showRecent ? 1 : 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Filter Exercises</Text>
                <TouchableOpacity onPress={clearFilters}>
                    <Text style={[styles.clearText, { color: colors.primary.main }]}>Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Quick Filters */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Filters</Text>
                    <View style={styles.switchRow}>
                        <View style={styles.switchLabel}>
                            <Ionicons name="heart" size={20} color={colors.error} />
                            <Text style={[styles.switchText, { color: colors.foreground }]}>Favorites Only</Text>
                        </View>
                        <Switch value={showFavorites} onValueChange={setShowFavorites} trackColor={{ false: colors.muted, true: colors.primary.main }} thumbColor="#FFF" />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.switchRow}>
                        <View style={styles.switchLabel}>
                            <Ionicons name="time" size={20} color={colors.primary.main} />
                            <Text style={[styles.switchText, { color: colors.foreground }]}>Recently Used</Text>
                        </View>
                        <Switch value={showRecent} onValueChange={setShowRecent} trackColor={{ false: colors.muted, true: colors.primary.main }} thumbColor="#FFF" />
                    </View>
                </View>

                {/* Muscle Groups */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Muscle Groups</Text>
                    <View style={styles.chipGrid}>
                        {MUSCLE_GROUPS.map(muscle => (
                            <TouchableOpacity key={muscle} style={[styles.chip, selectedMuscles.includes(muscle) ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => toggleSelection(muscle, selectedMuscles, setSelectedMuscles)}>
                                <Text style={[styles.chipText, { color: selectedMuscles.includes(muscle) ? '#FFF' : colors.foreground }]}>{muscle}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Equipment */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Equipment</Text>
                    <View style={styles.chipGrid}>
                        {EQUIPMENT.map(eq => (
                            <TouchableOpacity key={eq} style={[styles.chip, selectedEquipment.includes(eq) ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => toggleSelection(eq, selectedEquipment, setSelectedEquipment)}>
                                <Text style={[styles.chipText, { color: selectedEquipment.includes(eq) ? '#FFF' : colors.foreground }]}>{eq}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Difficulty */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Difficulty</Text>
                    <View style={styles.chipGrid}>
                        {DIFFICULTY.map(d => (
                            <TouchableOpacity key={d} style={[styles.chip, selectedDifficulty === d ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => setSelectedDifficulty(selectedDifficulty === d ? '' : d)}>
                                <Text style={[styles.chipText, { color: selectedDifficulty === d ? '#FFF' : colors.foreground }]}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Movement Type */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Movement Type</Text>
                    <View style={styles.chipGrid}>
                        {MOVEMENT.map(m => (
                            <TouchableOpacity key={m} style={[styles.chip, selectedMovement.includes(m) ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => toggleSelection(m, selectedMovement, setSelectedMovement)}>
                                <Text style={[styles.chipText, { color: selectedMovement.includes(m) ? '#FFF' : colors.foreground }]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Apply Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                    <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.applyGrad}>
                        <Text style={styles.applyText}>Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
    closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    clearText: { fontSize: 15, fontWeight: '600' },
    scroll: { padding: 16, gap: 16 },
    section: { borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    switchLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    switchText: { fontSize: 15, fontWeight: '500' },
    divider: { height: 1, marginVertical: 12 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    chipText: { fontSize: 14, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
    applyBtn: { borderRadius: 16, overflow: 'hidden' },
    applyGrad: { paddingVertical: 16, alignItems: 'center' },
    applyText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
