/**
 * CoachHubScreen.tsx — ChatGPT-style AI Coach Home
 *
 * Features:
 * - Pinned conversations section
 * - New Chat CTA button
 * - Search bar
 * - Grouped history: Today / Yesterday / This Week / Earlier
 * - Swipe-to-delete with long-press reveal
 * - Long-press to rename / pin / delete
 * - 6 Quick prompt cards (horizontal scroll)
 * - AI Features section
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Alert,
    Modal,
    Pressable,
    Platform,
    ActionSheetIOS,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useChatStore, Conversation } from '../../store/chatStore';

// ─── Time Grouping ────────────────────────────────────────────────────────────

function getGroupLabel(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const ONE_DAY = 86400000;
    const ONE_WEEK = 7 * ONE_DAY;
    const ONE_MONTH = 30 * ONE_DAY;
    if (diff < ONE_DAY) return 'Today';
    if (diff < 2 * ONE_DAY) return 'Yesterday';
    if (diff < ONE_WEEK) return 'This Week';
    if (diff < ONE_MONTH) return 'Past 30 Days';
    return 'Older';
}

function groupConversations(conversations: Conversation[]): { label: string; items: Conversation[] }[] {
    const groups: Record<string, Conversation[]> = {};
    const ORDER = ['Today', 'Yesterday', 'This Week', 'Past 30 Days', 'Older'];
    for (const conv of conversations) {
        const label = getGroupLabel(conv.updatedAt);
        if (!groups[label]) groups[label] = [];
        groups[label].push(conv);
    }
    return ORDER.filter((label) => groups[label]).map((label) => ({ label, items: groups[label] }));
}

function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const ONE_MINUTE = 60000;
    const ONE_HOUR = 3600000;
    const ONE_DAY = 86400000;
    if (diff < ONE_MINUTE) return 'Just now';
    if (diff < ONE_HOUR) return `${Math.floor(diff / ONE_MINUTE)}m ago`;
    if (diff < ONE_DAY) return `${Math.floor(diff / ONE_HOUR)}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
    { id: 1, icon: 'barbell', label: 'Push Day\nWorkout', prompt: 'Create a push day workout for me', color: '#1E40AF' },
    { id: 2, icon: 'restaurant', label: 'Nutrition\nPlan', prompt: 'How much protein do I need daily?', color: '#065F46' },
    { id: 3, icon: 'trending-up', label: 'Analyze\nProgress', prompt: 'Analyze my progress this month', color: '#5B21B6' },
    { id: 4, icon: 'moon', label: 'Sleep\nOptimize', prompt: 'How can I optimize my sleep for better recovery?', color: '#1E3A8A' },
    { id: 5, icon: 'medical', label: 'Supplement\nGuide', prompt: 'What supplements should I take for muscle gain?', color: '#9D174D' },
    { id: 6, icon: 'flame', label: 'Set\nGoals', prompt: 'Help me set SMART fitness goals', color: '#B45309' },
];

// ─── Rename Modal ─────────────────────────────────────────────────────────────

interface RenameModalProps {
    visible: boolean;
    initialTitle: string;
    colors: any;
    onConfirm: (title: string) => void;
    onClose: () => void;
}

const RenameModal = ({ visible, initialTitle, colors, onConfirm, onClose }: RenameModalProps) => {
    const [value, setValue] = useState(initialTitle);

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={renameStyles.backdrop} onPress={onClose}>
                <View style={[renameStyles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[renameStyles.title, { color: colors.foreground }]}>Rename Chat</Text>
                    <TextInput
                        style={[renameStyles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                        value={value}
                        onChangeText={setValue}
                        autoFocus
                        selectTextOnFocus
                        maxLength={60}
                        placeholderTextColor={colors.mutedForeground}
                    />
                    <View style={renameStyles.btnRow}>
                        <TouchableOpacity style={[renameStyles.btn, { borderColor: colors.border }]} onPress={onClose}>
                            <Text style={{ color: colors.mutedForeground, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[renameStyles.btn, { backgroundColor: colors.primary.main, borderColor: colors.primary.main }]}
                            onPress={() => { onConfirm(value); onClose(); }}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>Rename</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const renameStyles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    sheet: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 16 },
    title: { fontSize: 18, fontWeight: '700' },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
    btnRow: { flexDirection: 'row', gap: 12 },
    btn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConvoItemProps {
    item: Conversation;
    colors: any;
    onPress: () => void;
    onLongPress: () => void;
}

const ConvoItem = ({ item, colors, onPress, onLongPress }: ConvoItemProps) => {
    const messageCount = item.messages.length;

    return (
        <TouchableOpacity
            style={[
                convoStyles.item,
                { backgroundColor: colors.card, borderColor: item.isPinned ? `${colors.primary.main}40` : colors.border },
                item.isPinned && { borderWidth: 1.5 },
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={400}
            activeOpacity={0.85}
        >
            {/* Icon */}
            <View style={[convoStyles.iconWrap, { backgroundColor: item.isPinned ? `${colors.primary.main}20` : `${colors.primary.main}12` }]}>
                <MaterialCommunityIcons name="robot-excited" size={20} color={colors.primary.main} />
                {item.isPinned && (
                    <View style={convoStyles.pinBadge}>
                        <Ionicons name="pin" size={8} color={colors.primary.main} />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={convoStyles.content}>
                <View style={convoStyles.topRow}>
                    <Text style={[convoStyles.title, { color: colors.foreground }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[convoStyles.time, { color: colors.mutedForeground }]}>
                        {formatTimestamp(item.updatedAt)}
                    </Text>
                </View>
                <Text style={[convoStyles.preview, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.preview}
                </Text>
                <View style={convoStyles.metaRow}>
                    <Ionicons name="chatbubble-outline" size={10} color={colors.mutedForeground} />
                    <Text style={[convoStyles.metaText, { color: colors.mutedForeground }]}>
                        {messageCount} message{messageCount !== 1 ? 's' : ''}
                    </Text>
                    {item.model && (
                        <>
                            <Text style={[convoStyles.metaDot, { color: colors.mutedForeground }]}>·</Text>
                            <Text style={[convoStyles.metaText, { color: colors.mutedForeground }]}>
                                {item.model === 'pro' ? '⚡ Pro' : '🚀 Fast'}
                            </Text>
                        </>
                    )}
                </View>
            </View>

            <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
    );
};

const convoStyles = StyleSheet.create({
    item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 8, gap: 12 },
    iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    pinBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
    title: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
    time: { fontSize: 11, flexShrink: 0 },
    preview: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11 },
    metaDot: { fontSize: 11 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function CoachHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const {
        conversations,
        createConversation,
        deleteConversation,
        renameConversation,
        pinConversation,
    } = useChatStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);

    const unpinnedConversations = useMemo(() => {
        const sorted = [...conversations]
            .filter((c) => !c.isPinned)
            .sort((a, b) => b.updatedAt - a.updatedAt);
        if (!searchQuery.trim()) return sorted;
        return sorted.filter(
            (c) =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.preview.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const pinnedConversations = useMemo(() => {
        return conversations.filter((c) => c.isPinned).sort((a, b) => b.updatedAt - a.updatedAt);
    }, [conversations]);

    const groupedConversations = useMemo(
        () => groupConversations(unpinnedConversations),
        [unpinnedConversations]
    );

    const handleNewChat = () => {
        const cid = createConversation();
        navigation.navigate('CoachChat', { conversationId: cid });
    };

    const handleOpenChat = (conv: Conversation) => {
        navigation.navigate('CoachChat', { conversationId: conv.id });
    };

    const handleLongPress = (item: Conversation) => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        item.isPinned ? 'Unpin' : 'Pin',
                        'Rename',
                        'Delete',
                        'Cancel',
                    ],
                    destructiveButtonIndex: 2,
                    cancelButtonIndex: 3,
                },
                (idx) => {
                    if (idx === 0) pinConversation(item.id, !item.isPinned);
                    else if (idx === 1) setRenameTarget({ id: item.id, title: item.title });
                    else if (idx === 2) {
                        Alert.alert('Delete Conversation', 'This will permanently delete the conversation.', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(item.id) },
                        ]);
                    }
                }
            );
        } else {
            Alert.alert(item.title, undefined, [
                { text: item.isPinned ? 'Unpin' : 'Pin', onPress: () => pinConversation(item.id, !item.isPinned) },
                { text: 'Rename', onPress: () => setRenameTarget({ id: item.id, title: item.title }) },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: () => Alert.alert('Delete Conversation', 'This will permanently delete the conversation.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(item.id) },
                    ]),
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        const cid = createConversation(prompt);
        navigation.navigate('CoachChat', { conversationId: cid, initialPrompt: prompt });
    };

    const totalChats = conversations.length;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ── Header ── */}
            <View
                style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleGroup}>
                        <MaterialCommunityIcons name="robot-excited" size={20} color={colors.primary.main} />
                        <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display, color: colors.foreground }]}>AI Coach</Text>
                    </View>

                    <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ChatHistory')}>
                        <Ionicons name="time-outline" size={22} color={colors.foreground} />
                    </TouchableOpacity>
                </View>

                {/* New Chat Button */}
                <TouchableOpacity style={[styles.newChatBtn, { backgroundColor: colors.primary.main }]} onPress={handleNewChat} activeOpacity={0.9}>
                    <View style={styles.newChatInner}>
                        <Ionicons name="add" size={20} color="#FFF" />
                        <Text style={[styles.newChatText, { color: "#FFF" }]}>New Chat</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                {/* ── Search Bar ── */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={17} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.foreground }]}
                            placeholder="Search conversations..."
                            placeholderTextColor={colors.mutedForeground}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={17} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── Quick Prompts ── */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Start</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsRow}>
                        {QUICK_PROMPTS.map((qp) => (
                            <TouchableOpacity
                                key={qp.id}
                                style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => handleQuickPrompt(qp.prompt)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.promptIconWrapper, { backgroundColor: qp.color }]}>
                                    <Ionicons name={qp.icon as any} size={24} color="#FFF" />
                                </View>
                                <Text style={[styles.promptLabel, { color: colors.foreground }]}>{qp.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Pinned Conversations ── */}
                {pinnedConversations.length > 0 && !searchQuery && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="pin" size={14} color={colors.primary.main} />
                                <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Pinned</Text>
                            </View>
                        </View>
                        {pinnedConversations.map((item) => (
                            <ConvoItem
                                key={item.id}
                                item={item}
                                colors={colors}
                                onPress={() => handleOpenChat(item)}
                                onLongPress={() => handleLongPress(item)}
                            />
                        ))}
                    </View>
                )}

                {/* ── Conversation History ── */}
                {groupedConversations.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conversations</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ChatHistory')}>
                                <Text style={[styles.seeAll, { color: colors.primary.main }]}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {groupedConversations.map((group) => (
                            <View key={group.label}>
                                <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
                                    {group.label}
                                </Text>
                                {group.items.slice(0, 5).map((item) => (
                                    <ConvoItem
                                        key={item.id}
                                        item={item}
                                        colors={colors}
                                        onPress={() => handleOpenChat(item)}
                                        onLongPress={() => handleLongPress(item)}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyHistory}>
                        <MaterialCommunityIcons name="chat-outline" size={48} color={colors.mutedForeground} style={{ opacity: 0.4 }} />
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            {searchQuery ? 'No results found' : 'No conversations yet'}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                            {searchQuery ? 'Try a different search term' : 'Start a new chat to get personalized fitness guidance'}
                        </Text>
                    </View>
                )}

                {/* ── AI Features ── */}
                <View style={[styles.section, styles.featuresSection]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Features</Text>

                    <TouchableOpacity
                        style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('FormAnalysis')}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.featureIcon, { backgroundColor: '#7C3AED' }]}>
                            <Ionicons name="videocam" size={22} color="#FFF" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={[styles.featureTitle, { color: colors.foreground }]}>Form Analysis</Text>
                            <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                                AI-powered lift technique feedback
                            </Text>
                            <View style={[styles.featureBadge, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Text style={[styles.featureBadgeText, { color: colors.primary.main }]}>Beta · Free</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>

                    <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.55 }]}>
                        <View style={[styles.featureIcon, { backgroundColor: '#D97706' }]}>
                            <Ionicons name="bar-chart" size={22} color="#FFF" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={[styles.featureTitle, { color: colors.foreground }]}>AI Program Builder</Text>
                            <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                                Personalized training plans generated by AI
                            </Text>
                            <View style={[styles.featureBadge, { backgroundColor: '#F59E0B20' }]}>
                                <Text style={[styles.featureBadgeText, { color: '#F59E0B' }]}>Coming Soon</Text>
                            </View>
                        </View>
                        <Ionicons name="lock-closed" size={16} color={colors.mutedForeground} />
                    </View>
                </View>
            </ScrollView>

            {/* Rename Modal */}
            {renameTarget && (
                <RenameModal
                    visible={!!renameTarget}
                    initialTitle={renameTarget.title}
                    colors={colors}
                    onConfirm={(title) => renameConversation(renameTarget.id, title)}
                    onClose={() => setRenameTarget(null)}
                />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: { paddingHorizontal: 12, paddingBottom: 20 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },

    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

    newChatBtn: { backgroundColor: '#FFFFFF', borderRadius: 22 },
    newChatInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    newChatText: { fontSize: 17, fontWeight: '700' },

    // Search
    searchSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1, gap: 10 },
    searchInput: { flex: 1, fontSize: 14 },

    // Sections
    section: { paddingHorizontal: 16, marginTop: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
    seeAll: { fontSize: 14, fontWeight: '600' },
    groupLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },

    // Quick Prompts
    promptsRow: { gap: 10, paddingBottom: 4 },
    promptCard: { width: 100, borderRadius: 18, borderWidth: 1, padding: 12, alignItems: 'center', gap: 8 },
    promptIconWrapper: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    promptEmoji: { fontSize: 24 },
    promptLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', lineHeight: 17 },

    // Empty State
    emptyHistory: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 40, gap: 10 },
    emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
    emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

    // Features
    featuresSection: { marginTop: 24 },
    featureCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    featureContent: { flex: 1, gap: 3 },
    featureTitle: { fontSize: 15, fontWeight: '700' },
    featureDesc: { fontSize: 12, lineHeight: 17 },
    featureBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
    featureBadgeText: { fontSize: 10, fontWeight: '700' },
});
