import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// Options aligned with Exercise schema
const MUSCLE_GROUPS = [
    { id: 'chest', label: 'Chest', icon: 'human-male' },
    { id: 'back', label: 'Back', icon: 'human-handsdown' },
    { id: 'shoulders', label: 'Shoulders', icon: 'human-handsup' },
    { id: 'biceps', label: 'Biceps', icon: 'arm-flex' },
    { id: 'triceps', label: 'Triceps', icon: 'arm-flex-outline' },
    { id: 'core', label: 'Core', icon: 'circle-outline' },
    { id: 'quads', label: 'Quads', icon: 'leg' },
    { id: 'hamstrings', label: 'Hamstrings', icon: 'leg' },
    { id: 'glutes', label: 'Glutes', icon: 'seat' },
    { id: 'calves', label: 'Calves', icon: 'foot-print' },
];

const EQUIPMENT = [
    { id: 'barbell', label: 'Barbell', icon: 'dumbbell' },
    { id: 'dumbbell', label: 'Dumbbell', icon: 'dumbbell' },
    { id: 'machine', label: 'Machine', icon: 'cog' },
    { id: 'cable', label: 'Cable', icon: 'cable-data' },
    { id: 'bodyweight', label: 'Bodyweight', icon: 'human' },
    { id: 'kettlebell', label: 'Kettlebell', icon: 'weight' },
];

