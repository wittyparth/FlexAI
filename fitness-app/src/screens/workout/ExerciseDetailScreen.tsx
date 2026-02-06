import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const EXERCISE_DATA = {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The bench press is an upper-body weight training exercise in which the trainee presses a weight upwards while lying on a weight training bench.',
    instructions: [
        'Lie on the bench with your eyes under the bar.',
        'Grab the bar with a medium grip width.',
        'Unrack by straightening your arms.',
        'Lower the bar to your mid-chest.',
        'Press the bar back up until your arms are straight.'
    ],
    personalRecords: {
        oneRepMax: '245 lbs',
        bestVolume: '14,200 lbs',
        lastWeight: '185 lbs x 8'
    }
};

export function ExerciseDetailScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('About');

    const tabs = ['About', 'History', 'Charts'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Visual Header */}
                <View style={styles.visualHeader}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop' }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
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
                            <View style={[styles.tag, { backgroundColor: '#0da6f220' }]}>
                                <Text style={styles.tagText}>{EXERCISE_DATA.muscleGroup}</Text>
                            </View>
                            <View style={[styles.tag, { backgroundColor: '#ffffff20' }]}>
                                <Text style={[styles.tagText, { color: '#FFFFFF' }]}>{EXERCISE_DATA.difficulty}</Text>
                            </View>
                        </View>
                        <Text style={[styles.exerciseName, { fontFamily: fontFamilies.display }]}>
                            {EXERCISE_DATA.name}
                        </Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>1RM</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>{EXERCISE_DATA.personalRecords.oneRepMax}</Text>
                    </View>
                    <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: colors.border }]}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>MAX VOL</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>14.2k</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>LAST</Text>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>185x8</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.tab, activeTab === tab && { borderBottomColor: '#0da6f2', borderBottomWidth: 3 }]}
                        >
                            <Text style={[styles.tabText, { color: activeTab === tab ? '#0da6f2' : colors.mutedForeground }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content based on Tab */}
                <View style={styles.contentPadding}>
                    {activeTab === 'About' && (
                        <View>
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Instructions</Text>
                                {EXERCISE_DATA.instructions.map((step, idx) => (
                                    <View key={idx} style={styles.stepRow}>
                                        <View style={[styles.stepNumber, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.stepNumberText, { color: colors.foreground }]}>{idx + 1}</Text>
                                        </View>
                                        <Text style={[styles.stepText, { color: colors.mutedForeground }]}>{step}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Primary Muscles</Text>
                                <View style={styles.muscleBubbles}>
                                    <View style={[styles.muscleBubble, { backgroundColor: colors.card, borderColor: '#0da6f2' }]}>
                                        <MaterialCommunityIcons name="arm-flex" size={20} color="#0da6f2" />
                                        <Text style={[styles.muscleName, { color: colors.foreground }]}>Pectoralis Major</Text>
                                    </View>
                                    <View style={[styles.muscleBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <MaterialCommunityIcons name="arm-flex-outline" size={20} color={colors.mutedForeground} />
                                        <Text style={[styles.muscleName, { color: colors.mutedForeground }]}>Triceps</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'History' && (
                        <View style={styles.centeredContent}>
                            <MaterialCommunityIcons name="history" size={64} color={colors.muted} />
                            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Workout history placeholder</Text>
                        </View>
                    )}

                    {activeTab === 'Charts' && (
                        <View style={styles.centeredContent}>
                            <Ionicons name="stats-chart" size={64} color={colors.muted} />
                            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Performance charts placeholder</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Sticky Action */}
            <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ActiveWorkout')}>
                    <LinearGradient
                        colors={['#0da6f2', '#3b82f6']}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>Start with this Exercise</Text>
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    visualHeader: {
        height: 350,
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
        bottom: 30,
        left: 24,
        right: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        color: '#0da6f2',
        fontSize: 12,
        fontWeight: '800',
    },
    exerciseName: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    quickStats: {
        flexDirection: 'row',
        marginTop: -30,
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        backgroundColor: '#FFFFFF', // Need constant for shadow visibility in light mode
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
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
        marginTop: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '800',
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    muscleBubbles: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    muscleBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
    },
    muscleName: {
        fontSize: 14,
        fontWeight: '700',
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
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    primaryBtn: {
        height: 60,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
