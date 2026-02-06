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

export const notificationsApi = {
    /**
     * Get user's notification history
     */
    getNotifications: async (limit = 20, offset = 0): Promise<NotificationItem[]> => {
        const response = await apiClient.get<NotificationItem[]>('/notifications', {
            params: { limit, offset },
        });
        return response.data;
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
