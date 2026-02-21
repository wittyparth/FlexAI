import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import type { NotificationItem } from '../../api/notifications.api';

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export function ActivityScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications({ limit: 50, offset: 0 });
    const markReadMutation = useMarkNotificationRead();
    const markAllMutation = useMarkAllNotificationsRead();

    const getIcon = (type: NotificationItem['type']) => {
        switch (type) {
            case 'SOCIAL':
                return { name: 'people', color: colors.primary.main as string };
            case 'ACHIEVEMENT':
                return { name: 'trophy', color: '#f59e0b' };
            case 'STREAK':
                return { name: 'flame', color: '#f97316' };
            case 'WORKOUT':
                return { name: 'barbell', color: '#22c55e' };
            case 'REMINDER':
                return { name: 'notifications', color: '#06b6d4' };
            case 'SYSTEM':
            default:
                return { name: 'information-circle', color: colors.mutedForeground as string };
        }
    };

    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const isMutating = markReadMutation.isPending || markAllMutation.isPending;

    const renderItem = ({ item }: { item: NotificationItem }) => {
        const icon = getIcon(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    { borderBottomColor: colors.border },
                    !item.read && { backgroundColor: `${colors.primary.main}08` },
                ]}
                onPress={() => {
                    if (!item.read) markReadMutation.mutate(item.id);
                }}
                disabled={isMutating}
            >
                <View style={styles.avatarWrap}>
                    <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
                        <MaterialCommunityIcons name="account" size={24} color={colors.mutedForeground} />
                    </View>
                    <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
                        <Ionicons name={icon.name as keyof typeof Ionicons.glyphMap} size={12} color="#FFF" />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.text, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.subText, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTimeAgo(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary.main }]} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Activity</Text>
                    <Text style={[styles.count, { color: colors.mutedForeground }]}>
                        {unreadCount} unread
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => markAllMutation.mutate()}
                    disabled={unreadCount === 0 || isMutating}
                >
                    {markAllMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.primary.main} />
                    ) : (
                        <Ionicons
                            name="checkmark-done"
                            size={22}
                            color={unreadCount === 0 ? colors.mutedForeground : colors.primary.main}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary.main} />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading activity...</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshing={isFetching}
                    onRefresh={refetch}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No activity yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
    btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    count: { fontSize: 11, marginTop: 2 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
    avatarWrap: { position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    iconBadge: { position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    content: { flex: 1 },
    text: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
    subText: { fontSize: 13, marginTop: 2, lineHeight: 18 },
    time: { fontSize: 12, marginTop: 6 },
    unreadDot: { width: 10, height: 10, borderRadius: 5 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 16, marginTop: 12 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { fontSize: 14, marginTop: 12 },
});
