import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColors, useCoachConversations, useDeleteCoachConversation } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import type { CoachConversation } from '../../api/coach.api';

const QUICK_PROMPTS = [
    { id: 'workout', label: 'Build a workout', prompt: 'Create a push day workout for me' },
    { id: 'nutrition', label: 'Nutrition plan', prompt: 'How much protein do I need daily?' },
    { id: 'progress', label: 'Analyze progress', prompt: 'Analyze my progress this month' },
    { id: 'recovery', label: 'Recovery', prompt: 'How can I improve my recovery and sleep?' },
];

const formatTime = (value: string): string => {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
};

export function CoachHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const [query, setQuery] = useState('');

    const conversationsQuery = useCoachConversations();
    const deleteConversationMutation = useDeleteCoachConversation();

    const filteredConversations = useMemo(() => {
        const conversations = conversationsQuery.data ?? [];
        if (!query.trim()) return conversations;

        const q = query.toLowerCase();
        return conversations.filter((conversation) => {
            return (
                conversation.title.toLowerCase().includes(q) ||
                conversation.preview.toLowerCase().includes(q)
            );
        });
    }, [conversationsQuery.data, query]);

    const handleDeleteConversation = (conversation: CoachConversation) => {
        Alert.alert(
            'Delete conversation',
            'This conversation will be permanently removed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteConversationMutation.mutate(conversation.id),
                },
            ]
        );
    };

    const renderConversation = ({ item }: { item: CoachConversation }) => {
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('CoachChat', { conversationId: item.id })}
                onLongPress={() => handleDeleteConversation(item)}
                delayLongPress={300}
            >
                <View style={[styles.iconWrap, { backgroundColor: `${colors.primary.main}15` }]}>
                    <MaterialCommunityIcons name="robot-excited" size={18} color={colors.primary.main} />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.cardTime, { color: colors.mutedForeground }]}>
                            {formatTime(item.updatedAt)}
                        </Text>
                    </View>
                    <Text style={[styles.cardPreview, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {item.preview}
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>AI Coach</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ChatHistory')}>
                    <Ionicons name="time-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.newChatBtn, { backgroundColor: colors.primary.main }]}
                    onPress={() => navigation.navigate('CoachChat')}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.newChatText}>New Chat</Text>
                </TouchableOpacity>

                <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                    <Ionicons name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search conversations"
                        placeholderTextColor={colors.mutedForeground}
                        style={[styles.searchInput, { color: colors.foreground }]}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick prompts</Text>
                <FlatList
                    horizontal
                    data={QUICK_PROMPTS}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.promptList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('CoachChat', { initialPrompt: item.prompt })}
                        >
                            <Text style={[styles.promptLabel, { color: colors.foreground }]}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />

                <View style={styles.listHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conversations</Text>
                    {conversationsQuery.isFetching && (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                    )}
                </View>

                {conversationsQuery.isLoading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                        <Text style={[styles.stateText, { color: colors.mutedForeground }]}>Loading conversations...</Text>
                    </View>
                ) : conversationsQuery.isError ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
                        <Text style={[styles.stateText, { color: colors.error }]}>Failed to load conversations</Text>
                        <TouchableOpacity
                            style={[styles.retryBtn, { borderColor: colors.error }]}
                            onPress={() => conversationsQuery.refetch()}
                        >
                            <Text style={[styles.retryText, { color: colors.error }]}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredConversations}
                        keyExtractor={(item) => item.id}
                        renderItem={renderConversation}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.centerContent}>
                                <MaterialCommunityIcons name="chat-outline" size={40} color={colors.mutedForeground} />
                                <Text style={[styles.stateText, { color: colors.mutedForeground }]}>No conversations yet</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    newChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        paddingVertical: 14,
    },
    newChatText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    searchRow: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: '700',
    },
    promptList: {
        gap: 8,
        paddingBottom: 4,
    },
    promptCard: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    promptLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    listHeader: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 10,
    },
    stateText: {
        fontSize: 14,
    },
    retryBtn: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    retryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        gap: 10,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    cardTitle: {
        flex: 1,
        marginRight: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    cardTime: {
        fontSize: 11,
    },
    cardPreview: {
        fontSize: 12,
    },
});
