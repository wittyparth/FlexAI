import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useTemplateStore } from '../../store/templateStore';
import { Template, TemplateDay } from '../../types/backend.types';
import { usePublicRoutines, useRoutines } from '../../hooks/queries/useRoutineQueries';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function TemplateEditorScreen({ navigation, route }: any) {
    const { templateId, templateData } = route.params || {};
    const isEditing = !!templateId;
    
    const colors = useColors();
    const insets = useSafeAreaInsets();
    
    const existingTemplate = useTemplateStore(state => templateId ? state.templates[templateId] : null);
    const createTemplate = useTemplateStore(state => state.createTemplate);
    const updateTemplate = useTemplateStore(state => state.updateTemplate);
    const updateTemplateDay = useTemplateStore(state => state.updateTemplateDay);

    const [name, setName] = useState(existingTemplate?.name || templateData?.name || '');
    const [description, setDescription] = useState(existingTemplate?.description || templateData?.description || '');
    const [color, setColor] = useState(existingTemplate?.color || '#6366F1');
    const [selectedDayId, setSelectedDayId] = useState<number>(1);
    
    // For new templates, we need local state for days before saving
    const [localDays, setLocalDays] = useState<TemplateDay[]>(
        existingTemplate?.days || templateData?.days || Array.from({ length: 7 }, (_, i) => ({
            dayId: i + 1,
            isRestDay: true,
        }))
    );

    const [showDayActionOptions, setShowDayActionOptions] = useState(false);

    const { data: myRoutinesResponse } = useRoutines({ page: 1, limit: 100, isTemplate: false });
    const { data: publicRoutinesResponse } = usePublicRoutines({ page: 1, limit: 100 });

    const routineLookup = useMemo(() => {
        const lookup: Record<number, any> = {};
        const routines = myRoutinesResponse?.data?.routines || [];
        const publicRoutines = publicRoutinesResponse?.data?.routines || [];

        [...routines, ...publicRoutines].forEach((routine: any) => {
            lookup[Number(routine.id)] = routine;
        });

        return lookup;
    }, [myRoutinesResponse, publicRoutinesResponse]);

    // Sync if editing existing and it changes in store (unlikely but good practice)
    useEffect(() => {
        if (existingTemplate) {
            setLocalDays(existingTemplate.days);
        }
    }, [existingTemplate]);

    const handleSave = () => {
        if (!name.trim()) {
            return; // Needs validation
        }

        if (isEditing) {
            updateTemplate(templateId, { name, description, color, days: localDays });
        } else {
            createTemplate({
                id: `t_${Date.now()}`,
                name,
                description,
                color,
                days: localDays,
            });
        }
        navigation.goBack();
    };

    const toggleRestDay = (dayId: number) => {
        const d = localDays.find(d => d.dayId === dayId);
        if (d) {
            handleUpdateLocalDay(dayId, { isRestDay: !d.isRestDay });
        }
    };

    const handleUpdateLocalDay = (dayId: number, updates: Partial<TemplateDay>) => {
        setLocalDays(prev => prev.map(d => d.dayId === dayId ? { ...d, ...updates } : d));
        if (isEditing) {
            updateTemplateDay(templateId, dayId, updates);
        }
    };

    const selectedDay = localDays.find(d => d.dayId === selectedDayId);
    
    const handleAssignOption = (option: 'manual' | 'ai' | 'existing' | 'community') => {
        setShowDayActionOptions(false);
        if (option === 'manual') {
            navigation.navigate('RoutineEditor', { 
                mode: 'create',
                onSaveReturn: (routine: any) => {
                    handleUpdateLocalDay(selectedDayId, { isRestDay: false, routineData: routine });
                }
            });
        } else if (option === 'ai') {
            navigation.navigate('AIRoutinePlanner');
        } else if (option === 'existing') {
            navigation.navigate('RoutineList', {
                mode: 'select',
                initialTab: 'My Plans',
                onSelect: (routineId: number) => {
                    handleUpdateLocalDay(selectedDayId, { isRestDay: false, routineId, routineData: undefined });
                }
            });
        } else {
             navigation.navigate('RoutineList', {
                mode: 'select',
                initialTab: 'Discover',
                onSelect: (routineId: number) => {
                    handleUpdateLocalDay(selectedDayId, { isRestDay: false, routineId, routineData: undefined });
                }
            });
        }
    };

    const removeRoutineFromDay = () => {
        handleUpdateLocalDay(selectedDayId, { isRestDay: true, routineId: undefined, routineData: undefined });
    };

    return (
        <KeyboardAvoidingView 
            style={[styles.container, { backgroundColor: colors.background }]} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="close" size={26} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        {isEditing ? 'Edit Template' : 'New Template'}
                    </Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={!name.trim()}>
                        <Text style={[styles.saveText, { color: name.trim() ? colors.primary.main : colors.mutedForeground }]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Basic Info */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Template Details</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.mutedForeground }]}>TEMPLATE NAME</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="calendar-edit" size={20} color={colors.primary.main} />
                        <TextInput
                            style={[styles.mainInput, { color: colors.foreground }]}
                            placeholder="e.g. 4-Day PPL Split"
                            placeholderTextColor={colors.mutedForeground}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>
                </View>

                <View style={[styles.inputGroup, { marginBottom: 24 }]}>
                    <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'flex-start', paddingTop: 16 }]}>
                        <Ionicons name="document-text-outline" size={20} color={colors.primary.main} style={{ marginTop: 2 }} />
                        <TextInput
                            style={[styles.mainInput, { color: colors.foreground, height: 80, textAlignVertical: 'top', paddingTop: 0 }]}
                            placeholder="Briefly describe this template..."
                            placeholderTextColor={colors.mutedForeground}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Days Selector */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Weekly Schedule</Text>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                    {localDays.map((day, idx) => {
                        const isSelected = selectedDayId === day.dayId;
                        const hasWorkout = !day.isRestDay && (day.routineId || day.routineData);
                        
                        return (
                            <TouchableOpacity 
                                key={day.dayId} 
                                style={[
                                    styles.dayPill,
                                    { backgroundColor: isSelected ? colors.primary.main : colors.card, borderColor: isSelected ? colors.primary.main : colors.border }
                                ]}
                                onPress={() => setSelectedDayId(day.dayId)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.dayText, 
                                    { color: isSelected ? '#FFFFFF' : colors.foreground }
                                ]}>
                                    {DAYS_OF_WEEK[idx]}
                                </Text>
                                <View style={[
                                    styles.dayIndicator, 
                                    { backgroundColor: hasWorkout ? (isSelected ? '#FFFFFF' : colors.primary.main) : 'transparent' }
                                ]} />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Selected Day View */}
                {selectedDay && (
                    <View style={[styles.dayDetailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.dayDetailHeader}>
                            <Text style={[styles.dayDetailTitle, { color: colors.foreground }]}>
                                {DAYS_OF_WEEK[selectedDay.dayId - 1]}
                            </Text>
                            <TouchableOpacity 
                                style={[styles.toggleBtn, { backgroundColor: selectedDay.isRestDay ? `${colors.primary.main}20` : colors.background }]}
                                onPress={() => toggleRestDay(selectedDay.dayId)}
                            >
                                <Text style={[styles.toggleText, { color: selectedDay.isRestDay ? colors.primary.main : colors.mutedForeground }]}>
                                    {selectedDay.isRestDay ? 'Set as Active Day' : 'Mark as Rest Day'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {!selectedDay.isRestDay ? (
                            <View style={styles.dayContent}>
                                {(selectedDay.routineId || selectedDay.routineData) ? (() => {
                                    const assignedRoutine =
                                        selectedDay.routineData ||
                                        (selectedDay.routineId ? routineLookup[Number(selectedDay.routineId)] : null);
                                    
                                    return (
                                        <View style={styles.routineAssigned}>
                                            <View style={styles.routineAssignedHeader}>
                                                <View style={[styles.routineIcon, { backgroundColor: `${colors.primary.main}20` }]}>
                                                    <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text style={[styles.routineAssignedTitle, { color: colors.foreground }]}>
                                                        {assignedRoutine?.name || `Routine #${selectedDay.routineId}`}
                                                    </Text>
                                                    <Text style={[styles.routineAssignedMeta, { color: colors.mutedForeground }]}>
                                                        {selectedDay.routineData ? 'Custom Routine' : 'Linked Routine'}
                                                        {assignedRoutine?.estimatedDuration ? ` • ${assignedRoutine.estimatedDuration} min` : ''}
                                                    </Text>
                                                </View>
                                            </View>
                                            {/* Exercises List Render directly beneath, no nested padding */}
                                            {assignedRoutine?.exercises && assignedRoutine.exercises.length > 0 && (
                                                <View style={styles.exercisesList}>
                                                    <View style={styles.exercisesListHeader}>
                                                        <Text style={[styles.exercisesListTitle, { color: colors.foreground }]}>Exercises ({assignedRoutine.exercises.length})</Text>
                                                    </View>
                                                    
                                                    {assignedRoutine.exercises.map((ex: any, i: number) => {
                                                        const isLast = i === assignedRoutine.exercises.length - 1;
                                                        const exerciseName = ex.exercise?.name || 'Rest / Special';
                                                        const muscle = ex.exercise?.muscleGroup || 'Full Body';
                                                        return (
                                                            <View key={ex.id || i} style={[styles.exerciseCardModern, { borderBottomColor: isLast ? 'transparent' : colors.border }]}>
                                                                {/* Index & Header */}
                                                                <View style={styles.exCardTop}>
                                                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 16}}>
                                                                        <View style={[styles.exCardIndex, { backgroundColor: colors.primary.main + '15' }]}>
                                                                            <Text style={[styles.exCardIndexText, { color: colors.primary.main }]}>{String(i + 1).padStart(2, '0')}</Text>
                                                                        </View>
                                                                        <View style={{flex: 1}}>
                                                                            <Text style={[styles.exCardName, { color: colors.foreground }]} numberOfLines={1}>{exerciseName}</Text>
                                                                            <Text style={[styles.exCardMuscle, { color: colors.primary.main }]} numberOfLines={1}>{muscle}</Text>
                                                                        </View>
                                                                    </View>
                                                                    <TouchableOpacity style={styles.exCardOptions}>
                                                                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.mutedForeground} />
                                                                    </TouchableOpacity>
                                                                </View>

                                                                {/* Stats Row */}
                                                                <View style={styles.exCardStats}>
                                                                    <View style={[styles.exStatBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                                        <Text style={[styles.exStatLabel, { color: colors.mutedForeground }]}>SETS</Text>
                                                                        <Text style={[styles.exStatValue, { color: colors.foreground }]}>{ex.targetSets}</Text>
                                                                    </View>
                                                                    <View style={[styles.exStatBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                                        <Text style={[styles.exStatLabel, { color: colors.mutedForeground }]}>REPS</Text>
                                                                        <Text style={[styles.exStatValue, { color: colors.foreground }]}>{ex.targetRepsMin}{ex.targetRepsMax !== ex.targetRepsMin ? ` - ${ex.targetRepsMax}` : ''}</Text>
                                                                    </View>
                                                                    {(ex.targetWeight || 0) > 0 && (
                                                                        <View style={[styles.exStatBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                                            <Text style={[styles.exStatLabel, { color: colors.mutedForeground }]}>LBS</Text>
                                                                            <Text style={[styles.exStatValue, { color: colors.foreground }]}>{ex.targetWeight}</Text>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            )}

                                            <View style={styles.routineActionsRow}>
                                                <TouchableOpacity 
                                                    style={[styles.actionBtn, {backgroundColor: `${colors.primary.main}15`}]} 
                                                    onPress={() => {
                                                        navigation.navigate('RoutineEditor', { 
                                                            mode: 'template_day', 
                                                            routineData: assignedRoutine,
                                                            onSaveReturn: (updatedRoutine: any) => {
                                                                handleUpdateLocalDay(selectedDay.dayId, { isRestDay: false, routineData: updatedRoutine, routineId: undefined });
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <Ionicons name="pencil" size={16} color={colors.primary.main} />
                                                    <Text style={[styles.actionBtnText, {color: colors.primary.main}]}>Edit Workout</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: colors.card}]} onPress={() => setShowDayActionOptions(true)}>
                                                    <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.foreground} />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: `${colors.error}15`}]} onPress={removeRoutineFromDay}>
                                                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })() : (
                                    <View style={styles.noRoutine}>
                                        <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={colors.mutedForeground} />
                                        <Text style={[styles.noRoutineText, { color: colors.mutedForeground }]}>No workout assigned yet.</Text>
                                        <TouchableOpacity 
                                            style={[styles.assignPrimaryBtn, { backgroundColor: colors.primary.main }]}
                                            onPress={() => setShowDayActionOptions(true)}
                                        >
                                            <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                                            <Text style={styles.assignPrimaryText}>Assign Workout</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.restDayView}>
                                <Ionicons name="bed-outline" size={48} color={colors.mutedForeground} style={{marginBottom: 12, opacity: 0.5}} />
                                <Text style={[styles.restDayText, { color: colors.mutedForeground }]}>This is a rest day.</Text>
                                <Text style={[styles.restDaySub, { color: colors.mutedForeground }]}>Recovery is just as important as training.</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Action Sheet Modal */}
            <Modal visible={showDayActionOptions} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowDayActionOptions(false)} />
                    <View style={[styles.actionSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.sheetHandle} />
                        <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Assign Workout</Text>
                        
                        <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]} onPress={() => handleAssignOption('manual')}>
                            <View style={[styles.sheetOptionIcon, { backgroundColor: `${colors.chart4}20` }]}>
                                <MaterialCommunityIcons name="pencil-plus-outline" size={24} color={colors.chart4} />
                            </View>
                            <View>
                                <Text style={[styles.sheetOptionText, { color: colors.foreground }]}>Create Manually</Text>
                                <Text style={[styles.sheetOptionSub, { color: colors.mutedForeground }]}>Build a workout from scratch</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]} onPress={() => handleAssignOption('existing')}>
                            <View style={[styles.sheetOptionIcon, { backgroundColor: `${colors.chart1}20` }]}>
                                <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={colors.chart1} />
                            </View>
                            <View>
                                <Text style={[styles.sheetOptionText, { color: colors.foreground }]}>Copy Existing Routine</Text>
                                <Text style={[styles.sheetOptionSub, { color: colors.mutedForeground }]}>Select from your saved routines</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]} onPress={() => handleAssignOption('ai')}>
                            <View style={[styles.sheetOptionIcon, { backgroundColor: `${colors.warning}20` }]}>
                                <Ionicons name="sparkles" size={24} color={colors.warning} />
                            </View>
                            <View>
                                <Text style={[styles.sheetOptionText, { color: colors.foreground }]}>Generate with AI</Text>
                                <Text style={[styles.sheetOptionSub, { color: colors.mutedForeground }]}>Let AI build the perfect workout</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.sheetOption} onPress={() => handleAssignOption('community')}>
                            <View style={[styles.sheetOptionIcon, { backgroundColor: `${colors.success}20` }]}>
                                <Ionicons name="earth" size={24} color={colors.success} />
                            </View>
                            <View>
                                <Text style={[styles.sheetOptionText, { color: colors.foreground }]}>Community Workout</Text>
                                <Text style={[styles.sheetOptionSub, { color: colors.mutedForeground }]}>Browse trending workouts</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
    iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    saveBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
    saveText: { fontSize: 16, fontWeight: '700' },
    
    scrollContent: { padding: 20, paddingBottom: 100 },
    
    // Inputs (from RoutineEditor but adjusted for Template)
    inputGroup: { gap: 8, marginBottom: 16 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginLeft: 4, textTransform: 'uppercase' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, minHeight: 56, gap: 12 },
    mainInput: { flex: 1, fontSize: 16, fontWeight: '500', height: '100%' },
    
    sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
    sectionTitle: { fontSize: 20, fontWeight: '700' },
    
    daysScroll: { paddingBottom: 16, gap: 10, paddingHorizontal: 4 },
    dayPill: { width: 64, height: 80, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    dayText: { fontSize: 15, fontWeight: '600' },
    dayIndicator: { width: 6, height: 6, borderRadius: 3 },
    
    dayDetailCard: { minHeight: 250, borderRadius: 24, borderWidth: 1, padding: 20, marginTop: 8, elevation: 3, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
    dayDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dayDetailTitle: { fontSize: 22, fontWeight: '700' },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
    toggleText: { fontSize: 13, fontWeight: '700' },
    
    dayContent: { flex: 1 },
    noRoutine: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20 },
    noRoutineText: { fontSize: 15 },
    assignPrimaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, marginTop: 8, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    assignPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    
    routineAssigned: { paddingTop: 8 },
    routineAssignedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16 },
    routineIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    routineAssignedTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    routineAssignedMeta: { fontSize: 13 },
    
    exercisesList: { marginTop: 0 },
    exercisesListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
    exercisesListTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    
    exerciseCardModern: { paddingVertical: 12, borderBottomWidth: 1 },
    exCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    exCardIndex: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    exCardIndexText: { fontSize: 13, fontWeight: '800' },
    exCardName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    exCardMuscle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    exCardOptions: { padding: 4 },
    exCardStats: { flexDirection: 'row', gap: 8 },
    exStatBox: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
    exStatLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    exStatValue: { fontSize: 16, fontWeight: '700' },
    
    routineActionsRow: { flexDirection: 'row', gap: 12, paddingTop: 16, marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 6 },
    actionBtnText: { fontSize: 14, fontWeight: '700' },
    
    restDayView: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, borderStyle: 'dashed', borderWidth: 1, borderRadius: 20, borderColor: 'rgba(0,0,0,0.1)', marginTop: 8 },
    restDayText: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
    restDaySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    actionSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingHorizontal: 20 },
    sheetHandle: { width: 48, height: 5, borderRadius: 3, backgroundColor: 'rgba(150,150,150,0.3)', alignSelf: 'center', marginBottom: 24 },
    sheetTitle: { fontSize: 24, fontWeight: '700', marginBottom: 24, paddingLeft: 8 },
    sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8, gap: 16, borderRadius: 16, marginBottom: 4 },
    sheetOptionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sheetOptionText: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
    sheetOptionSub: { fontSize: 13 },
});
