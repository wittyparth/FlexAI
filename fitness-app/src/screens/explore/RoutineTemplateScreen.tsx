import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
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
// MOCK DATA - Aligned with Routine/RoutineExercise schema
// ============================================================
const MOCK_ROUTINE = {
    id: 1,
    name: 'PPL - Push Day',
    description: 'Classic push workout targeting chest, shoulders, and triceps. Great for hypertrophy with progressive overload principles.',
    estimatedDuration: 60,
    difficulty: 'intermediate',
    isPublic: true,
    usageCount: 2400,
    rating: 4.8,
    exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: 90, muscle: 'Chest', icon: 'dumbbell' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 75, muscle: 'Upper Chest', icon: 'dumbbell' },
        { name: 'Overhead Press', sets: 4, reps: '8-10', rest: 90, muscle: 'Shoulders', icon: 'weight-lifter' },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest: 60, muscle: 'Chest', icon: 'cable-data' },
        { name: 'Lateral Raises', sets: 3, reps: '12-15', rest: 60, muscle: 'Shoulders', icon: 'human-handsup' },
        { name: 'Tricep Pushdown', sets: 3, reps: '10-12', rest: 60, muscle: 'Triceps', icon: 'arm-flex' },
    ],
    creator: { firstName: 'John', lastName: 'Doe', avatarUrl: 'https://i.pravatar.cc/100?img=11', level: 45 },
    tags: ['Push', 'Hypertrophy', 'PPL'],
};

export function RoutineTemplateScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [saving, setSaving] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const routine = MOCK_ROUTINE;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const totalSets = routine.exercises.reduce((sum, e) => sum + e.sets, 0);

    const saveToLibrary = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); navigation.goBack(); }, 1000);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Routine</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View
                        style={styles.heroCard}
                    >
                        {/* Tags */}
                        <View style={styles.tagRow}>
                            {routine.tags.map((tag, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.heroTitle}>{routine.name}</Text>
                        <Text style={styles.heroDesc}>{routine.description}</Text>

                        {/* Rating */}
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={18} color="#FFC107" />
                            <Text style={styles.ratingText}>{routine.rating}</Text>
                            <Text style={styles.usersText}>• {(routine.usageCount / 1000).toFixed(1)}k users</Text>
                        </View>

                        {/* Stats */}
                        <View style={styles.heroStats}>
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{routine.estimatedDuration}</Text>
                                <Text style={styles.heroStatLabel}>min</Text>
                            </View>
                            <View style={styles.heroStatDivider} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{routine.exercises.length}</Text>
                                <Text style={styles.heroStatLabel}>exercises</Text>
                            </View>
                            <View style={styles.heroStatDivider} />
                            <View style={styles.heroStat}>
                                <Text style={styles.heroStatValue}>{totalSets}</Text>
                                <Text style={styles.heroStatLabel}>sets</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Creator */}
                <View style={styles.section}>
                    <TouchableOpacity style={[styles.creatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Image source={{ uri: routine.creator.avatarUrl }} style={styles.creatorAvatar} />
                        <View style={styles.creatorInfo}>
                            <Text style={[styles.creatorName, { color: colors.foreground }]}>
                                {routine.creator.firstName} {routine.creator.lastName}
                            </Text>
                            <Text style={[styles.creatorMeta, { color: colors.mutedForeground }]}>Creator</Text>
                        </View>
                        <View style={[styles.levelBadge, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.levelText, { color: colors.primary.main }]}>Lv.{routine.creator.level}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>

                {/* Exercises */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Exercises</Text>
                    {routine.exercises.map((ex, index) => (
                        <Animated.View
                            key={index}
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
                            <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.exerciseNum, { backgroundColor: colors.primary.main }]}>
                                    <Text style={styles.exerciseNumText}>{index + 1}</Text>
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseName, { color: colors.foreground }]}>{ex.name}</Text>
                                    <Text style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>{ex.muscle}</Text>
                                </View>
                                <View style={styles.exerciseMeta}>
                                    <View style={[styles.metaBadge, { backgroundColor: colors.muted }]}>
                                        <Text style={[styles.metaText, { color: colors.foreground }]}>{ex.sets}×{ex.reps}</Text>
                                    </View>
                                    <View style={[styles.restBadge, { backgroundColor: `${colors.success}15` }]}>
                                        <Ionicons name="time-outline" size={12} color={colors.success} />
                                        <Text style={[styles.restText, { color: colors.success }]}>{ex.rest}s</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, { borderColor: colors.primary.main }]}
                    onPress={saveToLibrary}
                >
                    <Ionicons name={saving ? "checkmark" : "bookmark-outline"} size={20} color={colors.primary.main} />
                    <Text style={[styles.saveBtnText, { color: colors.primary.main }]}>{saving ? 'Saved!' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('ActiveWorkout')}
                    activeOpacity={0.9}
                >
                    <View
                        style={styles.startGradient}
                    >
                        <Ionicons name="play" size={22} color="#FFF" />
                        <Text style={styles.startText}>Start Workout</Text>
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
    heroCard: { margin: 16, borderRadius: 28, padding: 24, elevation: 10, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20 },
    tagRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    tagText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 10, fontFamily: fontFamilies.display },
    heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22, marginBottom: 16 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
    ratingText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    usersText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    heroStats: { flexDirection: 'row', justifyContent: 'space-around' },
    heroStat: { alignItems: 'center' },
    heroStatValue: { color: '#FFF', fontSize: 28, fontWeight: '800', fontFamily: fontFamilies.mono },
    heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
    heroStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
    section: { paddingHorizontal: 16, marginTop: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    creatorCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, gap: 14 },
    creatorAvatar: { width: 52, height: 52, borderRadius: 18 },
    creatorInfo: { flex: 1 },
    creatorName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    creatorMeta: { fontSize: 13 },
    levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    levelText: { fontSize: 12, fontWeight: '700', fontFamily: fontFamilies.mono },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
    exerciseNum: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    exerciseNumText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    exerciseMuscle: { fontSize: 13 },
    exerciseMeta: { alignItems: 'flex-end', gap: 6 },
    metaBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    metaText: { fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.mono },
    restBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
    restText: { fontSize: 12, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 },
    saveBtn: { flex: 0.35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 2, gap: 8 },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
    startBtn: { flex: 0.65, borderRadius: 16, overflow: 'hidden', elevation: 6, shadowColor: themeColors.primary.main, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
    startGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    startText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
