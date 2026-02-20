import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - Similar exercises for swap
// ============================================================
const CURRENT_EXERCISE = {
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    equipment: 'Barbell',
};

const SIMILAR_EXERCISES = [
    { id: 1, name: 'Dumbbell Bench Press', muscle: 'Chest', equipment: 'Dumbbell', matchScore: 95, icon: 'dumbbell' },
    { id: 2, name: 'Machine Chest Press', muscle: 'Chest', equipment: 'Machine', matchScore: 88, icon: 'cog' },
    { id: 3, name: 'Incline Dumbbell Press', muscle: 'Upper Chest', equipment: 'Dumbbell', matchScore: 82, icon: 'dumbbell' },
    { id: 4, name: 'Push Ups', muscle: 'Chest', equipment: 'Bodyweight', matchScore: 75, icon: 'human' },
    { id: 5, name: 'Cable Fly', muscle: 'Chest', equipment: 'Cable', matchScore: 68, icon: 'cable-data' },
    { id: 6, name: 'Dumbbell Fly', muscle: 'Chest', equipment: 'Dumbbell', matchScore: 65, icon: 'dumbbell' },
];

export function ExerciseSwapScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const filteredExercises = SIMILAR_EXERCISES.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const getMatchColor = (score: number) => {
        if (score >= 90) return colors.success;
        if (score >= 75) return colors.warning;
        return colors.mutedForeground;
    };

    const handleSwap = () => {
        if (selectedId) {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Swap Exercise</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Exercise Card */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.currentCard, { backgroundColor: `${colors.error}08`, borderColor: `${colors.error}30` }]}>
                        <View style={styles.currentHeader}>
                            <View style={[styles.swapIcon, { backgroundColor: `${colors.error}15` }]}>
                                <MaterialCommunityIcons name="swap-horizontal" size={22} color={colors.error} />
                            </View>
                            <Text style={[styles.currentLabel, { color: colors.error }]}>Swapping From</Text>
                        </View>
                        <Text style={[styles.currentName, { color: colors.foreground }]}>{CURRENT_EXERCISE.name}</Text>
                        <View style={styles.currentMeta}>
                            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="arm-flex" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{CURRENT_EXERCISE.muscle}</Text>
                            </View>
                            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="dumbbell" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{CURRENT_EXERCISE.equipment}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Search */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.foreground }]}
                            placeholder="Search alternatives..."
                            placeholderTextColor={colors.mutedForeground}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Similar Exercises */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.primary.main} />
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Best Matches</Text>
                        <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{filteredExercises.length}</Text>
                    </View>

                    {filteredExercises.map((exercise, index) => (
                        <Animated.View
                            key={exercise.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [15 + index * 3, 0]
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.exerciseCard,
                                    { backgroundColor: colors.card, borderColor: selectedId === exercise.id ? colors.primary.main : colors.border },
                                    selectedId === exercise.id && { borderWidth: 2 }
                                ]}
                                onPress={() => setSelectedId(exercise.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.exerciseIcon, { backgroundColor: colors.muted }]}>
                                    <MaterialCommunityIcons name={exercise.icon as any} size={24} color={colors.primary.main} />
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>
                                    <View style={styles.exerciseMeta}>
                                        <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>{exercise.muscle}</Text>
                                        <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                        <Text style={[styles.exerciseEquipment, { color: colors.mutedForeground }]}>{exercise.equipment}</Text>
                                    </View>
                                </View>
                                <View style={styles.matchContainer}>
                                    <View style={[styles.matchBadge, { backgroundColor: `${getMatchColor(exercise.matchScore)}15` }]}>
                                        <Text style={[styles.matchScore, { color: getMatchColor(exercise.matchScore) }]}>{exercise.matchScore}%</Text>
                                    </View>
                                    <Text style={[styles.matchLabel, { color: colors.mutedForeground }]}>match</Text>
                                </View>
                                {selectedId === exercise.id && (
                                    <View style={[styles.checkCircle, { backgroundColor: colors.primary.main }]}>
                                        <Ionicons name="checkmark" size={18} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.swapBtn, { opacity: selectedId ? 1 : 0.5 }]}
                    disabled={!selectedId}
                    onPress={handleSwap}
                    activeOpacity={0.9}
                >
                    <View
                        style={styles.swapGradient}
                    >
                        <MaterialCommunityIcons name="swap-horizontal" size={22} color="#FFF" />
                        <Text style={styles.swapText}>Swap Exercise</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    currentCard: { margin: 16, borderRadius: 20, borderWidth: 1, padding: 20 },
    currentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    swapIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    currentLabel: { fontSize: 14, fontWeight: '600' },
    currentName: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
    currentMeta: { flexDirection: 'row', gap: 10 },
    metaChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 6 },
    metaText: { fontSize: 13, fontWeight: '500' },
    searchSection: { paddingHorizontal: 16, marginBottom: 16 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, gap: 12 },
    searchInput: { flex: 1, fontSize: 16 },
    section: { paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
    sectionCount: { fontSize: 14 },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, position: 'relative' },
    exerciseIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    exerciseMuscle: { fontSize: 13 },
    exerciseEquipment: { fontSize: 13 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    matchContainer: { alignItems: 'flex-end', marginRight: 8 },
    matchBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    matchScore: { fontSize: 16, fontWeight: '800', fontFamily: fontFamilies.mono },
    matchLabel: { fontSize: 11, marginTop: 2 },
    checkCircle: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 },
    cancelBtn: { flex: 0.35, paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelText: { fontSize: 16, fontWeight: '600' },
    swapBtn: { flex: 0.65, borderRadius: 16, overflow: 'hidden', elevation: 6, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
    swapGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    swapText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
