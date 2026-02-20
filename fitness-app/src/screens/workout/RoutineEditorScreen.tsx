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
    const { routineId, mode, routineData, onSaveReturn } = route.params || {};
    const isTemplateMode = mode === 'template_day';
    const isEditing = !!routineId || (isTemplateMode && !!routineData);

    // Queries & Mutations (only use if not in template mode)
    const { data: routineResponse, isLoading: isLoadingRoutine } = useRoutine(isTemplateMode ? undefined : routineId);
    const createRoutine = useCreateRoutine();
    const updateRoutine = useUpdateRoutine();
    const addExercise = useAddExerciseToRoutine();
    const removeExerciseMutation = useRemoveExerciseFromRoutine(); 

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [exercises, setExercises] = useState<EditorExercise[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state when editing or creating with preset data
    useEffect(() => {
        if ((isTemplateMode || mode === 'create') && routineData) {
            // Initialize from embedded template data or preset prepopulated data
            setName(routineData.name || '');
            setDescription(routineData.description || '');
            if (routineData.exercises) {
                setExercises(routineData.exercises.map((ex: any) => ({
                    id: ex.id || Date.now() + Math.random(),
                    exerciseId: ex.exerciseId || ex.exercise?.id,
                    name: ex.exercise?.name || 'Unknown Exercise',
                    targetSets: ex.targetSets?.toString() || '3',
                    targetReps: ex.targetRepsMin ?
                        (ex.targetRepsMax && ex.targetRepsMax !== ex.targetRepsMin ? `${ex.targetRepsMin}-${ex.targetRepsMax}` : `${ex.targetRepsMin}`)
                        : '10',
                    restSeconds: ex.restSeconds?.toString() || '60',
                    orderIndex: ex.orderIndex,
                })));
            }
        } else if (isEditing && routineResponse?.data && !isTemplateMode) {
            const r = routineResponse.data;
            setName(r.name);
            setDescription(r.description || '');
            setIsPublic(r.isPublic || false);

            if (r.exercises) {
                setExercises(r.exercises.map((ex: RoutineExercise) => ({
                    id: ex.id, 
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
    }, [isEditing, routineResponse, isTemplateMode, routineData]);

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
            if (isTemplateMode) {
                // In template mode, we just build the object and return it back via onSaveReturn
                if (onSaveReturn) {
                    const formattedExercises = exercises.map((ex, idx) => {
                        const { min, max } = parseReps(ex.targetReps);
                        return {
                            id: ex.id || Date.now() + idx, // Temp ID for embedded routines
                            exerciseId: ex.exerciseId,
                            orderIndex: idx,
                            targetSets: parseInt(ex.targetSets) || 3,
                            targetRepsMin: min || 8,
                            targetRepsMax: max || 12,
                            restSeconds: parseInt(ex.restSeconds) || 60,
                            exercise: { id: ex.exerciseId, name: ex.name } // Need exercise name for UI
                        };
                    });
                    
                    const newRoutineData = {
                        id: routineId || `temp_${Date.now()}`,
                        name,
                        description,
                        isPublic: false,
                        exercises: formattedExercises,
                        estimatedDuration: routineData?.estimatedDuration // Pass back so template editor has duration
                    };
                    
                    onSaveReturn(newRoutineData);
                    navigation.goBack();
                    return;
                }
            } else if (isEditing) {
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
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    {isEditing ? 'Edit Routine' : 'Build Workout'}
                </Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    <View
                        style={styles.saveButton}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </View>
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
                            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Ionicons name="barbell-outline" size={20} color={colors.primary.main} />
                                <TextInput
                                    style={[styles.mainInput, { color: colors.foreground }]}
                                    placeholder="e.g. Legendary Leg Day"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'flex-start', paddingTop: 16 }]}>
                                <Ionicons name="document-text-outline" size={20} color={colors.primary.main} style={{ marginTop: 2 }} />
                                <TextInput
                                    style={[styles.mainInput, { color: colors.foreground, height: 80, textAlignVertical: 'top', paddingTop: 0 }]}
                                    placeholder="What's the goal of this routine?"
                                    placeholderTextColor={colors.mutedForeground}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                />
                            </View>
                        </View>

                        {!isTemplateMode && (
                            <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.toggleInfo}>
                                    <View style={[styles.iconBox, { backgroundColor: `${colors.primary.main}20` }]}>
                                        <Ionicons name="earth" size={20} color={colors.primary.main} />
                                    </View>
                                    <View>
                                        <Text style={[styles.toggleText, { color: colors.foreground }]}>Publish to Community</Text>
                                        <Text style={[styles.toggleSubText, { color: colors.mutedForeground }]}>Allow others to see and copy this</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={isPublic}
                                    onValueChange={setIsPublic}
                                    trackColor={{ false: colors.border, true: colors.primary.main }}
                                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : isPublic ? '#FFFFFF' : '#f4f3f4'}
                                />
                            </View>
                        )}
                    </View>

                    {/* Exercises Section */}
                    <View style={styles.exerciseHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Exercises</Text>
                        <View style={[styles.countBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                            <Text style={[styles.countText, { color: colors.primary.main }]}>{exercises.length} items</Text>
                        </View>
                    </View>

                    {exercises.length === 0 ? (
                        <View style={[styles.emptyState, { borderColor: colors.border, backgroundColor: colors.card }]}>
                            <View style={[styles.emptyStateIconCircle, { backgroundColor: `${colors.primary.main}15` }]}>
                                <MaterialCommunityIcons name="weight-lifter" size={40} color={colors.primary.main} />
                            </View>
                            <Text style={[styles.emptyStateTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Empty Workout</Text>
                            <Text style={[styles.emptyStateSub, { color: colors.mutedForeground }]}>Tap the button below to start adding exercises.</Text>
                        </View>
                    ) : (
                        exercises.map((item, index) => (
                            <View key={item.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.primary.main }]}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Text style={[styles.exerciseIndex, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text>
                                        <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    <View style={styles.cardHeaderRight}>
                                        <MaterialCommunityIcons name="drag" size={22} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                                        <TouchableOpacity onPress={() => removeExercise(item.id)} style={[styles.deleteBtn, { backgroundColor: `${colors.error}15` }]}>
                                            <Ionicons name="close" size={18} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.metricsContainer}>
                                    <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.metricBoxLabel, { color: colors.mutedForeground }]}>Sets</Text>
                                        <TextInput
                                            style={[styles.metricBoxInput, { color: colors.foreground }]}
                                            value={item.targetSets}
                                            onChangeText={(v) => updateExercise(item.id, 'targetSets', v)}
                                            keyboardType="numeric"
                                            placeholder="3"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.metricBoxLabel, { color: colors.mutedForeground }]}>Reps</Text>
                                        <TextInput
                                            style={[styles.metricBoxInput, { color: colors.foreground }]}
                                            value={item.targetReps}
                                            onChangeText={(v) => updateExercise(item.id, 'targetReps', v)}
                                            placeholder="8-12"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                    <View style={[styles.metricBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.metricBoxLabel, { color: colors.mutedForeground }]}>Rest (s)</Text>
                                        <TextInput
                                            style={[styles.metricBoxInput, { color: colors.foreground }]}
                                            value={item.restSeconds}
                                            onChangeText={(v) => updateExercise(item.id, 'restSeconds', v)}
                                            keyboardType="numeric"
                                            placeholder="90"
                                            placeholderTextColor={colors.mutedForeground}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {/* Add Exercise */}
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: `${colors.primary.main}10`, borderColor: `${colors.primary.main}30` }]}
                        onPress={() => navigation.navigate('ExercisePicker', { returnTo: 'RoutineEditor' })}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={20} color={colors.primary.main} />
                        <Text style={[styles.addButtonText, { color: colors.primary.main }]}>Add Exercise to Workout</Text>
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
        marginBottom: 30,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 56,
        gap: 12,
    },
    mainInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    toggleSubText: {
        fontSize: 12,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    countBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    countText: {
        fontSize: 13,
        fontWeight: '800',
    },
    exerciseCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseIndex: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    metricBox: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 4,
    },
    metricBoxLabel: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricBoxInput: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        width: '100%',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
        marginTop: 8,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    emptyState: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 24,
        marginBottom: 16,
        borderStyle: 'dashed',
    },
    emptyStateIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyStateSub: {
        fontSize: 14,
        textAlign: 'center',
    }
});
