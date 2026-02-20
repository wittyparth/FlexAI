import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { HomeStackScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { gamificationApi, GamificationStats, XPGain } from '../../api/gamification.api';

// Mock data for development
const MOCK_STATS: GamificationStats = {
    xp: 2450,
    level: 12,
    levelProgress: 0.82,
    currentLevelXp: 2450,
    nextLevelXp: 3000,
    title: 'Elite',
    nextTitle: 'Champion',
    achievements: [
        { id: 1, name: 'First Workout', description: 'Complete your first workout', icon: 'trophy', unlockedAt: '2024-01-01' },
        { id: 2, name: '10 Workouts', description: 'Complete 10 workouts', icon: 'medal', unlockedAt: '2024-01-15' },
        { id: 3, name: 'Week Warrior', description: 'Work out every day for a week', icon: 'flame', unlockedAt: null, progress: 70 },
    ],
    recentXpGains: [
        { id: 1, amount: 150, source: 'WORKOUT', description: 'Upper Body Power', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: 2, amount: 50, source: 'STREAK', description: '5-Day Streak Bonus', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
        { id: 3, amount: 200, source: 'PR', description: 'New Bench Press PR', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function getXPSourceIcon(source: XPGain['source']): {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    getColor: (c: any) => string;
} {
    switch (source) {
        case 'WORKOUT':
            return { name: 'barbell-outline', color: '#1A1A1A', getColor: (c: any) => c.primary.main };
        case 'STREAK':
            return { name: 'flame', color: '#F59E0B', getColor: (c: any) => c.warning };
        case 'ACHIEVEMENT':
            return { name: 'trophy', color: '#F59E0B', getColor: (c: any) => c.warning };
        case 'PR':
            return { name: 'trophy-outline', color: '#10B981', getColor: (c: any) => c.success };
        case 'CHALLENGE':
            return { name: 'flag', color: '#7C3AED', getColor: (c: any) => c.chart4 };
        default:
            return { name: 'star', color: '#1A1A1A', getColor: (c: any) => c.primary.main };
    }
}

export function LevelXpModalScreen({ navigation }: HomeStackScreenProps<'XPLevelDetail'>) {
    const colors = useColors();

    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const data = await gamificationApi.getStats();
            setStats(data);
        } catch (err: any) {
            console.error('Failed to fetch gamification stats:', err);
            if (__DEV__) {
                console.log('Using mock gamification stats for development');
                setStats(MOCK_STATS);
            } else {
                setError(err.message || 'Failed to load stats');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, [fetchStats]);

    // Loading state
    if (loading && !refreshing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                    Loading your progress...
                </Text>
            </View>
        );
    }

    // Error state
    if (error || !stats) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {error || 'Failed to load stats'}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
                    onPress={fetchStats}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const xpToNextLevel = stats.nextLevelXp - stats.currentLevelXp;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
            >
                {/* Hero Card */}
                <Card variant="featured" style={styles.heroCard} padding="lg">
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary.main + '20' }]}>
                        <MaterialCommunityIcons name="trophy-award" size={48} color={colors.primary.main} />
                    </View>

                    <Text style={[styles.tierLabel, { color: colors.primary.main }]}>CURRENT TIER</Text>
                    <Text style={[styles.levelTitle, { color: colors.foreground }]}>
                        {stats.title} {stats.level}
                    </Text>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={[styles.progressBarBg, { backgroundColor: colors.slate[200] }]}>
                            <LinearGradient
                                colors={(colors.primary.gradient || [colors.primary.main, colors.primary.light]) as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${stats.levelProgress * 100}%` }]}
                            />
                        </View>
                        <View style={styles.xpRow}>
                            <Text style={[styles.xpCurrent, { color: colors.primary.main }]}>
                                {stats.currentLevelXp.toLocaleString()} XP
                            </Text>
                            <Text style={[styles.xpTotal, { color: colors.mutedForeground }]}>
                                {stats.nextLevelXp.toLocaleString()} XP
                            </Text>
                        </View>
                        <Text style={[styles.xpRemaining, { color: colors.mutedForeground }]}>
                            {xpToNextLevel.toLocaleString()} XP to {stats.nextTitle}
                        </Text>
                    </View>
                </Card>

                {/* Recent XP Gains */}
                {stats.recentXpGains && stats.recentXpGains.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                            Recent XP
                        </Text>
                        <Card style={styles.xpListCard}>
                            {stats.recentXpGains.map((gain, index) => {
                                const iconInfo = getXPSourceIcon(gain.source);
                                return (
                                    <View
                                        key={gain.id}
                                        style={[
                                            styles.xpItem,
                                            index < stats.recentXpGains.length - 1 && {
                                                borderBottomWidth: 1,
                                                borderBottomColor: colors.border,
                                            },
                                        ]}
                                    >
                                        <View style={[styles.xpIcon, { backgroundColor: iconInfo.color + '15' }]}>
                                            <Ionicons name={iconInfo.name} size={18} color={iconInfo.color} />
                                        </View>
                                        <View style={styles.xpContent}>
                                            <Text style={[styles.xpDescription, { color: colors.foreground }]}>
                                                {gain.description}
                                            </Text>
                                            <Text style={[styles.xpTime, { color: colors.mutedForeground }]}>
                                                {formatTimeAgo(gain.createdAt)}
                                            </Text>
                                        </View>
                                        <Text style={[styles.xpAmount, { color: colors.success }]}>
                                            +{gain.amount}
                                        </Text>
                                    </View>
                                );
                            })}
                        </Card>
                    </View>
                )}

                {/* How to Earn XP */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        How to Earn XP
                    </Text>
                    <View style={styles.earnMethods}>
                        <Card style={styles.methodCard}>
                            <View style={[styles.methodIcon, { backgroundColor: colors.success + '20' }]}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                            </View>
                            <View style={styles.methodContent}>
                                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Complete Workouts</Text>
                                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>+100-300 XP per session</Text>
                            </View>
                        </Card>

                        <Card style={styles.methodCard}>
                            <View style={[styles.methodIcon, { backgroundColor: colors.warning + '20' }]}>
                                <Ionicons name="flame" size={24} color={colors.warning} />
                            </View>
                            <View style={styles.methodContent}>
                                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Maintain Streak</Text>
                                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>+50 XP bonus daily</Text>
                            </View>
                        </Card>

                        <Card style={styles.methodCard}>
                            <View style={[styles.methodIcon, { backgroundColor: colors.warning + '20' }]}>
                                <MaterialCommunityIcons name="star-four-points" size={24} color={colors.warning} />
                            </View>
                            <View style={styles.methodContent}>
                                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Hit Personal Records</Text>
                                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>+200 XP per new record</Text>
                            </View>
                        </Card>

                        <Card style={styles.methodCard}>
                            <View style={[styles.methodIcon, { backgroundColor: colors.chart4 + '20' }]}>
                                <Ionicons name="flag" size={24} color={colors.chart4} />
                            </View>
                            <View style={styles.methodContent}>
                                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Complete Challenges</Text>
                                <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>+100-500 XP per challenge</Text>
                            </View>
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#FAFAFA',
        fontWeight: '600',
        fontSize: 14,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    heroCard: {
        alignItems: 'center',
        marginBottom: 24,
    },
    levelBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    tierLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    levelTitle: {
        fontSize: 32,
        fontFamily: fontFamilies.display,
        marginBottom: 20,
    },
    progressSection: {
        width: '100%',
    },
    progressBarBg: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    xpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    xpCurrent: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    xpTotal: {
        fontSize: 14,
        fontFamily: fontFamilies.mono,
    },
    xpRemaining: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: fontFamilies.display,
        marginBottom: 12,
    },
    xpListCard: {
        padding: 0,
        overflow: 'hidden',
    },
    xpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    xpIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    xpContent: {
        flex: 1,
    },
    xpDescription: {
        fontSize: 14,
        fontWeight: '500',
    },
    xpTime: {
        fontSize: 11,
        marginTop: 2,
    },
    xpAmount: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    earnMethods: {
        gap: 12,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodContent: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    methodDesc: {
        fontSize: 12,
    },
});
