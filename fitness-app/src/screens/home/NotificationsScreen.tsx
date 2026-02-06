import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { HomeStackScreenProps } from '../../navigation/types';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamilies } from '../../theme/typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { notificationsApi, NotificationItem } from '../../api/notifications.api';

// Format relative time
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

// Get icon based on notification type
function getNotificationIcon(type: NotificationItem['type']): {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
} {
    switch (type) {
        case 'WORKOUT':
            return { name: 'barbell-outline', color: '#0052FF' };
        case 'STREAK':
            return { name: 'flame', color: '#f97316' };
        case 'ACHIEVEMENT':
            return { name: 'trophy', color: '#eab308' };
        case 'SOCIAL':
            return { name: 'people', color: '#8b5cf6' };
        case 'REMINDER':
            return { name: 'notifications', color: '#06b6d4' };
        case 'SYSTEM':
        default:
            return { name: 'information-circle', color: '#64748b' };
    }
}

// Mock data for development
const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 1,
        type: 'WORKOUT',
        title: 'Workout Completed!',
        body: 'Great job finishing your Upper Body workout. You burned 320 calories!',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
        id: 2,
        type: 'STREAK',
        title: '🔥 5-Day Streak!',
        body: "You're on fire! Keep the momentum going tomorrow.",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: 3,
        type: 'ACHIEVEMENT',
        title: 'Achievement Unlocked',
        body: 'You earned "First 10 Workouts" badge! Check your profile.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: 4,
        type: 'REMINDER',
        title: 'Time to Train',
        body: "It's been 2 days since your last workout. Ready to jump back in?",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
];

export function NotificationsScreen({ navigation }: HomeStackScreenProps<'HomeNotifications'>) {
    const colors = useColors();
    const { mode } = useTheme();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const data = await notificationsApi.getNotifications();
            setNotifications(data);
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err);
            // Use mock data in development
            if (__DEV__) {
                console.log('Using mock notifications for development');
                setNotifications(MOCK_NOTIFICATIONS);
            } else {
                setError(err.message || 'Failed to load notifications');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const renderItem = ({ item }: { item: NotificationItem }) => {
        const iconInfo = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => !item.read && handleMarkAsRead(item.id)}
            >
                <Card
                    style={[
                        styles.card,
                        !item.read && {
                            backgroundColor: mode === 'dark' ? '#1e293b' : colors.primary.main + '08',
                            borderLeftWidth: 3,
                            borderLeftColor: colors.primary.main,
                        },
                    ]}
                >
                    <View style={styles.row}>
                        {/* Icon */}
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor: iconInfo.color + '15',
                                },
                            ]}
                        >
                            <Ionicons
                                name={iconInfo.name}
                                size={22}
                                color={iconInfo.color}
                            />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <View style={styles.headerRow}>
                                <Text
                                    style={[
                                        styles.title,
                                        {
                                            color: colors.foreground,
                                            fontWeight: item.read ? '500' : '700',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                <Text style={[styles.time, { color: colors.mutedForeground }]}>
                                    {formatTimeAgo(item.createdAt)}
                                </Text>
                            </View>
                            <Text
                                style={[styles.message, { color: colors.mutedForeground }]}
                                numberOfLines={2}
                            >
                                {item.body}
                            </Text>
                        </View>

                        {/* Unread indicator */}
                        {!item.read && (
                            <View
                                style={[styles.unreadDot, { backgroundColor: colors.primary.main }]}
                            />
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    // Loading state
    if (loading && !refreshing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                    Loading notifications...
                </Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
                    onPress={fetchNotifications}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header with Mark All Read */}
            {unreadCount > 0 && (
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.unreadLabel, { color: colors.mutedForeground }]}>
                        {unreadCount} unread
                    </Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={[styles.markAllText, { color: colors.primary.main }]}>
                            Mark all as read
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notification List */}
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary.main}
                        colors={[colors.primary.main]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View
                            style={[
                                styles.emptyIconContainer,
                                { backgroundColor: colors.muted },
                            ]}
                        >
                            <Ionicons
                                name="notifications-off-outline"
                                size={48}
                                color={colors.mutedForeground}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                            No Notifications
                        </Text>
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            You're all caught up! Check back later for updates.
                        </Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
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
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    unreadLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    markAllText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        padding: 16,
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontFamily: fontFamilies.body,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 11,
        fontFamily: fontFamilies.body,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: fontFamilies.body,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
        gap: 12,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: fontFamilies.display,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
