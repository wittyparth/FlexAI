import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
    ActivityIndicator,
    Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useExerciseDetail } from '../../hooks/queries/useExerciseQueries';

const { width } = Dimensions.get('window');

export function ExerciseDetailScreen({ navigation, route }: any) {
    const { exerciseId } = route.params;
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('About');

    const { data: exercise, isLoading, error } = useExerciseDetail(exerciseId);

    const tabs = ['About', 'History', 'Charts'];

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
        );
    }

    if (error || !exercise) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.foreground }}>Failed to load exercise details.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary.main }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Visual Header */}
                <View style={styles.visualHeader}>
                    {exercise.thumbnailUrl ? (
                        <Image
                            source={{ uri: exercise.thumbnailUrl }}
                            style={styles.heroImage}
                        />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
                             <MaterialCommunityIcons name="dumbbell" size={80} color={colors.mutedForeground} />
                        </View>
                    )}
                    <View
                        style={styles.imageOverlay}
                    />

                    {/* Floating Controls */}
                    <View style={[styles.headerActions, { top: insets.top + 12 }]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.iconBtn}
                        >
                            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.heroContent}>
                        <View style={styles.badgeRow}>
                            <View style={[styles.tag, { backgroundColor: colors.primary.main }]}>
                                <Text style={styles.tagText}>{exercise.muscleGroup}</Text>
                            </View>
                            {exercise.difficulty && (
                                <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={[styles.tagText, { color: '#FFFFFF' }]}>
                                        {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                                    </Text>
                                </View>
                            )}
                            {exercise.exerciseType && (
                                <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={[styles.tagText, { color: '#FFFFFF' }]}>
                                        {exercise.exerciseType.charAt(0).toUpperCase() + exercise.exerciseType.slice(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.exerciseName, { fontFamily: fontFamilies.display }]}>
                            {exercise.name}
                        </Text>
                    </View>
                </View>

                {/* Quick Stats (Mocked Personal Records for this exercise) */}
                <View style={[styles.quickStats, { backgroundColor: colors.card, shadowColor: '#000' }]}>
                    <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>1RM</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>-</Text>
                    </View>
                    <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>MAX VOL</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>-</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>LAST</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>-</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary.main, borderBottomWidth: 3 }]}
                        >
                            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary.main : colors.mutedForeground }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content based on Tab */}
                <View style={styles.contentPadding}>
                    {activeTab === 'About' && (
                        <View>
                            {exercise.description && (
                                <Text style={[styles.descriptionText, { color: colors.foreground }]}>
                                    {exercise.description}
                                </Text>
                            )}

                            {exercise.videoUrl && (
                                <TouchableOpacity 
                                    style={[styles.videoBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => Linking.openURL(exercise.videoUrl!)}
                                >
                                    <View style={[styles.videoIconWrap, { backgroundColor: colors.primary.main + '20' }]}>
                                        <Ionicons name="play" size={24} color={colors.primary.main} />
                                    </View>
                                    <View>
                                        <Text style={[styles.videoTitle, { color: colors.foreground }]}>Watch Tutorial</Text>
                                        <Text style={[styles.videoSub, { color: colors.mutedForeground }]}>See proper form in action</Text>
                                    </View>
                                    <Ionicons name="open-outline" size={20} color={colors.mutedForeground} style={{ position: 'absolute', right: 16 }} />
                                </TouchableOpacity>
                            )}

                            {exercise.instructions && exercise.instructions.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Instructions</Text>
                                    {exercise.instructions.map((step, idx) => (
                                        <View key={idx} style={styles.stepRow}>
                                            <View style={[styles.stepNumber, { backgroundColor: colors.primary.main + '20' }]}>
                                                <Text style={[styles.stepNumberText, { color: colors.primary.main }]}>{idx + 1}</Text>
                                            </View>
                                            <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {((exercise.pros && exercise.pros.length > 0) || (exercise.cons && exercise.cons.length > 0)) && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Pros & Cons</Text>
                                    <View style={styles.prosConsContainer}>
                                        {exercise.pros?.map((pro, i) => (
                                            <View key={`pro-${i}`} style={styles.proConRow}>
                                                <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginTop: 2 }} />
                                                <Text style={[styles.proConText, { color: colors.foreground }]}>{pro}</Text>
                                            </View>
                                        ))}
                                        {exercise.cons?.map((con, i) => (
                                            <View key={`con-${i}`} style={styles.proConRow}>
                                                <Ionicons name="close-circle" size={20} color={colors.error} style={{ marginTop: 2 }} />
                                                <Text style={[styles.proConText, { color: colors.foreground }]}>{con}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Muscles Worked</Text>
                                <View style={styles.muscleBubbles}>
                                    <View style={[styles.muscleBubble, { backgroundColor: colors.primary.main + '10', borderColor: colors.primary.main }]}>
                                        <Text style={[styles.muscleLabel, { color: colors.primary.main }]}>Primary</Text>
                                        <Text style={[styles.muscleName, { color: colors.primary.main }]}>{exercise.muscleGroup}</Text>
                                    </View>
                                    {exercise.secondaryMuscleGroups?.map(muscle => (
                                        <View key={muscle} style={[styles.muscleBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                            <Text style={[styles.muscleLabel, { color: colors.mutedForeground }]}>Secondary</Text>
                                            <Text style={[styles.muscleName, { color: colors.foreground }]}>{muscle}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {exercise.equipmentList && exercise.equipmentList.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Equipment Required</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {exercise.equipmentList.map(eq => (
                                         <View key={eq} style={[styles.eqBadge, { backgroundColor: colors.muted }]}>
                                              <Text style={[styles.eqText, { color: colors.foreground }]}>{eq}</Text>
                                         </View>
                                    ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'History' && (
                        <View style={styles.centeredContent}>
                            <MaterialCommunityIcons name="history" size={64} color={colors.muted} />
                            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Workout history requires saved sessions.</Text>
                        </View>
                    )}

                    {activeTab === 'Charts' && (
                        <View style={styles.centeredContent}>
                            <Ionicons name="stats-chart" size={64} color={colors.muted} />
                            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Performance charts require saved sessions.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Sticky Action */}
            <View
                style={[styles.stickyFooter, { paddingBottom: insets.bottom + 96 }]}
                pointerEvents="box-none"
            >
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary.main }]} onPress={() => navigation.navigate('ActiveWorkout')}>
                    <Text style={styles.btnText}>Start with this Exercise</Text>
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualHeader: {
        height: 380,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerActions: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContent: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    exerciseName: {
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: '800',
        lineHeight: 40,
    },
    quickStats: {
        flexDirection: 'row',
        marginTop: -30,
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 20,
        elevation: 10,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 24,
        borderBottomWidth: 1,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '700',
    },
    contentPadding: {
        padding: 24,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
        opacity: 0.9,
    },
    videoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 32,
    },
    videoIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    videoSub: {
        fontSize: 13,
        fontWeight: '500',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 15,
        fontWeight: '800',
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        paddingTop: 4,
    },
    prosConsContainer: {
        gap: 12,
    },
    proConRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    proConText: {
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    muscleBubbles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    muscleBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    muscleLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    muscleName: {
        fontSize: 16,
        fontWeight: '800',
    },
    eqBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    eqText: {
        fontSize: 14,
        fontWeight: '600',
    },
    centeredContent: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    primaryBtn: {
        height: 60,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
});
