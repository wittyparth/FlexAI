import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coachApi, SendCoachMessageRequest } from '../../api/coach.api';

export const coachKeys = {
    all: ['coach'] as const,
    conversations: () => [...coachKeys.all, 'conversations'] as const,
    conversation: (conversationId: string | number) =>
        [...coachKeys.all, 'conversation', String(conversationId)] as const,
};

export const useCoachConversations = () => {
    return useQuery({
        queryKey: coachKeys.conversations(),
        queryFn: coachApi.getConversations,
        staleTime: 1000 * 30,
    });
};

export const useCoachConversation = (conversationId?: string | number) => {
    return useQuery({
        queryKey: coachKeys.conversation(conversationId ?? 'new'),
        queryFn: () => coachApi.getConversation(conversationId as string | number),
        enabled: conversationId !== undefined && conversationId !== null && String(conversationId).length > 0,
    });
};

export const useSendCoachMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SendCoachMessageRequest) => coachApi.sendMessage(payload),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: coachKeys.conversations() });
            queryClient.invalidateQueries({
                queryKey: coachKeys.conversation(result.conversationId),
            });
        },
    });
};

export const useDeleteCoachConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (conversationId: string | number) => coachApi.deleteConversation(conversationId),
        onSuccess: (_, conversationId) => {
            queryClient.invalidateQueries({ queryKey: coachKeys.conversations() });
            queryClient.removeQueries({
                queryKey: coachKeys.conversation(conversationId),
            });
        },
    });
};
