import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Platform,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useWorkoutStore } from '../../store/workoutStore';
import { fontFamilies } from '../../theme/typography';
import { MOCK_ROUTINES } from '../../data/mockRoutines';

const { width } = Dimensions.get('window');

export function RoutineDetailScreen({ route, navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { routineId, mode, onSelect } = route.params || { routineId: 1 };

    // Find routine from mock data (supports both string and number ids)
    const routine = MOCK_ROUTINES.find(r => r.id === routineId || r.id === Number(routineId))
        ?? MOCK_ROUTINES[0];

    const exercises = routine.exercises || [];

    const handlePrimaryAction = () => {
        if (mode === 'select' && onSelect) {
            onSelect(routine.id);
            // Need to go back to TemplateEditor (2 screens back: Detail -> List -> TemplateEditor)
            // or we could just pass a return navigation logic
            // Assuming the picker flow was TemplateEditor -> RoutineList -> RoutineDetail
            // We can pop two screens off the stack
            navigation.pop(2); 
            return;
        }

        const routineIdNumber = Number(routine.id);
        const payload = Number.isFinite(routineIdNumber)
            ? { routineId: routineIdNumber, name: routine.name }
            : { name: routine.name };

        useWorkoutStore.getState()
            .startWorkout(payload)
            .then(() => navigation.navigate('ActiveWorkout'))
            .catch((error: any) => {
                Alert.alert('Unable to start workout', error?.message || 'Please try again.');
            });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ── TOP NAV BAR ── */}
            <View style={[styles.topBar, { paddingTop: insets.top + 12, backgroundColor: colors.background + 'F0' }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {routine.name}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 140, paddingTop: insets.top + 72 }}
            >
                {/* ── HEADER ── */}
                <View style={styles.headerSection}>
                    <View style={[styles.splitBadge, { backgroundColor: colors.primary.main + '20', borderColor: colors.primary.main + '40' }]}>
                        <Text style={[styles.splitBadgeText, { color: colors.primary.main }]}>
                            {routine.splitType || 'ROUTINE'} • {routine.daysPerWeek} DAYS/WEEK
                        </Text>
                    </View>
                    <Text style={[styles.routineTitle, { color: colors.foreground }]}>{routine.name}</Text>
                    <Text style={[styles.routineDesc, { color: colors.mutedForeground }]}>{routine.description}</Text>
                </View>

                {/* ── STATS STRIP ── */}
                <View style={[styles.statsStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary.main} />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{exercises.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Exercises</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary.main} />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{routine.estimatedDuration}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Min</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="signal" size={20} color={colors.primary.main} />
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{routine.difficulty}</Text>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Level</Text>
                    </View>
                </View>

                {/* ── START/SELECT BUTTON ── */}
                <View style={styles.startSection}>
                    <TouchableOpacity
                        onPress={handlePrimaryAction}
                        activeOpacity={0.88}
                        style={styles.startBtnWrapper}
                    >
                        <View
                            style={styles.startBtn}
                        >
                            <Ionicons name={mode === 'select' ? 'checkmark-circle' : 'play-circle'} size={26} color="#FFFFFF" />
                            <Text style={styles.startBtnText}>{mode === 'select' ? 'SELECT WORKOUT' : 'START WORKOUT'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── EXERCISES LIST ── */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Exercises</Text>
                    <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{exercises.length} movements</Text>
                </View>

                <View style={styles.exerciseList}>
                    {exercises.map((item: any, index: number) => {
                        const ex = item.exercise || item;
                        const sets = item.targetSets || 3;
                        const repsMin = item.targetRepsMin || 8;
                        const repsMax = item.targetRepsMax || 12;
                        const weight = item.targetWeight;
                        const rest = item.restSeconds || 90;
                        const muscle = ex.muscleGroup || 'Full Body';

                        return (
                            <View
                                key={ex.id + '-' + index}
                                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                {/* Index number */}
                                <View style={[styles.exerciseIndex, { backgroundColor: colors.primary.main + '15' }]}>
                                    <Text style={[styles.exerciseIndexText, { color: colors.primary.main }]}>
                                        {String(index + 1).padStart(2, '0')}
                                    </Text>
                                </View>

                                {/* Main info */}
                                <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                                        {ex.name}
                                    </Text>
                                    <View style={styles.exerciseMeta}>
                                        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{muscle}</Text>
                                        </View>
                                        <View style={[styles.tag, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{ex.exerciseType}</Text>
                                        </View>
                                    </View>

                                    {/* Sets / Reps / Rest pills */}
                                    <View style={styles.pillRow}>
                                        <View style={[styles.pill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <MaterialCommunityIcons name="replay" size={12} color={colors.primary.main} />
                                            <Text style={[styles.pillText, { color: colors.foreground }]}>{sets} sets</Text>
                                        </View>
                                        <View style={[styles.pill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <MaterialCommunityIcons name="pound" size={12} color={colors.primary.main} />
                                            <Text style={[styles.pillText, { color: colors.foreground }]}>{repsMin}–{repsMax} reps</Text>
                                        </View>
                                        {weight > 0 && (
                                            <View style={[styles.pill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                <MaterialCommunityIcons name="weight-kilogram" size={12} color={colors.primary.main} />
                                                <Text style={[styles.pillText, { color: colors.foreground }]}>{weight} kg</Text>
                                            </View>
                                        )}
                                        <View style={[styles.pill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <MaterialCommunityIcons name="timer-outline" size={12} color={colors.mutedForeground} />
                                            <Text style={[styles.pillText, { color: colors.mutedForeground }]}>{rest}s rest</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ── BOTTOM START/SELECT BUTTON (repeat at end of list) ── */}
                <View style={[styles.startSection, { marginTop: 8 }]}>
                    <TouchableOpacity
                        onPress={handlePrimaryAction}
                        activeOpacity={0.88}
                        style={styles.startBtnWrapper}
                    >
                        <View
                            style={styles.startBtn}
                        >
                            <Ionicons name={mode === 'select' ? 'checkmark-circle' : 'play-circle'} size={26} color="#FFFFFF" />
                            <Text style={styles.startBtnText}>{mode === 'select' ? 'SELECT WORKOUT' : 'START WORKOUT'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        zIndex: 10,
    },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 8,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    splitBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: 12,
    },
    splitBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    routineTitle: {
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 8,
        lineHeight: 36,
    },
    routineDesc: {
        fontSize: 14,
        lineHeight: 21,
    },
    statsStrip: {
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 36,
    },
    startSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    startBtnWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
    },
    startBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 1,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionCount: {
        fontSize: 13,
    },
    exerciseList: {
        paddingHorizontal: 16,
        gap: 10,
    },
    exerciseCard: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 12,
        alignItems: 'flex-start',
    },
    exerciseIndex: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
    },
    exerciseIndexText: {
        fontSize: 13,
        fontWeight: '800',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
    },
    exerciseMeta: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
