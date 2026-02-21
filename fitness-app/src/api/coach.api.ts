import apiClient, { ApiError } from './client';

export type CoachRole = 'user' | 'assistant';

export interface CoachMessage {
    id: string;
    conversationId: string;
    role: CoachRole;
    content: string;
    createdAt: string;
    contextData?: Record<string, unknown>;
}

export interface CoachConversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: CoachMessage[];
    preview: string;
}

export interface SendCoachMessageRequest {
    message: string;
    conversationId?: string | number;
}

export interface SendCoachMessageResponse {
    conversationId: string;
    message: CoachMessage;
}

const normalizeMessage = (raw: any): CoachMessage => ({
    id: String(raw?.id ?? ''),
    conversationId: String(raw?.conversationId ?? ''),
    role: raw?.role === 'assistant' ? 'assistant' : 'user',
    content: String(raw?.content ?? ''),
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    contextData: raw?.contextData && typeof raw.contextData === 'object' ? raw.contextData : undefined,
});

const normalizeConversation = (raw: any): CoachConversation => {
    const messages = Array.isArray(raw?.messages) ? raw.messages.map(normalizeMessage) : [];
    const lastMessage = messages[0]?.content ?? '';

    return {
        id: String(raw?.id ?? ''),
        title: String(raw?.title ?? 'New Conversation'),
        createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
        updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
        messages,
        preview: lastMessage || 'No messages yet',
    };
};

const unwrapData = <T>(raw: any): T => {
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return raw.data as T;
    }
    return raw as T;
};

export const coachApi = {
    sendMessage: async (payload: SendCoachMessageRequest): Promise<SendCoachMessageResponse> => {
        const body: { message: string; conversationId?: number } = {
            message: payload.message,
        };

        if (payload.conversationId !== undefined) {
            body.conversationId = Number(payload.conversationId);
        }

        const response = await apiClient.post('/coach/message', body, {
            timeout: 45000,
        });
        const data = unwrapData<any>(response.data);

        return {
            conversationId: String(data?.conversationId ?? ''),
            message: normalizeMessage(data?.message ?? {}),
        };
    },

    getConversations: async (): Promise<CoachConversation[]> => {
        const response = await apiClient.get('/coach/conversations');
        const payload = unwrapData<any[]>(response.data);
        if (!Array.isArray(payload)) return [];
        return payload.map(normalizeConversation);
    },

    getConversation: async (conversationId: string | number): Promise<CoachConversation> => {
        const response = await apiClient.get(`/coach/conversations/${conversationId}`);
        const payload = unwrapData<any>(response.data);
        return normalizeConversation(payload);
    },

    deleteConversation: async (conversationId: string | number): Promise<void> => {
        await apiClient.delete(`/coach/conversations/${conversationId}`);
    },
};

export const isCoachTimeoutError = (error: unknown): boolean => {
    const message = String((error as ApiError | undefined)?.message ?? '').toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
};
