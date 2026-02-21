/**
 * ChatHistoryScreen.tsx — Full Chat History
 *
 * Features:
 * - Filter tabs: All / Pinned / Today
 * - Sort toggle: Recent / A-Z
 * - Search across title + preview
 * - Grouped by time period
 * - Swipe-to-delete / long-press actions
 * - Message & model count badges
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ActionSheetIOS,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useChatStore, Conversation } from '../../store/chatStore';

type FilterTab = 'all' | 'pinned' | 'today';
type SortMode = 'recent' | 'az';

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

function getGroupLabel(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const ONE_DAY = 86400000;
    if (diff < ONE_DAY) return 'Today';
    if (diff < 2 * ONE_DAY) return 'Yesterday';
    if (diff < 7 * ONE_DAY) return 'This Week';
    if (diff < 30 * ONE_DAY) return 'Past 30 Days';
    return 'Older';
}

interface Section { label: string; data: Conversation[] }

export function ChatHistoryScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { conversations, deleteConversation, pinConversation, renameConversation } = useChatStore();

    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [sortMode, setSortMode] = useState<SortMode>('recent');

    const filtered = useMemo<Conversation[]>(() => {
        let result = [...conversations];

        // Tab filter
        if (activeTab === 'pinned') result = result.filter((c) => c.isPinned);
        else if (activeTab === 'today') {
            const ONE_DAY = 86400000;
            result = result.filter((c) => Date.now() - c.updatedAt < ONE_DAY);
        }

        // Search
        if (query.trim()) {
            result = result.filter(
                (c) =>
                    c.title.toLowerCase().includes(query.toLowerCase()) ||
                    c.preview.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Sort
        if (sortMode === 'recent') result.sort((a, b) => b.updatedAt - a.updatedAt);
        else result.sort((a, b) => a.title.localeCompare(b.title));

        return result;
    }, [conversations, query, activeTab, sortMode]);

    const sections = useMemo<Section[]>(() => {
        if (sortMode === 'az') {
            return filtered.length > 0 ? [{ label: 'A–Z', data: filtered }] : [];
        }
        const ORDER = ['Today', 'Yesterday', 'This Week', 'Past 30 Days', 'Older'];
        const groups: Record<string, Conversation[]> = {};
        for (const c of filtered) {
            const label = getGroupLabel(c.updatedAt);
            if (!groups[label]) groups[label] = [];
            groups[label].push(c);
        }
        return ORDER.filter((l) => groups[l]).map((l) => ({ label: l, data: groups[l] }));
    }, [filtered, sortMode]);

    const handleLongPress = (item: Conversation) => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [item.isPinned ? 'Unpin' : 'Pin', 'Delete', 'Cancel'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 2,
                },
                (idx) => {
                    if (idx === 0) pinConversation(item.id, !item.isPinned);
                    else if (idx === 1) confirmDelete(item.id);
                }
            );
        } else {
            Alert.alert(item.title, undefined, [
                { text: item.isPinned ? 'Unpin' : 'Pin', onPress: () => pinConversation(item.id, !item.isPinned) },
                { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(item.id) },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert('Delete Chat', 'This conversation will be permanently deleted.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(id) },
        ]);
    };

    const TABS: { id: FilterTab; label: string; icon: string }[] = [
        { id: 'all', label: 'All', icon: 'chatbubbles-outline' },
        { id: 'pinned', label: 'Pinned', icon: 'pin-outline' },
        { id: 'today', label: 'Today', icon: 'today-outline' },
    ];

    // Flatten sections
    const flatData = useMemo(() => {
        const out: ({ type: 'header'; label: string } | { type: 'item'; data: Conversation })[] = [];
        for (const s of sections) {
            if (sortMode === 'recent') out.push({ type: 'header', label: s.label });
            for (const d of s.data) {
                out.push({ type: 'item', data: d });
            }
        }
        return out;
    }, [sections, sortMode]);

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={[
                itemStyles.item,
                { backgroundColor: colors.card, borderColor: item.isPinned ? `${colors.primary.main}40` : colors.border },
                item.isPinned && { borderWidth: 1.5 },
            ]}
            onPress={() => navigation.navigate('CoachChat', { conversationId: item.id })}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={400}
            activeOpacity={0.85}
        >
            <View style={[itemStyles.iconWrap, { backgroundColor: `${colors.primary.main}15` }]}>
                <MaterialCommunityIcons name="robot-excited" size={20} color={colors.primary.main} />
                {item.isPinned && (
                    <View style={itemStyles.pinDot}>
                        <Ionicons name="pin" size={8} color={colors.primary.main} />
                    </View>
                )}
            </View>
            <View style={itemStyles.content}>
                <View style={itemStyles.topRow}>
                    <Text style={[itemStyles.title, { color: colors.foreground }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[itemStyles.time, { color: colors.mutedForeground }]}>
                        {formatTimestamp(item.updatedAt)}
                    </Text>
                </View>
                <Text style={[itemStyles.preview, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.preview}
                </Text>
                <View style={itemStyles.metaRow}>
                    <View style={[itemStyles.badge, { backgroundColor: `${colors.primary.main}12` }]}>
                        <Text style={[itemStyles.badgeText, { color: colors.primary.main }]}>
                            {item.messages.length} msgs
                        </Text>
                    </View>
                    {item.model && (
                        <View style={[itemStyles.badge, { backgroundColor: colors.border }]}>
                            <Text style={[itemStyles.badgeText, { color: colors.mutedForeground }]}>
                                {item.model === 'pro' ? 'Pro' : 'Fast'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={17} color={colors.mutedForeground} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    Chat History
                </Text>
                <View style={styles.headerRight}>
                    {/* Sort toggle */}
                    <TouchableOpacity
                        style={[styles.sortBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => setSortMode(sortMode === 'recent' ? 'az' : 'recent')}
                    >
                        <Ionicons
                            name={sortMode === 'recent' ? 'time-outline' : 'text-outline'}
                            size={14}
                            color={colors.mutedForeground}
                        />
                        <Text style={[styles.sortText, { color: colors.mutedForeground }]}>
                            {sortMode === 'recent' ? 'Recent' : 'A–Z'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.newBtn, { backgroundColor: colors.primary.main }]}
                        onPress={() => {
                            const { createConversation } = useChatStore.getState();
                            const cid = createConversation();
                            navigation.navigate('CoachChat', { conversationId: cid });
                        }}
                    >
                        <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search chats..."
                        placeholderTextColor={colors.mutedForeground}
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={[styles.tabRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[
                            styles.tab,
                            activeTab === tab.id && { borderBottomColor: colors.primary.main, borderBottomWidth: 2 },
                        ]}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={14}
                            color={activeTab === tab.id ? colors.primary.main : colors.mutedForeground}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab.id ? colors.primary.main : colors.mutedForeground },
                            activeTab === tab.id && { fontWeight: '700' },
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {flatData.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialCommunityIcons name="chat-sleep-outline" size={56} color={colors.mutedForeground} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                        {activeTab === 'pinned' ? 'No Pinned Chats' : activeTab === 'today' ? 'No Chats Today' : 'No Chats Yet'}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                        {activeTab === 'pinned'
                            ? 'Long-press a conversation to pin it'
                            : activeTab === 'today'
                            ? 'Start a conversation to see it here'
                            : 'Start a new conversation with your AI coach'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyBtn, { backgroundColor: colors.primary.main }]}
                        onPress={() => {
                            const { createConversation } = useChatStore.getState();
                            const cid = createConversation();
                            navigation.navigate('CoachChat', { conversationId: cid });
                        }}
                    >
                        <Text style={styles.emptyBtnText}>Start New Chat</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={flatData}
                    keyExtractor={(item, idx) =>
                        item.type === 'header' ? `header-${item.label}` : item.data.id
                    }
                    renderItem={({ item }) =>
                        item.type === 'header'
                            ? <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                            : renderItem({ item: item.data })
                    }
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const itemStyles = StyleSheet.create({
    item: {
        flexDirection: 'row', alignItems: 'center',
        padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 12,
    },
    iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    pinDot: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
    title: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
    time: { fontSize: 11 },
    preview: { fontSize: 12, lineHeight: 17, marginBottom: 6 },
    metaRow: { flexDirection: 'row', gap: 6 },
    badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '600' },
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 19, fontWeight: '700' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    sortText: { fontSize: 12, fontWeight: '600' },
    newBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

    searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, borderWidth: 1, gap: 8 },
    searchInput: { flex: 1, fontSize: 14 },

    tabRow: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
    tabText: { fontSize: 13, fontWeight: '500' },

    listContent: { paddingHorizontal: 16, paddingTop: 8 },
    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
    emptyTitle: { fontSize: 19, fontWeight: '700' },
    emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
    emptyBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 16 },
    emptyBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
