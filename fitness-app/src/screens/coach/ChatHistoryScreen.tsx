import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColors, useCoachConversations, useDeleteCoachConversation } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import type { CoachConversation } from '../../api/coach.api';

const formatDate = (value: string): string => {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export function ChatHistoryScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const [query, setQuery] = useState('');

    const conversationsQuery = useCoachConversations();
    const deleteConversationMutation = useDeleteCoachConversation();

    const conversations = useMemo(() => {
        const data = conversationsQuery.data ?? [];
        if (!query.trim()) return data;

        const q = query.toLowerCase();
        return data.filter((conversation) => {
            return (
                conversation.title.toLowerCase().includes(q) ||
                conversation.preview.toLowerCase().includes(q)
            );
        });
    }, [conversationsQuery.data, query]);

    const confirmDelete = (conversation: CoachConversation) => {
        Alert.alert(
            'Delete conversation',
            'This action cannot be undone.',
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

    const renderItem = ({ item }: { item: CoachConversation }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('CoachChat', { conversationId: item.id })}
        >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.primary.main}15` }]}> 
                <MaterialCommunityIcons name="robot-excited" size={18} color={colors.primary.main} />
            </View>

            <View style={styles.itemContent}>
                <View style={styles.itemTopRow}>
                    <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatDate(item.updatedAt)}</Text>
                </View>
                <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.preview}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item)}
                disabled={deleteConversationMutation.isPending}
            >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Chat History</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('CoachChat')}>
                    <Ionicons name="add" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                    <Ionicons name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search conversations"
                        placeholderTextColor={colors.mutedForeground}
                        style={[styles.searchInput, { color: colors.foreground }]}
                    />
                </View>

                {conversationsQuery.isLoading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
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
                        data={conversations}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingVertical: 12, paddingBottom: insets.bottom + 80 }}
                        ListEmptyComponent={
                            <View style={styles.centerContent}>
                                <Text style={[styles.stateText, { color: colors.mutedForeground }]}>No conversations found</Text>
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
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    searchBar: {
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
    item: {
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
    itemContent: {
        flex: 1,
    },
    itemTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    title: {
        flex: 1,
        marginRight: 8,
        fontSize: 14,
        fontWeight: '600',
    },
    time: {
        fontSize: 11,
    },
    preview: {
        fontSize: 12,
    },
    deleteBtn: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
