import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useRankings } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const { width } = Dimensions.get('window');

type Period = 'weekly' | 'monthly' | 'allTime';

export function LeaderboardScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState<Period>('weekly');

    // Fetch rankings from backend
    const { data: rankingsData, isLoading, error } = useRankings({ period });

    // Process rankings data
    const { top3, rankings } = useMemo(() => {
        const allUsers = rankingsData?.rankings || [];
        return {
            top3: allUsers.slice(0, 3),
            rankings: allUsers.slice(3),
        };
    }, [rankingsData]);

    const formatXP = (xp: number) => {
        if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
        return xp.toString();
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Gold
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Bronze
            default: return colors.mutedForeground;
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Leaderboard
                    </Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                        Loading rankings...
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        Leaderboard
                    </Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        Failed to load rankings
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    Leaderboard
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Period Selector */}
            <View style={[styles.periodSelector, { backgroundColor: colors.card }]}>
                {(['weekly', 'monthly', 'allTime'] as Period[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodTab, period === p && styles.periodTabActive]}
                        onPress={() => setPeriod(p)}
                    >
                        {period === p ? (
                            <View
                                style={styles.periodTabGradient}
                            >
                                <Text style={styles.periodTextActive}>
                                    {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
                                </Text>
                            </View>
                        ) : (
                            <Text style={[styles.periodText, { color: colors.mutedForeground }]}>
                                {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Podium Section */}
                {top3.length >= 3 && (
                    <View style={styles.podiumSection}>
                        {/* Second Place */}
                        <View style={[styles.podiumItem, styles.podiumSecond]}>
                            <View style={[styles.rankBadge, { backgroundColor: getRankColor(2) }]}>
                                <Text style={styles.rankBadgeText}>2</Text>
                            </View>
                            <Image source={{ uri: top3[1]?.user?.avatarUrl || 'https://i.pravatar.cc/150' }} style={[styles.podiumAvatar, styles.podiumAvatarSmall]} />
                            <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>
                                {top3[1]?.user?.firstName || 'User'}
                            </Text>
                            <Text style={[styles.podiumXP, { color: colors.primary.main }]}>
                                {formatXP(top3[1]?.score || 0)} XP
                            </Text>
                            <View style={[styles.podiumBar, styles.podiumBarSecond, { backgroundColor: colors.muted }]}>
                                <View
                                    style={styles.podiumBarFill}
                                />
                            </View>
                        </View>

                        {/* First Place */}
                        <View style={[styles.podiumItem, styles.podiumFirst]}>
                            <View style={[styles.crownContainer]}>
                                <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
                            </View>
                            <View style={[styles.rankBadge, styles.rankBadgeFirst, { backgroundColor: getRankColor(1) }]}>
                                <Text style={styles.rankBadgeText}>1</Text>
                            </View>
                            <View
                                style={styles.firstAvatarRing}
                            >
                                <View style={[styles.avatarInner, { backgroundColor: colors.card }]}>
                                    <Image source={{ uri: top3[0]?.user?.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.podiumAvatar} />
                                </View>
                            </View>
                            <Text style={[styles.podiumName, styles.podiumNameFirst, { color: colors.foreground }]} numberOfLines={1}>
                                {top3[0]?.user?.firstName || 'User'}
                            </Text>
                            <Text style={[styles.podiumXP, styles.podiumXPFirst, { color: colors.primary.main }]}>
                                {formatXP(top3[0]?.score || 0)} XP
                            </Text>
                            <View style={[styles.podiumBar, styles.podiumBarFirst, { backgroundColor: colors.muted }]}>
                                <View
                                    style={styles.podiumBarFill}
                                />
                            </View>
                        </View>

                        {/* Third Place */}
                        <View style={[styles.podiumItem, styles.podiumThird]}>
                            <View style={[styles.rankBadge, { backgroundColor: getRankColor(3) }]}>
                                <Text style={styles.rankBadgeText}>3</Text>
                            </View>
                            <Image source={{ uri: top3[2]?.user?.avatarUrl || 'https://i.pravatar.cc/150' }} style={[styles.podiumAvatar, styles.podiumAvatarSmall]} />
                            <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>
                                {top3[2]?.user?.firstName || 'User'}
                            </Text>
                            <Text style={[styles.podiumXP, { color: colors.primary.main }]}>
                                {formatXP(top3[2]?.score || 0)} XP
                            </Text>
                            <View style={[styles.podiumBar, styles.podiumBarThird, { backgroundColor: colors.muted }]}>
                                <View
                                    style={styles.podiumBarFill}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Rankings List */}
                <View style={[styles.rankingsList, { backgroundColor: colors.card }]}>
                    {rankings.map((entry) => (
                        <TouchableOpacity
                            key={entry.userId}
                            style={[
                                styles.rankItem,
                            ]}
                            onPress={() => navigation.navigate('UserProfile', { userId: String(entry.userId) })}
                        >
                            <Text style={[
                                styles.rankNumber,
                                { color: colors.mutedForeground }
                            ]}>
                                #{entry.rank}
                            </Text>
                            <Image source={{ uri: entry.user?.avatarUrl || 'https://i.pravatar.cc/150' }} style={styles.rankAvatar} />
                            <View style={styles.rankInfo}>
                                <Text style={[
                                    styles.rankUsername,
                                    { color: colors.foreground },
                                ]}>
                                    @{entry.user?.username || `${entry.user?.firstName?.toLowerCase() || 'user'}`}
                                </Text>
                                <Text style={[styles.rankName, { color: colors.mutedForeground }]}>
                                    {`${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim() || 'Unknown'}
                                </Text>
                            </View>
                            <View style={styles.rankStats}>
                                <Text style={[styles.rankXP, { color: colors.foreground }]}>{formatXP(entry.score)} XP</Text>
                                <View style={styles.changeIndicator}>
                                    {entry.change && entry.change !== 0 && (
                                        <>
                                            <Ionicons
                                                name={entry.change > 0 ? 'arrow-up' : 'arrow-down'}
                                                size={14}
                                                color={entry.change > 0 ? colors.success : colors.error}
                                            />
                                            <Text style={[
                                                styles.changeText,
                                                { color: entry.change > 0 ? colors.success : colors.error }
                                            ]}>
                                                {Math.abs(entry.change)}
                                            </Text>
                                        </>
                                    )}
                                    {(!entry.change || entry.change === 0) && (
                                        <Text style={[styles.changeText, { color: colors.mutedForeground }]}>—</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
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
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    periodTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    periodTabActive: {
        overflow: 'hidden',
    },
    periodTabGradient: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
    },
    periodTextActive: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    podiumSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 30,
    },
    podiumItem: {
        alignItems: 'center',
        flex: 1,
    },
    podiumFirst: {
        marginTop: -20,
    },
    podiumSecond: {},
    podiumThird: {},
    crownContainer: {
        marginBottom: 8,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -14,
        zIndex: 1,
    },
    rankBadgeFirst: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: -16,
    },
    rankBadgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        fontFamily: fontFamilies.mono,
    },
    firstAvatarRing: {
        width: 76,
        height: 76,
        borderRadius: 38,
        padding: 3,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        padding: 2,
    },
    podiumAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    podiumAvatarSmall: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    podiumName: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
        textAlign: 'center',
    },
    podiumNameFirst: {
        fontSize: 16,
    },
    podiumXP: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 4,
        fontFamily: fontFamilies.mono,
    },
    podiumXPFirst: {
        fontSize: 15,
    },
    podiumBar: {
        width: '80%',
        borderRadius: 8,
        marginTop: 12,
        overflow: 'hidden',
    },
    podiumBarFirst: {
        height: 80,
    },
    podiumBarSecond: {
        height: 60,
    },
    podiumBarThird: {
        height: 50,
    },
    podiumBarFill: {
        width: '100%',
        height: '100%',
    },
    rankingsList: {
        marginHorizontal: 16,
        borderRadius: 20,
        paddingVertical: 8,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 16,
    },
    rankNumber: {
        width: 36,
        fontSize: 14,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    rankAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    rankInfo: {
        flex: 1,
    },
    rankUsername: {
        fontSize: 15,
        fontWeight: '700',
    },
    rankName: {
        fontSize: 13,
        marginTop: 2,
    },
    rankStats: {
        alignItems: 'flex-end',
    },
    rankXP: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: fontFamilies.mono,
    },
    changeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