const DIFFICULTIES = [
    { id: 'beginner', label: 'Beginner', color: '#10B981' },
    { id: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
    { id: 'advanced', label: 'Advanced', color: '#EF4444' },
];

export function ExerciseCreatorScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [primaryMuscle, setPrimaryMuscle] = useState('');
    const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
    const [equipment, setEquipment] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState('intermediate');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const toggleSecondary = (m: string) => {
        if (secondaryMuscles.includes(m)) setSecondaryMuscles(secondaryMuscles.filter(x => x !== m));
        else if (secondaryMuscles.length < 3) setSecondaryMuscles([...secondaryMuscles, m]);
    };

    const toggleEquipment = (e: string) => {
        if (equipment.includes(e)) setEquipment(equipment.filter(x => x !== e));
        else setEquipment([...equipment, e]);
    };

    const canSave = name.trim().length > 0 && primaryMuscle && equipment.length > 0;

    const handlePublish = () => {
        // Save logic here
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Create Exercise</Text>
                <TouchableOpacity disabled={!canSave} onPress={handlePublish}>
                    <View
                        style={styles.publishBtn}
                    >
                        <Text style={[styles.publishText, { color: canSave ? '#FFF' : colors.mutedForeground }]}>Publish</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* Media Upload */}
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <TouchableOpacity style={[styles.mediaPicker, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <View style={[styles.mediaIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <MaterialCommunityIcons name="video-plus" size={32} color={colors.primary.main} />
                            </View>
                            <Text style={[styles.mediaTitle, { color: colors.foreground }]}>Add Video or Image</Text>
                            <Text style={[styles.mediaSubtitle, { color: colors.mutedForeground }]}>Demonstrate proper form</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Name Input */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Exercise Name *</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.foreground }]}
                                placeholder="e.g. Bulgarian Split Squat"
                                placeholderTextColor={colors.mutedForeground}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
                        <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.textArea, { color: colors.foreground }]}
                                placeholder="Describe the exercise and proper form..."
                                placeholderTextColor={colors.mutedForeground}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Primary Muscle */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Primary Muscle *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {MUSCLE_GROUPS.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[
                                        styles.muscleChip,
                                        primaryMuscle === m.id
                                            ? { backgroundColor: colors.primary.main }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                    ]}
                                    onPress={() => setPrimaryMuscle(m.id)}
                                >
                                    <MaterialCommunityIcons
                                        name={m.icon as any}
                                        size={18}
                                        color={primaryMuscle === m.id ? '#FFF' : colors.foreground}
                                    />
                                    <Text style={[
                                        styles.chipText,
                                        { color: primaryMuscle === m.id ? '#FFF' : colors.foreground }
                                    ]}>{m.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Secondary Muscles */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: colors.foreground }]}>Secondary Muscles</Text>
                            <Text style={[styles.labelHint, { color: colors.mutedForeground }]}>Up to 3</Text>
                        </View>
                        <View style={styles.chipGrid}>
                            {MUSCLE_GROUPS.filter(m => m.id !== primaryMuscle).map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[
                                        styles.gridChip,
                                        secondaryMuscles.includes(m.id)
                                            ? { backgroundColor: `${colors.primary.main}15`, borderColor: colors.primary.main, borderWidth: 1.5 }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                    ]}
                                    onPress={() => toggleSecondary(m.id)}
                                >
                                    <Text style={[
                                        styles.gridChipText,
                                        { color: secondaryMuscles.includes(m.id) ? colors.primary.main : colors.foreground }
                                    ]}>{m.label}</Text>
                                    {secondaryMuscles.includes(m.id) && (
                                        <Ionicons name="checkmark-circle" size={18} color={colors.primary.main} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Equipment */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Equipment *</Text>
                        <View style={styles.equipmentGrid}>
                            {EQUIPMENT.map((e) => (
                                <TouchableOpacity
                                    key={e.id}
                                    style={[
                                        styles.equipmentCard,
                                        equipment.includes(e.id)
                                            ? { backgroundColor: colors.primary.main }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                    ]}
                                    onPress={() => toggleEquipment(e.id)}
                                >
                                    <MaterialCommunityIcons
                                        name={e.icon as any}
                                        size={24}
                                        color={equipment.includes(e.id) ? '#FFF' : colors.foreground}
                                    />
                                    <Text style={[
                                        styles.equipmentText,
                                        { color: equipment.includes(e.id) ? '#FFF' : colors.foreground }
                                    ]}>{e.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Difficulty */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Difficulty</Text>
                        <View style={styles.difficultyRow}>
                            {DIFFICULTIES.map((d) => (
                                <TouchableOpacity
                                    key={d.id}
                                    style={[
                                        styles.difficultyCard,
                                        difficulty === d.id
                                            ? { backgroundColor: d.color }
                                            : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }
                                    ]}
                                    onPress={() => setDifficulty(d.id)}
                                >
                                    <Text style={[
                                        styles.difficultyText,
                                        { color: difficulty === d.id ? '#FFF' : colors.foreground }
                                    ]}>{d.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Public Toggle */}
                    <View style={styles.section}>
                        <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.toggleInfo}>
                                <View style={[styles.toggleIcon, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="earth" size={22} color={colors.success} />
                                </View>
                                <View>
                                    <Text style={[styles.toggleTitle, { color: colors.foreground }]}>Make Public</Text>
                                    <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>Allow others to use this exercise</Text>
                                </View>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: colors.muted, true: colors.primary.main }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    publishBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
    publishText: { fontSize: 15, fontWeight: '700' },
    scroll: { padding: 16 },
    mediaPicker: { height: 180, borderRadius: 24, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    mediaIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    mediaTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    mediaSubtitle: { fontSize: 14 },
    section: { marginBottom: 24 },
    label: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    labelHint: { fontSize: 13 },
    inputContainer: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    input: { height: 54, paddingHorizontal: 18, fontSize: 16 },
    textAreaContainer: { borderRadius: 16, borderWidth: 1 },
    textArea: { minHeight: 110, padding: 16, fontSize: 15, lineHeight: 22 },
    chipScroll: { gap: 10 },
    muscleChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, gap: 8 },
    chipText: { fontSize: 14, fontWeight: '600' },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, gap: 8 },
    gridChipText: { fontSize: 14, fontWeight: '600' },
    equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    equipmentCard: { width: (width - 44) / 3, paddingVertical: 18, borderRadius: 16, alignItems: 'center', gap: 8 },
    equipmentText: { fontSize: 13, fontWeight: '600' },
    difficultyRow: { flexDirection: 'row', gap: 12 },
    difficultyCard: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    difficultyText: { fontSize: 14, fontWeight: '700' },
    toggleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 18, borderWidth: 1 },
    toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    toggleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    toggleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    toggleDesc: { fontSize: 13 },
});
