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
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationBar } from '../../components/ui';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';
import { useExerciseSearch } from '../../hooks/queries/useExerciseQueries';
import { useDebounce } from '../../hooks/useDebounce';

const { width } = Dimensions.get('window');

export function ExerciseSwapScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const debouncedSearch = useDebounce(search, 350);
    const { currentExercise, returnTo, onSwapExercise } = route.params || {};

    const currentExerciseId = Number(currentExercise?.id) || undefined;
    const currentMuscle =
        currentExercise?.muscleGroup ||
        currentExercise?.muscle ||
        (Array.isArray(currentExercise?.primaryMuscleGroups) ? currentExercise.primaryMuscleGroups[0] : undefined);
    const currentEquipment =
        currentExercise?.equipment ||
        (Array.isArray(currentExercise?.equipmentList) ? currentExercise.equipmentList[0] : undefined);

    const { data: exercisesData, isLoading } = useExerciseSearch({
        search: debouncedSearch || undefined,
        muscleGroup: currentMuscle,
        limit: 50,
    });

    const normalizeExercise = (exercise: any) => {
        const muscle =
            exercise?.muscleGroup ||
            (Array.isArray(exercise?.primaryMuscleGroups) ? exercise.primaryMuscleGroups[0] : undefined) ||
            'General';
        const equipment =
            exercise?.equipment ||
            (Array.isArray(exercise?.equipmentList) ? exercise.equipmentList[0] : undefined) ||
            (Array.isArray(exercise?.equipment) ? exercise.equipment[0] : undefined) ||
            'Bodyweight';
        const equipmentMatch = String(equipment).toLowerCase() === String(currentEquipment || '').toLowerCase();
        const muscleMatch = String(muscle).toLowerCase() === String(currentMuscle || '').toLowerCase();
        const matchScore = Math.min(99, 60 + (muscleMatch ? 25 : 0) + (equipmentMatch ? 14 : 0));

        return {
            id: Number(exercise.id),
            raw: exercise,
            name: exercise.name,
            muscle,
            equipment,
            matchScore,
            icon: equipmentMatch ? 'dumbbell' : 'arm-flex',
        };
    };

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const liveExercises = (exercisesData?.exercises || [])
        .filter((exercise: any) => {
            const id = Number(exercise?.id);
            return Number.isFinite(id) && (!currentExerciseId || id !== currentExerciseId);
        })
        .map(normalizeExercise)
        .sort((a: any, b: any) => b.matchScore - a.matchScore);

    const filteredExercises = liveExercises.filter((exercise: any) =>
        exercise.name.toLowerCase().includes(search.toLowerCase())
    );

    const getMatchColor = (score: number) => {
        if (score >= 90) return colors.success;
        if (score >= 75) return colors.warning;
        return colors.mutedForeground;
    };

    const handleSwap = () => {
        if (!selectedId) return;
        const selectedExercise = filteredExercises.find(exercise => exercise.id === selectedId)?.raw;
        if (!selectedExercise) return;

        if (typeof onSwapExercise === 'function') {
            onSwapExercise(selectedExercise);
            navigation.goBack();
            return;
        }

        if (returnTo) {
            navigation.navigate({
                name: returnTo,
                params: {
                    selectedSwapExercise: selectedExercise,
                    selectionToken: Date.now(),
                },
                merge: true,
                pop: true,
            } as any);
            return;
        }

        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar title="Swap Exercise" onBack={() => navigation.goBack()} />

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
                        <Text style={[styles.currentName, { color: colors.foreground }]}>
                            {currentExercise?.name || 'Selected Exercise'}
                        </Text>
                        <View style={styles.currentMeta}>
                            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="arm-flex" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{currentMuscle || 'General'}</Text>
                            </View>
                            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="dumbbell" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{currentEquipment || 'Bodyweight'}</Text>
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

                    {isLoading ? (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.primary.main} />
                        </View>
                    ) : filteredExercises.map((exercise, index) => (
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

                    {!isLoading && filteredExercises.length === 0 && (
                        <View style={{ paddingVertical: 24 }}>
                            <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground, textAlign: 'center' }]}>
                                No similar exercises found.
                            </Text>
                        </View>
                    )}
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
