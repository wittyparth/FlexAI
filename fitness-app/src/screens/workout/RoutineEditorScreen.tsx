import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import {
    useCreateRoutine,
    useUpdateRoutine,
    useRoutine,
    useAddExerciseToRoutine,
    useRemoveExerciseFromRoutine
} from '../../hooks/queries/useRoutineQueries';
import { Routine, RoutineExercise } from '../../types/backend.types';

interface EditorExercise {
    id: number; // This acts as a temp ID or exercise ID
    exerciseId: number;
    name: string;
    targetSets: string;
    targetReps: string; // e.g., "8-10" or "12"
    restSeconds: string;
    orderIndex?: number;
    // Track if it's existing in DB or new, for update logic if we needed complex diffing
    // For now we treat all as new payload for addExercise logic in creation
}

export function RoutineEditorScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { routineId } = route.params || {};
    const isEditing = !!routineId;

    // Queries & Mutations
    const { data: routineResponse, isLoading: isLoadingRoutine } = useRoutine(routineId);
    const createRoutine = useCreateRoutine();
    const updateRoutine = useUpdateRoutine();
    const addExercise = useAddExerciseToRoutine();
    const removeExerciseMutation = useRemoveExerciseFromRoutine(); // Not fully used for complex batch update but good to have

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [exercises, setExercises] = useState<EditorExercise[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state when editing
    useEffect(() => {
        if (isEditing && routineResponse?.data) {
            const r = routineResponse.data;
            setName(r.name);
            setDescription(r.description || '');
            setIsPublic(r.isPublic || false);

            // Map existing routine exercises to editor format if they exist
            if (r.exercises) {
                setExercises(r.exercises.map((ex: RoutineExercise) => ({
                    id: ex.id, // routine_exercises id
                    exerciseId: ex.exerciseId,
                    name: ex.exercise?.name || 'Unknown Exercise',
                    targetSets: ex.targetSets?.toString() || '3',
                    targetReps: ex.targetRepsMin ?
                        (ex.targetRepsMax && ex.targetRepsMax !== ex.targetRepsMin ? `${ex.targetRepsMin}-${ex.targetRepsMax}` : `${ex.targetRepsMin}`)
                        : '10',
                    restSeconds: ex.restSeconds?.toString() || '60',
                    orderIndex: ex.orderIndex,
                })));
            }
        }
    }, [isEditing, routineResponse]);

    // Handle new exercise added from Picker
    useEffect(() => {
        if (route.params?.selectedExercise) {
            const newEx = route.params.selectedExercise;
            setExercises(prev => [
                ...prev,
                {
                    id: Date.now(), // temp id
                    exerciseId: newEx.id,
                    name: newEx.name,
                    targetSets: '3',
                    targetReps: '10',
                    restSeconds: '60',
                }
            ]);
            // Clear params to avoid adding again on re-render?
            // Navigation setParams might be needed, or just handle duplicate check via ID if needed.
            // For now, simpler to just acknowledge user intent.
            navigation.setParams({ selectedExercise: undefined });
        }
    }, [route.params?.selectedExercise]);

    const removeExercise = (id: number) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const updateExercise = (id: number, field: keyof EditorExercise, value: string) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const parseReps = (repsStr: string) => {
        const parts = repsStr.split('-').map(s => parseInt(s.trim()));
        if (parts.length > 1) {
            return { min: parts[0], max: parts[1] };
        }
        return { min: parts[0], max: parts[0] }; // Use same for min/max if single number
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a routine name');
            return;
        }

        setIsSaving(true);
        try {
            if (isEditing) {
                // Update Routine Metadata
                await updateRoutine.mutateAsync({
                    id: routineId,
                    data: {
                        name,
                        description,
                        isPublic,
                    }
                });

                // Identify added and removed exercises
                const originalExercises = routineResponse?.data?.exercises || [];
                const currentExercises = exercises;

                // Existing IDs are from DB (small integers), New IDs are Date.now() (large integers)
                // Reliable way: Check against original list IDs
                const originalIds = new Set(originalExercises.map((e: RoutineExercise) => e.id));
                const currentIds = new Set(currentExercises.map(e => e.id));

                // Exercises to Remove: Present in Original but not in Current
                const toRemove = originalExercises.filter((e: RoutineExercise) => !currentIds.has(e.id));

                // Exercises to Add: Present in Current but ID match in Original
                const toAdd = currentExercises.filter(e => !originalIds.has(e.id));

                // Execute Removals
                const removePromises = toRemove.map((ex: RoutineExercise) =>
                    removeExerciseMutation.mutateAsync({
                        routineId,
                        exerciseId: ex.exerciseId
                    })
                );

                // Execute Additions
                const addPromises = toAdd.map((ex) => {
                    const { min, max } = parseReps(ex.targetReps);
                    return addExercise.mutateAsync({
                        routineId,
                        data: {
                            exerciseId: ex.exerciseId,
                            orderIndex: exercises.indexOf(ex),
                            targetSets: parseInt(ex.targetSets) || 3,
                            targetRepsMin: min || 8,
                            targetRepsMax: max || 12,
                            restSeconds: parseInt(ex.restSeconds) || 60,
                            notes: '',
                        }
                    });
                });

                await Promise.all([...removePromises, ...addPromises]);

                Alert.alert('Success', 'Routine updated successfully');
                navigation.goBack();
            } else {
                // Create New Routine
                const result = await createRoutine.mutateAsync({
                    name,
                    description,
                    isPublic,
                    // defaults
                    difficulty: 'intermediate',
                    goal: 'general',
                });

                const newRoutineId = result.data.id;

                // Add all exercises
                // We do this sequentially to maintain order usually, or Promise.all
                // API likely handles orderIndex if passed.
                const exercisePromises = exercises.map((ex, index) => {
                    const { min, max } = parseReps(ex.targetReps);
                    return addExercise.mutateAsync({
                        routineId: newRoutineId,
                        data: {
                            exerciseId: ex.exerciseId,
                            orderIndex: index,
                            targetSets: parseInt(ex.targetSets) || 3,
                            targetRepsMin: min || 8,
                            targetRepsMax: max || 12,
                            restSeconds: parseInt(ex.restSeconds) || 60,
                            notes: '',
                        }
                    });
                });

                await Promise.all(exercisePromises);

                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to save routine', error);
            Alert.alert('Error', 'Failed to save routine. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingRoutine && isEditing) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background + 'E6' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    {isEditing ? 'Edit Routine' : 'New Routine'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    <LinearGradient
                        colors={isSaving ? ['#cbd5e1', '#94a3b8'] : ['#0da6f2', '#00d2ff']}
                        style={styles.saveButton}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Routine Details */}
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>ROUTINE NAME</Text>
                            <TextInput
                                style={[styles.mainInput, { backgroundColor: colors.muted, color: colors.foreground }]}
                                placeholder="e.g. Morning Cardio"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
                            <TextInput
                                style={[styles.mainInput, { backgroundColor: colors.muted, color: colors.foreground, height: 80, textAlignVertical: 'top', paddingTop: 16 }]}
                                placeholder="Add a brief description..."
                                placeholderTextColor="#94A3B8"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        <View style={[styles.toggleRow, { backgroundColor: colors.muted }]}>
                            <View style={styles.toggleInfo}>
                                <View style={[styles.iconBox, { backgroundColor: '#0da6f220' }]}>
                                    <Ionicons name="earth" size={20} color="#0da6f2" />
                                </View>
                                <Text style={[styles.toggleText, { color: colors.foreground }]}>Make Public</Text>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={setIsPublic}
                                trackColor={{ false: '#767577', true: '#0da6f2' }}
                                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isPublic ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {/* Exercises Section */}
                    <View style={styles.exerciseHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Exercises</Text>
                        <View style={[styles.countBadge, { backgroundColor: '#0da6f215' }]}>
                            <Text style={styles.countText}>{exercises.length} items</Text>
                        </View>
                    </View>

                    {exercises.length === 0 ? (
                        <View style={[styles.emptyState, { borderColor: colors.border }]}>
                            <Text style={{ color: colors.mutedForeground }}>No exercises added yet.</Text>
                        </View>
                    ) : (
                        exercises.map((item, index) => (
                            <View key={item.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <MaterialCommunityIcons name="drag-vertical" size={24} color="#CBD5E1" />
                                        <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeExercise(item.id)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.metricsRow}>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>SETS</Text>
                                        <TextInput
                                            style={[styles.metricInput, { backgroundColor: colors.muted, color: colors.foreground }]}
                                            value={item.targetSets}
                                            onChangeText={(v) => updateExercise(item.id, 'targetSets', v)}
                                            keyboardType="numeric"
                                            placeholder="3"
                                        />
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>REPS</Text>
                                        <TextInput
                                            style={[styles.metricInput, { backgroundColor: colors.muted, color: colors.foreground }]}
                                            value={item.targetReps}
                                            onChangeText={(v) => updateExercise(item.id, 'targetReps', v)}
                                            placeholder="10"
                                        />
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>REST (S)</Text>
                                        <TextInput
                                            style={[styles.metricInput, { backgroundColor: colors.muted, color: colors.foreground }]}
                                            value={item.restSeconds}
                                            onChangeText={(v) => updateExercise(item.id, 'restSeconds', v)}
                                            keyboardType="numeric"
                                            placeholder="60"
                                        />
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Add Exercise */}
                    <TouchableOpacity
                        style={[styles.addButton, { borderColor: '#0da6f250' }]}
                        onPress={() => navigation.navigate('ExercisePicker', { returnTo: 'RoutineEditor' })}
                    >
                        <Ionicons name="add-circle" size={24} color="#0da6f2" />
                        <Text style={styles.addButtonText}>Add Exercise</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#0da6f2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginLeft: 4,
    },
    mainInput: {
        height: 56,
        borderRadius: 20,
        paddingHorizontal: 20,
        fontSize: 16,
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    countBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    countText: {
        color: '#0da6f2',
        fontSize: 12,
        fontWeight: '700',
    },
    exerciseCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    exerciseName: {
        fontSize: 17,
        fontWeight: '800',
        flex: 1,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingLeft: 32,
    },
    metricItem: {
        flex: 1,
        gap: 6,
    },
    metricLabel: {
        fontSize: 9,
        fontWeight: '900',
        textAlign: 'center',
    },
    metricInput: {
        height: 48,
        borderRadius: 14,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        gap: 10,
        marginTop: 8,
    },
    addButtonText: {
        color: '#0da6f2',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 20,
        marginBottom: 16,
    }
});
