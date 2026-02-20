import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Quads', 'Hamstrings', 'Glutes', 'Calves'];
const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Band', 'Other'];

export function CustomExerciseScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [primaryMuscle, setPrimaryMuscle] = useState('');
    const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
    const [equipment, setEquipment] = useState('');
    const [notes, setNotes] = useState('');

    const toggleSecondary = (muscle: string) => {
        if (secondaryMuscles.includes(muscle)) {
            setSecondaryMuscles(secondaryMuscles.filter(m => m !== muscle));
        } else if (secondaryMuscles.length < 3) {
            setSecondaryMuscles([...secondaryMuscles, muscle]);
        }
    };

    const canSave = name.trim().length > 0 && primaryMuscle && equipment;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Create Exercise</Text>
                <TouchableOpacity disabled={!canSave} onPress={() => navigation.goBack()}>
                    <Text style={[styles.saveText, { color: canSave ? colors.primary.main : colors.mutedForeground }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Image Picker */}
                <TouchableOpacity style={[styles.imagePicker, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <Ionicons name="camera" size={32} color={colors.mutedForeground} />
                    <Text style={[styles.imagePickerText, { color: colors.mutedForeground }]}>Add Photo</Text>
                </TouchableOpacity>

                {/* Name */}
                <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Exercise Name *</Text>
                    <TextInput style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted }]} placeholder="e.g. Incline Dumbbell Press" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
                </View>

                {/* Primary Muscle */}
                <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Primary Muscle *</Text>
                    <View style={styles.chipGrid}>
                        {MUSCLE_GROUPS.map(m => (
                            <TouchableOpacity key={m} style={[styles.chip, primaryMuscle === m ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => setPrimaryMuscle(m)}>
                                <Text style={[styles.chipText, { color: primaryMuscle === m ? '#FFF' : colors.foreground }]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Secondary Muscles */}
                <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Secondary Muscles (up to 3)</Text>
                    <View style={styles.chipGrid}>
                        {MUSCLE_GROUPS.filter(m => m !== primaryMuscle).map(m => (
                            <TouchableOpacity key={m} style={[styles.chip, secondaryMuscles.includes(m) ? { backgroundColor: `${colors.primary.main}30`, borderColor: colors.primary.main, borderWidth: 1 } : { backgroundColor: colors.muted }]} onPress={() => toggleSecondary(m)}>
                                <Text style={[styles.chipText, { color: secondaryMuscles.includes(m) ? colors.primary.main : colors.foreground }]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Equipment */}
                <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Equipment *</Text>
                    <View style={styles.chipGrid}>
                        {EQUIPMENT_OPTIONS.map(e => (
                            <TouchableOpacity key={e} style={[styles.chip, equipment === e ? { backgroundColor: colors.primary.main } : { backgroundColor: colors.muted }]} onPress={() => setEquipment(e)}>
                                <Text style={[styles.chipText, { color: equipment === e ? '#FFF' : colors.foreground }]}>{e}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes */}
                <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Notes / Instructions</Text>
                    <TextInput style={[styles.textArea, { color: colors.foreground, backgroundColor: colors.muted }]} placeholder="Add form cues, tips, or instructions..." placeholderTextColor={colors.mutedForeground} value={notes} onChangeText={setNotes} multiline numberOfLines={4} textAlignVertical="top" />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
    btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    saveText: { fontSize: 16, fontWeight: '700' },
    scroll: { padding: 16, gap: 16 },
    imagePicker: { height: 140, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
    imagePickerText: { fontSize: 14, fontWeight: '600' },
    field: { borderRadius: 16, borderWidth: 1, padding: 16 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
    input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
    textArea: { minHeight: 100, borderRadius: 12, padding: 14, fontSize: 15 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    chipText: { fontSize: 13, fontWeight: '600' },
});
