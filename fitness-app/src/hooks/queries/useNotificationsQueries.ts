import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api';

export const notificationsKeys = {
    all: ['notifications'] as const,
    list: (limit?: number, offset?: number) => [...notificationsKeys.all, 'list', limit ?? 20, offset ?? 0] as const,
};

export const useNotifications = (params?: { limit?: number; offset?: number }) => {
    return useQuery({
        queryKey: notificationsKeys.list(params?.limit, params?.offset),
        queryFn: () => notificationsApi.getNotifications(params?.limit, params?.offset),
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => notificationsApi.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
        },
    });
};
