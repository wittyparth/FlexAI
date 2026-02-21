import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColors, useCoachConversation, useSendCoachMessage } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { isCoachTimeoutError } from '../../api/coach.api';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

interface DisplayMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    pending?: boolean;
}

const formatCoachError = (error: unknown): string => {
    if (isCoachTimeoutError(error)) {
        return 'Coach response timed out. Please try again.';
    }

    const message = String((error as any)?.message ?? 'Failed to send message.');
    if (message.toLowerCase().includes('failed to process message')) {
        return 'Coach is temporarily unavailable. Please try again in a moment.';
    }

    return message;
};

export function CoachChatScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const initialConversationId = route?.params?.conversationId
        ? String(route.params.conversationId)
        : undefined;
    const initialPrompt = route?.params?.initialPrompt
        ? String(route.params.initialPrompt)
        : undefined;

    const [activeConversationId, setActiveConversationId] = useState<string | undefined>(initialConversationId);
    const [input, setInput] = useState('');
    const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    const initialPromptSentRef = useRef(false);
    const scrollRef = useRef<ScrollView>(null);

    const conversationQuery = useCoachConversation(activeConversationId);
    const sendMessageMutation = useSendCoachMessage();

    const messages = useMemo<DisplayMessage[]>(() => {
        const baseMessages: DisplayMessage[] = (conversationQuery.data?.messages ?? []).map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
        }));

        if (pendingUserMessage) {
            baseMessages.push({
                id: 'pending-user-message',
                role: 'user',
                content: pendingUserMessage,
                createdAt: new Date().toISOString(),
                pending: true,
            });
        }

        if (sendMessageMutation.isPending) {
            baseMessages.push({
                id: 'pending-assistant-message',
                role: 'assistant',
                content: 'Thinking...',
                createdAt: new Date().toISOString(),
                pending: true,
            });
        }

        return baseMessages;
    }, [conversationQuery.data?.messages, pendingUserMessage, sendMessageMutation.isPending]);

    const sendMessage = async (rawMessage: string) => {
        const message = rawMessage.trim();
        if (!message || sendMessageMutation.isPending) return;

        setErrorText(null);
        setPendingUserMessage(message);
        setInput('');

        try {
            const result = await sendMessageMutation.mutateAsync({
                message,
                conversationId: activeConversationId,
            });

            setPendingUserMessage(null);

            if (result.conversationId && result.conversationId !== activeConversationId) {
                setActiveConversationId(result.conversationId);
                return;
            }

            await conversationQuery.refetch();
        } catch (error) {
            setInput(message);
            setPendingUserMessage(null);
            setErrorText(formatCoachError(error));
        }
    };

    useEffect(() => {
        if (!initialPrompt || initialPromptSentRef.current) return;
        initialPromptSentRef.current = true;
        sendMessage(initialPrompt);
    }, [initialPrompt]);

    useEffect(() => {
        if (!activeConversationId) return;
        conversationQuery.refetch();
    }, [activeConversationId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 60);

        return () => clearTimeout(timer);
    }, [messages.length, sendMessageMutation.isPending]);

    const headerTitle = conversationQuery.data?.title ?? 'New Chat';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>

                <View style={styles.headerTitleWrap}>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {headerTitle}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                        {sendMessageMutation.isPending ? 'Responding...' : 'AI Coach'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('ChatHistory')}>
                    <Ionicons name="time-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {conversationQuery.isLoading && !messages.length ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                ) : (
                    <ScrollView
                        ref={scrollRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.length === 0 && (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary.main}15` }]}> 
                                    <MaterialCommunityIcons name="robot-excited" size={30} color={colors.primary.main} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Ask your coach anything</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Training, nutrition, recovery, and form guidance.</Text>
                            </View>
                        )}

                        {messages.map((message) => {
                            const isUser = message.role === 'user';
                            return (
                                <View
                                    key={message.id}
                                    style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
                                >
                                    {!isUser && (
                                        <View style={[styles.avatar, { backgroundColor: colors.primary.main }]}> 
                                            <MaterialCommunityIcons name="robot-excited" size={14} color="#FFF" />
                                        </View>
                                    )}

                                    <View
                                        style={[
                                            styles.messageBubble,
                                            isUser
                                                ? [styles.userBubble, { backgroundColor: colors.primary.main }]
                                                : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                                            message.pending && styles.pendingBubble,
                                        ]}
                                    >
                                        {isUser ? (
                                            <Text style={styles.userText}>{message.content}</Text>
                                        ) : (
                                            <MarkdownRenderer
                                                content={message.content}
                                                textColor={colors.foreground}
                                                mutedColor={colors.mutedForeground}
                                                codeBackground={colors.background}
                                                codeBorder={colors.border}
                                                primaryColor={colors.primary.main}
                                                fontSize={15}
                                                lineHeight={22}
                                            />
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                )}

                {errorText && (
                    <View style={[styles.errorBanner, { backgroundColor: `${colors.error}15`, borderColor: `${colors.error}40` }]}> 
                        <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                        <Text style={[styles.errorText, { color: colors.error }]}>{errorText}</Text>
                    </View>
                )}

                <View style={[styles.inputWrap, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}> 
                    <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="Message AI Coach"
                            placeholderTextColor={colors.mutedForeground}
                            multiline
                            maxLength={2000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: input.trim() ? colors.primary.main : colors.mutedForeground }]}
                            onPress={() => sendMessage(input)}
                            disabled={!input.trim() || sendMessageMutation.isPending}
                        >
                            <Ionicons name="arrow-up" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Coach responses are informational and not medical advice.</Text>
                </View>
            </KeyboardAvoidingView>
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
    headerTitleWrap: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    headerTitle: {
        width: '100%',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 12,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 6,
        fontFamily: fontFamilies.display,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    messageRow: {
        flexDirection: 'row',
        gap: 8,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    assistantRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    messageBubble: {
        maxWidth: '82%',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    userBubble: {
        borderBottomRightRadius: 6,
    },
    assistantBubble: {
        borderBottomLeftRadius: 6,
        borderWidth: 1,
    },
    pendingBubble: {
        opacity: 0.75,
    },
    userText: {
        color: '#FFF',
        fontSize: 15,
        lineHeight: 22,
    },
    errorBanner: {
        marginHorizontal: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 12,
    },
    inputWrap: {
        borderTopWidth: 1,
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    inputRow: {
        borderWidth: 1,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
        maxHeight: 120,
        paddingVertical: 8,
    },
    sendButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
    },
});
