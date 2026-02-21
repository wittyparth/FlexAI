import apiClient from './client';

export interface NotificationItem {
    id: number;
    type: 'WORKOUT' | 'STREAK' | 'ACHIEVEMENT' | 'SOCIAL' | 'REMINDER' | 'SYSTEM';
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: string;
}

const normalizeNotificationType = (value: unknown): NotificationItem['type'] => {
    const raw = String(value ?? '').toUpperCase();
    if (raw === 'WORKOUT' || raw === 'STREAK' || raw === 'ACHIEVEMENT' || raw === 'SOCIAL' || raw === 'REMINDER' || raw === 'SYSTEM') {
        return raw;
    }
    return 'SYSTEM';
};

const normalizeNotification = (raw: any): NotificationItem => ({
    id: Number(raw?.id ?? 0),
    type: normalizeNotificationType(raw?.type),
    title: raw?.title ?? 'Notification',
    body: raw?.body ?? '',
    data: (raw?.data as Record<string, any>) ?? undefined,
    read: Boolean(raw?.read ?? raw?.isRead),
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
});

export const notificationsApi = {
    /**
     * Get user's notification history
     */
    getNotifications: async (limit = 20, offset = 0): Promise<NotificationItem[]> => {
        const response = await apiClient.get<{ success?: boolean; data?: any[] } | any[]>('/notifications', {
            params: { limit, offset },
        });

        const payload = Array.isArray(response.data)
            ? response.data
            : Array.isArray((response.data as any)?.data)
                ? (response.data as any).data
                : [];

        return payload.map(normalizeNotification);
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (notificationId: number): Promise<void> => {
        await apiClient.patch(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<void> => {
        await apiClient.patch('/notifications/read-all');
    },
};
