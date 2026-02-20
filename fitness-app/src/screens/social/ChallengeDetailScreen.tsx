import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useChallengeDetail, useJoinChallenge, useLeaveChallenge } from '../../hooks/queries/useLeaderboardQueries';
import { fontFamilies } from '../../theme/typography';
import type { Challenge } from '../../api/leaderboard.api';

const { width } = Dimensions.get('window');

// Placeholder images for different challenge types
const CHALLENGE_IMAGES: Record<string, string> = {
    volume: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    streak: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    workouts: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800',
    exercise: 'https://images.unsplash.com/photo-1598971639058-fab3c03af60a?w=800',
    custom: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
};

// Helper to calculate days left
const getDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// Helper to format date
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to calculate progress
const getProgress = (challenge: Challenge): number => {
    if (challenge.currentValue === undefined || challenge.targetValue === 0) return 0;
    return Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100));
};

export function ChallengeDetailScreen({ route, navigation }: any) {
    const { challengeId } = route.params || {};
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Fetch challenge data
    const { data: challenge, isLoading, error } = useChallengeDetail(challengeId);
    const joinChallengeMutation = useJoinChallenge();
    const leaveChallengeMutation = useLeaveChallenge();

    // Handle loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.backBtn, { top: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading challenge...</Text>
                </View>
            </View>
        );
    }

    // Handle error state
    if (error || !challenge) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.backBtn, { top: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>Failed to load challenge</Text>
                </View>
            </View>
        );
    }

    const daysLeft = getDaysLeft(challenge.endDate);
    const progress = getProgress(challenge);
    const imageUrl = CHALLENGE_IMAGES[challenge.type] || CHALLENGE_IMAGES.custom;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.hero}>
                    <Image source={{ uri: imageUrl }} style={styles.heroImage} />
                    <View style={styles.heroOverlay} />
                    <TouchableOpacity style={[styles.backBtn, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.heroContent}>
                        <View style={[styles.rewardBadge, { backgroundColor: colors.primary.main }]}>
                            <MaterialCommunityIcons name="star" size={16} color="#FFF" />
                            <Text style={styles.rewardText}>{challenge.reward?.xp || 0} XP</Text>
                        </View>
                        <Text style={styles.heroTitle}>{challenge.name}</Text>
                        <Text style={styles.heroDates}>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Stats Row */}
                    <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>
                                {(challenge.participantsCount / 1000).toFixed(1)}K
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Participants</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{daysLeft}</Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days Left</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text style={[styles.statValue, { color: colors.primary.main }]}>{progress}%</Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Progress</Text>
                        </View>
                    </View>

                    {/* Your Progress (shown only if joined) */}
                    {challenge.isJoined && (
                        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Your Progress</Text>
                            <View style={styles.progressWrap}>
                                <View style={styles.progressRow}>
                                    <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                                        {challenge.currentValue || 0} / {challenge.targetValue}
                                    </Text>
                                    <Text style={[styles.progressVal, { color: colors.primary.main }]}>{progress}%</Text>
                                </View>
                                <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                    <View
                                        style={[styles.progressFill, { width: `${progress}%` }]}
                                    />
                                </View>
                            </View>
                            {challenge.isCompleted && (
                                <View style={[styles.completedBadge, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                    <Text style={[styles.completedText, { color: colors.success }]}>Challenge Completed!</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Description */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>About</Text>
                        <Text style={[styles.description, { color: colors.mutedForeground }]}>{challenge.description}</Text>
                    </View>

                    {/* Challenge Details */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Challenge Details</Text>
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.muted }]}>
                                <Ionicons name="trophy-outline" size={20} color={colors.primary.main} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Type</Text>
                                <Text style={[styles.detailValue, { color: colors.foreground }]}>
                                    {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.muted }]}>
                                <Ionicons name="flag-outline" size={20} color={colors.primary.main} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Target</Text>
                                <Text style={[styles.detailValue, { color: colors.foreground }]}>{challenge.targetValue}</Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.muted }]}>
                                <MaterialCommunityIcons name="gift-outline" size={20} color={colors.primary.main} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Reward</Text>
                                <Text style={[styles.detailValue, { color: colors.foreground }]}>
                                    {challenge.reward?.xp || 0} XP{challenge.reward?.badge ? ` + ${challenge.reward.badge}` : ''}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>

            {/* CTA Button */}
            {!challenge.isJoined && (
                <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.ctaBtn}
                        onPress={() => joinChallengeMutation.mutate(challenge.id)}
                        disabled={joinChallengeMutation.isPending}
                    >
                        <View style={styles.ctaGrad}>
                            <Text style={styles.ctaText}>
                                {joinChallengeMutation.isPending ? 'Joining...' : 'Join Challenge'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            {challenge.isJoined && !challenge.isCompleted && (
                <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.ctaBtn, styles.leaveBtn]}
                        onPress={() => leaveChallengeMutation.mutate(challenge.id)}
                        disabled={leaveChallengeMutation.isPending}
                    >
                        <View style={[styles.ctaGrad, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.ctaText, { color: colors.foreground }]}>
                                {leaveChallengeMutation.isPending ? 'Leaving...' : 'Leave Challenge'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    hero: { height: 280, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject },
    backBtn: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    heroContent: { position: 'absolute', bottom: 24, left: 20, right: 20 },
    rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 },
    rewardText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    heroTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', fontFamily: fontFamilies.display, marginBottom: 4 },
    heroDates: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    content: { padding: 16, gap: 16 },
    statsRow: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 16 },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: '800', fontFamily: fontFamilies.display },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, marginVertical: 4 },
    section: { borderRadius: 16, borderWidth: 1, padding: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    seeAll: { fontSize: 14, fontWeight: '600' },
    description: { fontSize: 15, lineHeight: 22 },
    ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    ruleDot: { width: 8, height: 8, borderRadius: 4 },
    ruleText: { fontSize: 14, flex: 1 },
    yourStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    yourStatItem: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12 },
    yourStatValue: { fontSize: 20, fontWeight: '800', fontFamily: fontFamilies.mono },
    yourStatLabel: { fontSize: 11, marginTop: 4 },
    progressWrap: {},
    progressBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 5 },
    participant: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    participantRank: { width: 28, fontSize: 14, fontWeight: '700', fontFamily: fontFamilies.mono },
    participantAvatar: { width: 40, height: 40, borderRadius: 20 },
    participantName: { flex: 1, fontSize: 15, fontWeight: '600' },
    participantScore: { fontSize: 15, fontWeight: '700', fontFamily: fontFamilies.mono },
    ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
    ctaBtn: { borderRadius: 16, overflow: 'hidden' },
    ctaGrad: { paddingVertical: 16, alignItems: 'center' },
    ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    leaveBtn: {},
    // Loading and error states
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, marginTop: 8 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { fontSize: 16, textAlign: 'center', marginTop: 8 },
    // Progress row
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressLabel: { fontSize: 14 },
    progressVal: { fontSize: 16, fontWeight: '700', fontFamily: fontFamilies.mono },
    // Completed badge
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginTop: 12 },
    completedText: { fontSize: 14, fontWeight: '600' },
    // Detail rows
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 12, marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: '600' },
});
