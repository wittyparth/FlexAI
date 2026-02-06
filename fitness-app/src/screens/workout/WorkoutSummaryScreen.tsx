import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA
// ============================================================
const ACHIEVEMENTS = [
    { id: 1, title: 'Early Bird', desc: 'Workout before 7AM', icon: 'emoji-events', color: '#FEF3C7', iconColor: '#D97706' },
    { id: 2, title: 'Heavy Lifter', desc: 'Total volume > 10k', icon: 'fitness-center', color: '#E0E7FF', iconColor: '#4F46E5' },
    { id: 3, title: 'Streak Master', desc: '7 day streak', icon: 'local-fire-department', color: '#F1F5F9', iconColor: '#94A3B8', locked: true },
];

const PERSONAL_RECORDS = [
    { id: 1, exercise: 'Bench Press', value: '225', prev: '215', unit: 'lbs' },
    { id: 2, exercise: 'Back Squat', value: '315', prev: '305', unit: 'lbs' },
];

export function WorkoutSummaryScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
                    <Text style={[styles.celebration, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        🎉 Workout{'\n'}Complete!
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                        Tuesday Morning Session • 1h 15m
                    </Text>
                </View>

                {/* Major Stats Card */}
                <View style={styles.statsCardContainer}>
                    <LinearGradient
                        colors={['#0da6f2', '#93c5fd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.statsCardGradient}
                    >
                        <View style={[styles.statsCardInner, { backgroundColor: colors.background }]}>
                            <View style={styles.statBox}>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>VOLUME</Text>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>
                                    12,450 <Text style={styles.statUnit}>lbs</Text>
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={[styles.statBox, { alignItems: 'flex-end' }]}>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>XP GAINED</Text>
                                <Text style={[styles.xpValue]}>+150</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Achievements */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>New Achievements</Text>
                        <View style={styles.badgeXp}>
                            <Text style={styles.badgeXpText}>3 New</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementScroll}>
                        {ACHIEVEMENTS.map(item => (
                            <View
                                key={item.id}
                                style={[
                                    styles.achievementCard,
                                    { backgroundColor: colors.muted, borderColor: colors.border },
                                    item.locked && { opacity: 0.6 }
                                ]}
                            >
                                {!item.locked && <View style={styles.pulseDot} />}
                                <View style={[styles.achievementIconCircle, { backgroundColor: item.color }]}>
                                    <MaterialCommunityIcons name={item.icon as any} size={28} color={item.iconColor} />
                                </View>
                                <View style={styles.achievementText}>
                                    <Text style={[styles.achievementTitle, { color: colors.foreground }]}>{item.title}</Text>
                                    <Text style={[styles.achievementDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Personal Records */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 16 }]}>Personal Records</Text>
                    {PERSONAL_RECORDS.map(pr => (
                        <View key={pr.id} style={[styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.ghostValue, { color: colors.foreground + '08' }]}>{pr.value}</Text>
                            <View style={styles.prContent}>
                                <View>
                                    <View style={styles.prHeader}>
                                        <Ionicons name="flash" size={20} color="#0da6f2" />
                                        <Text style={[styles.prExercise, { color: colors.foreground }]}>{pr.exercise}</Text>
                                    </View>
                                    <Text style={[styles.prPrev, { color: colors.mutedForeground }]}>Previous Best: {pr.prev} {pr.unit}</Text>
                                </View>
                                <View style={styles.prValues}>
                                    <Text style={[styles.prMainValue, { color: colors.foreground }]}>{pr.value}</Text>
                                    <Text style={styles.prUnitLabel}>{pr.unit}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                {/* Level Progress */}
                <View style={styles.levelProgress}>
                    <View style={styles.levelLabels}>
                        <Text style={[styles.levelText, { color: colors.mutedForeground }]}>LEVEL 12</Text>
                        <Text style={[styles.levelText, { color: colors.mutedForeground }]}>LEVEL 13</Text>
                    </View>
                    <View style={[styles.levelBarBg, { backgroundColor: colors.muted }]}>
                        <LinearGradient
                            colors={['#0da6f2', '#60a5fa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.levelBarFill, { width: '75%' }]}
                        />
                    </View>
                    <Text style={styles.xpFraction}>1,250 / 1,500 XP</Text>
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('WorkoutHub')}
                >
                    <LinearGradient
                        colors={['#0da6f2', '#3b82f6']}
                        style={styles.doneGradient}
                    >
                        <Text style={styles.doneText}>Done</Text>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
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
    scrollContent: {
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    celebration: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsCardContainer: {
        marginBottom: 32,
    },
    statsCardGradient: {
        borderRadius: 24,
        padding: 2,
    },
    statsCardInner: {
        flexDirection: 'row',
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
    },
    statBox: {
        flex: 1,
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    statUnit: {
        fontSize: 16,
        fontWeight: '400',
        color: '#94A3B8',
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: 20,
    },
    xpValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0da6f2',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    badgeXp: {
        backgroundColor: '#0da6f215',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeXpText: {
        color: '#0da6f2',
        fontSize: 11,
        fontWeight: '700',
    },
    achievementScroll: {
        gap: 16,
        paddingRight: 24,
    },
    achievementCard: {
        width: 140,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
    },
    pulseDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0da6f2',
    },
    achievementIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    achievementText: {
        alignItems: 'center',
    },
    achievementTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
    },
    achievementDesc: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    prCard: {
        height: 120,
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    ghostValue: {
        position: 'absolute',
        right: -10,
        fontSize: 100,
        fontWeight: '900',
        zIndex: 0,
    },
    prContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    prHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    prExercise: {
        fontSize: 18,
        fontWeight: '800',
    },
    prPrev: {
        fontSize: 13,
        fontWeight: '500',
    },
    prValues: {
        alignItems: 'flex-end',
    },
    prMainValue: {
        fontSize: 32,
        fontWeight: '900',
    },
    prUnitLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#0da6f2',
        textTransform: 'uppercase',
    },
    footer: {
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
    levelProgress: {
        marginBottom: 16,
    },
    levelLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    levelText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    levelBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    levelBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    xpFraction: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
        textAlign: 'right',
    },
    doneButton: {
        height: 60,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
    },
    doneGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    doneText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
