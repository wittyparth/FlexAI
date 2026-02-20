import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useChallenges, useJoinChallenge } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { Challenge } from '../../api/leaderboard.api';

const { width } = Dimensions.get('window');

// Helper to calculate days left from end date
const getDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// Helper to calculate progress percentage
const getProgress = (challenge: Challenge): number => {
    if (!challenge.currentValue || !challenge.targetValue) return 0;
    return Math.round((challenge.currentValue / challenge.targetValue) * 100);
};

// Helper to get challenge status
const getChallengeStatus = (challenge: Challenge): 'active' | 'upcoming' | 'completed' => {
    if (challenge.isCompleted) return 'completed';
    const now = new Date();
    const start = new Date(challenge.startDate);
    if (start > now) return 'upcoming';
    return 'active';
};

// Placeholder images for challenges
const CHALLENGE_IMAGES: Record<string, string> = {
    volume: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    streak: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    workouts: 'https://images.unsplash.com/photo-1598971639058-fab3c03af60a?w=400',
    exercise: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    custom: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
};

type Tab = 'active' | 'upcoming' | 'completed';

export function ChallengesListScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<Tab>('active');

    // Fetch challenges from backend
    const { data: challengesData, isLoading, error } = useChallenges();
    const joinChallengeMutation = useJoinChallenge();

    // Filter challenges by status
    const filtered = useMemo(() => {
        const challenges = challengesData?.challenges || [];
        return challenges.filter(c => getChallengeStatus(c) === tab);
    }, [challengesData, tab]);

    // Handle loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Challenges</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading challenges...</Text>
                </View>
            </View>
        );
    }

    // Handle error state
    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Challenges</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>Failed to load challenges</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Challenges</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {(['active', 'upcoming', 'completed'] as Tab[]).map((t) => (
                    <TouchableOpacity key={t} style={[styles.tab, tab === t && { borderBottomColor: colors.primary.main }]} onPress={() => setTab(t)}>
                        <Text style={[styles.tabText, { color: tab === t ? colors.primary.main : colors.mutedForeground }]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {filtered.map((c) => {
                    const daysLeft = getDaysLeft(c.endDate);
                    const progress = getProgress(c);
                    const status = getChallengeStatus(c);
                    const imageUrl = CHALLENGE_IMAGES[c.type] || CHALLENGE_IMAGES.custom;

                    return (
                        <TouchableOpacity
                            key={c.id}
                            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('ChallengeDetail', { challengeId: c.id })}
                        >
                            <View style={styles.imgWrap}>
                                <Image source={{ uri: imageUrl }} style={styles.img} />
                                <View style={StyleSheet.absoluteFill} />
                                <View style={styles.imgContent}>
                                    <View style={[styles.badge, { backgroundColor: colors.primary.main }]}>
                                        <MaterialCommunityIcons name="star" size={14} color="#FFF" />
                                        <Text style={styles.badgeText}>{c.reward?.xp || 0} XP</Text>
                                    </View>
                                    {daysLeft > 0 && (
                                        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                            <Ionicons name="time-outline" size={14} color="#FFF" />
                                            <Text style={styles.badgeText}>{daysLeft}d left</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={styles.content}>
                                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>{c.name}</Text>
                                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{c.description}</Text>
                                <Text style={[styles.participants, { color: colors.mutedForeground }]}>
                                    {(c.participantsCount / 1000).toFixed(1)}K participants
                                </Text>
                                {status === 'active' && c.isJoined && (
                                    <View style={styles.progressWrap}>
                                        <View style={styles.progressRow}>
                                            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Progress</Text>
                                            <Text style={[styles.progressVal, { color: colors.primary.main }]}>{progress}%</Text>
                                        </View>
                                        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                                            <View
                                                style={[styles.progressFill, { width: `${progress}%` }]}
                                            />
                                        </View>
                                    </View>
                                )}
                                {status === 'upcoming' && !c.isJoined && (
                                    <TouchableOpacity
                                        style={styles.joinBtn}
                                        onPress={() => joinChallengeMutation.mutate(c.id)}
                                    >
                                        <View style={styles.joinGrad}>
                                            <Text style={styles.joinText}>
                                                {joinChallengeMutation.isPending ? 'Joining...' : 'Join Challenge'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {status === 'completed' && (
                                    <View style={[styles.completedBadge, { backgroundColor: `${colors.success}15` }]}>
                                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                        <Text style={[styles.completedText, { color: colors.success }]}>Completed!</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="flag-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No {tab} challenges</Text>
                    </View>
                )}
                <View style={{ height: insets.bottom + 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '700' },
    tabs: { flexDirection: 'row', borderBottomWidth: 1 },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabText: { fontSize: 15, fontWeight: '600' },
    scroll: { padding: 16 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
    imgWrap: { height: 130, position: 'relative' },
    img: { width: '100%', height: '100%' },
    imgContent: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    badgeText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    content: { padding: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    cardDesc: { fontSize: 14, marginBottom: 8 },
    participants: { fontSize: 13, marginBottom: 12 },
    progressWrap: { marginTop: 4 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 13, fontWeight: '600' },
    progressVal: { fontSize: 13, fontWeight: '700', fontFamily: fontFamilies.mono },
    progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    joinBtn: { marginTop: 4, borderRadius: 14, overflow: 'hidden' },
    joinGrad: { paddingVertical: 14, alignItems: 'center' },
    joinText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
    completedText: { fontSize: 15, fontWeight: '700' },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: 16, marginTop: 12 },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    errorText: { fontSize: 16, marginTop: 12 },
});
