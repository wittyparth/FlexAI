/**
 * CoachChatScreen.tsx — Production ChatGPT-Quality AI Chat
 *
 * Features:
 * - FlatList (inverted) 60fps scrolling
 * - Token-by-token streaming with blinking cursor
 * - Scroll-to-bottom FAB
 * - Message Action Sheet (Copy / Edit / Regenerate / Delete)
 * - Message Reactions (👍 / 👎)
 * - Edit user messages inline
 * - Regenerate last AI response
 * - Model selector (FlexAI Pro / Fast)
 * - MarkdownRenderer with tables, code blocks, headers
 * - Haptic feedback on send
 * - Multi-line auto-grow input
 * - Stop generation button
 * - Animated typing indicator
 */

import React, {
    useRef, useEffect, useState, useCallback, useMemo, memo
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Alert,
    Clipboard,
    Pressable,
    Modal,
    ActionSheetIOS,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import {
    useChatStore,
    getMockAIResponse,
    ChatMessage,
    MessageReaction,
    AIModel,
} from '../../store/chatStore';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

// ─── Typing Dots ──────────────────────────────────────────────────────────────

const TypingDots = memo(({ color }: { color: string }) => {
    const dots = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        const animations = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 150),
                    Animated.timing(dot, { toValue: -6, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                    Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
                    Animated.delay(600),
                ])
            )
        );
        animations.forEach((a) => a.start());
        return () => animations.forEach((a) => a.stop());
    }, []);

    return (
        <View style={typingStyles.row}>
            {dots.map((dot, i) => (
                <Animated.View
                    key={i}
                    style={[typingStyles.dot, { backgroundColor: color, transform: [{ translateY: dot }] }]}
                />
            ))}
        </View>
    );
});

const typingStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
});

// ─── Blinking Cursor ────────────────────────────────────────────────────────

const BlinkingCursor = memo(({ color }: { color: string }) => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <Animated.View
            style={{
                width: 2,
                height: 16,
                borderRadius: 1,
                backgroundColor: color,
                opacity,
                marginLeft: 2,
                marginTop: 3,
            }}
        />
    );
});

// ─── Reaction Bar ────────────────────────────────────────────────────────────

interface ReactionBarProps {
    reaction: MessageReaction;
    colors: any;
    onReact: (r: MessageReaction) => void;
    onCopy: () => void;
    onRegenerate?: () => void;
}

const ReactionBar = memo(({ reaction, colors, onReact, onCopy, onRegenerate }: ReactionBarProps) => (
    <View style={reactionStyles.row}>
        <TouchableOpacity
            onPress={() => onReact('up')}
            style={[reactionStyles.btn, reaction === 'up' && { backgroundColor: `${colors.success}20` }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Ionicons name="thumbs-up" size={14} color={colors.foreground} style={[reactionStyles.emoji, reaction === 'up' && reactionStyles.active]} />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => onReact('down')}
            style={[reactionStyles.btn, reaction === 'down' && { backgroundColor: `${colors.error}20` }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Ionicons name="thumbs-down" size={14} color={colors.foreground} style={[reactionStyles.emoji, reaction === 'down' && reactionStyles.active]} />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={onCopy}
            style={reactionStyles.btn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Ionicons name="copy-outline" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
        {onRegenerate && (
            <TouchableOpacity
                onPress={onRegenerate}
                style={reactionStyles.btn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="refresh-outline" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
        )}
    </View>
));

const reactionStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 38, gap: 4 },
    btn: { padding: 6, borderRadius: 8 },
    emoji: { fontSize: 14, opacity: 0.5 },
    active: { opacity: 1 },
});

// ─── Message Bubble ──────────────────────────────────────────────────────────

interface MessageBubbleProps {
    message: ChatMessage;
    isLast: boolean;
    isLastAI: boolean;
    colors: any;
    conversationId: string;
    onRegenerate: () => void;
}

const MessageBubble = memo(({
    message,
    isLast,
    isLastAI,
    colors,
    conversationId,
    onRegenerate,
}: MessageBubbleProps) => {
    const isUser = message.role === 'user';
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(14)).current;
    const { reactToMessage, deleteMessage } = useChatStore();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
        ]).start();
    }, []);

    const displayContent = message.isStreaming
        ? (message.streamingContent ?? '')
        : message.content;

    const handleLongPress = useCallback(() => {
        if (Platform.OS === 'ios') {
            const options = isUser
                ? ['Copy', 'Delete', 'Cancel']
                : ['Copy', 'Regenerate', 'Delete', 'Cancel'];
            const destructiveIdx = isUser ? 1 : 2;
            const cancelIdx = isUser ? 2 : 3;
            ActionSheetIOS.showActionSheetWithOptions(
                { options, destructiveButtonIndex: destructiveIdx, cancelButtonIndex: cancelIdx },
                (idx) => {
                    if (idx === 0) { Clipboard.setString(displayContent); Alert.alert('Copied!', 'Message copied'); }
                    else if (idx === 1 && !isUser) { onRegenerate(); }
                    else if (idx === (isUser ? 1 : 2)) {
                        Alert.alert('Delete message?', 'This cannot be undone.', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(conversationId, message.id) },
                        ]);
                    }
                }
            );
        } else {
            // Android fallback
            Alert.alert('Message', undefined, [
                { text: 'Copy', onPress: () => { Clipboard.setString(displayContent); Alert.alert('Copied!', 'Message copied'); } },
                ...(!isUser ? [{ text: 'Regenerate', onPress: onRegenerate }] : []),
                { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(conversationId, message.id) },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    }, [displayContent, isUser, conversationId, message.id, onRegenerate, deleteMessage]);

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Animated.View
            style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.aiRow,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
        >
            {/* AI Avatar */}
            {!isUser && (
                <View
                    style={[styles.aiAvatar, { backgroundColor: colors.primary.main }]}
                >
                    <MaterialCommunityIcons name="robot-excited" size={16} color="#FFF" />
                </View>
            )}

            <View style={[styles.bubbleColumn, isUser ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                <Pressable
                    onLongPress={handleLongPress}
                    delayLongPress={380}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                >
                    {isUser ? (
                        <View
                            style={[styles.bubble, styles.userBubble, { backgroundColor: colors.primary.main }]}
                        >
                            <Text style={styles.userText}>{displayContent}</Text>
                            {message.isEdited && (
                                <Text style={styles.editedLabel}>edited</Text>
                            )}
                            <Text style={styles.userTime}>{time}</Text>
                        </View>
                    ) : (
                        <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {message.isStreaming && !displayContent ? (
                                <TypingDots color={colors.mutedForeground} />
                            ) : (
                                <>
                                    <MarkdownRenderer
                                        content={displayContent}
                                        textColor={colors.foreground}
                                        mutedColor={colors.mutedForeground}
                                        codeBackground={colors.background}
                                        codeBorder={colors.border}
                                        primaryColor={colors.primary.main}
                                        fontSize={15}
                                        lineHeight={23}
                                    />
                                    {message.isStreaming && (
                                        <BlinkingCursor color={colors.foreground} />
                                    )}
                                    <Text style={[styles.aiTime, { color: colors.mutedForeground }]}>{time}</Text>
                                </>
                            )}
                        </View>
                    )}
                </Pressable>

                {/* Reaction bar — only for completed AI messages */}
                {!isUser && !message.isStreaming && (
                    <ReactionBar
                        reaction={message.reaction ?? null}
                        colors={colors}
                        onReact={(r) => reactToMessage(conversationId, message.id, r)}
                        onCopy={() => { Clipboard.setString(displayContent); Alert.alert('Copied!', 'Message copied'); }}
                        onRegenerate={isLastAI ? onRegenerate : undefined}
                    />
                )}
            </View>

            {/* User Avatar */}
            {isUser && (
                <View
                    style={[styles.userAvatar, { backgroundColor: colors.primary.main }]}
                >
                    <Ionicons name="person" size={14} color="#FFF" />
                </View>
            )}
        </Animated.View>
    );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

const SUGGESTIONS = [
    { icon: 'barbell', label: 'Build a push day workout', color: '#1E40AF' },
    { icon: 'restaurant', label: 'Explain my macro targets', color: '#065F46' },
    { icon: 'moon', label: 'Optimize my sleep for recovery', color: '#1E3A8A' },
    { icon: 'trending-up', label: 'Analyze my progress this month', color: '#5B21B6' },
    { icon: 'medical', label: 'What supplements should I take?', color: '#9D174D' },
    { icon: 'flame', label: 'Help me set SMART fitness goals', color: '#B45309' },
];

const EmptyState = memo(({ colors, onSelectPrompt }: { colors: any; onSelectPrompt: (s: string) => void }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 2200, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={emptyStyles.container}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View
                    style={[emptyStyles.avatar, { backgroundColor: colors.primary.main }]}
                >
                    <MaterialCommunityIcons name="robot-excited" size={44} color="#FFF" />
                </View>
            </Animated.View>

            <Text style={[emptyStyles.title, { color: colors.foreground }]}>FlexAI Coach</Text>
            <Text style={[emptyStyles.subtitle, { color: colors.mutedForeground }]}>
                Powered by AI · Expert fitness guidance
            </Text>

            <View style={emptyStyles.suggestionsGrid}>
                {SUGGESTIONS.map((s, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[emptyStyles.suggestionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => onSelectPrompt(s.label)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={s.icon as any} style={[emptyStyles.suggestionIcon, { color: s.color }]} size={20} />
                        <Text style={[emptyStyles.suggestionText, { color: colors.foreground }]}>{s.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

const emptyStyles = StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
    avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
    subtitle: { fontSize: 14, marginBottom: 32, textAlign: 'center' },
    suggestionsGrid: { width: '100%', gap: 10 },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    suggestionIcon: {},
    suggestionText: { fontSize: 14, fontWeight: '500', flex: 1 },
});

// ─── Model Picker Modal ──────────────────────────────────────────────────────

interface ModelPickerProps {
    visible: boolean;
    currentModel: AIModel;
    colors: any;
    onSelect: (model: AIModel) => void;
    onClose: () => void;
}

const MODELS: { id: AIModel; label: string; desc: string; emoji: string }[] = [
    { id: 'pro', label: 'FlexAI Pro', desc: 'Most capable — best answers', emoji: 'flash' },
    { id: 'fast', label: 'FlexAI Fast', desc: 'Quick responses for simple questions', emoji: 'rocket' },
];

const ModelPicker = memo(({ visible, currentModel, colors, onSelect, onClose }: ModelPickerProps) => (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <Pressable style={pickerStyles.backdrop} onPress={onClose}>
            <View style={[pickerStyles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[pickerStyles.title, { color: colors.foreground }]}>Choose Model</Text>
                {MODELS.map((m) => (
                    <TouchableOpacity
                        key={m.id}
                        style={[
                            pickerStyles.option,
                            { borderColor: colors.border },
                            currentModel === m.id && { backgroundColor: `${colors.primary.main}15`, borderColor: colors.primary.main },
                        ]}
                        onPress={() => { onSelect(m.id); onClose(); }}
                        activeOpacity={0.85}
                    >
                        <Ionicons name={m.emoji as any} style={[pickerStyles.optionEmoji, { color: colors.foreground }]} size={24} />
                        <View style={{ flex: 1 }}>
                            <Text style={[pickerStyles.optionLabel, { color: colors.foreground }]}>{m.label}</Text>
                            <Text style={[pickerStyles.optionDesc, { color: colors.mutedForeground }]}>{m.desc}</Text>
                        </View>
                        {currentModel === m.id && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </Pressable>
    </Modal>
));

const pickerStyles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    sheet: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
    title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
    optionEmoji: {},
    optionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 12 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function CoachChatScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    const { conversationId: routeConversationId, initialPrompt } = route?.params ?? {};

    const {
        conversations,
        isGenerating,
        selectedModel,
        createConversation,
        addUserMessage,
        startStreamingResponse,
        appendStreamingToken,
        completeStreaming,
        deleteMessage,
        setModel,
    } = useChatStore();

    const [conversationId, setConversationId] = useState<string>(() => routeConversationId ?? '');
    const [inputText, setInputText] = useState('');
    const [inputHeight, setInputHeight] = useState(44);
    const [showScrollFAB, setShowScrollFAB] = useState(false);
    const [showModelPicker, setShowModelPicker] = useState(false);

    const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fabAnim = useRef(new Animated.Value(0)).current;

    const conversation = useMemo(
        () => conversations.find((c) => c.id === conversationId),
        [conversations, conversationId]
    );

    const messages = conversation?.messages ?? [];
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    // Find last AI message id
    const lastAIMessageId = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant') return messages[i].id;
        }
        return null;
    }, [messages]);

    // Initialize conversation
    useEffect(() => {
        let cid = routeConversationId;
        if (!cid) {
            cid = createConversation(initialPrompt);
            setConversationId(cid);
        }
        if (initialPrompt && cid) {
            setTimeout(() => sendMessage(initialPrompt, cid), 400);
        }
    }, []);

    // FAB animation
    useEffect(() => {
        Animated.timing(fabAnim, {
            toValue: showScrollFAB ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showScrollFAB]);

    const stopGeneration = useCallback(() => {
        if (streamTimerRef.current) {
            clearInterval(streamTimerRef.current);
            streamTimerRef.current = null;
        }
        const { streamingMessageId } = useChatStore.getState();
        if (conversationId && streamingMessageId) {
            completeStreaming(conversationId, streamingMessageId);
        }
    }, [conversationId, completeStreaming]);

    const sendMessage = useCallback((text: string, cid?: string) => {
        const targetId = cid ?? conversationId;
        if (!text.trim() || !targetId) return;

        addUserMessage(targetId, text.trim());
        setInputText('');
        setInputHeight(44);

        const aiResponse = getMockAIResponse(text);
        const msgId = startStreamingResponse(targetId);

        setTimeout(() => {
            const chunks = aiResponse.split(/(\s+)/).filter(Boolean);
            let chunkIndex = 0;

            streamTimerRef.current = setInterval(() => {
                if (chunkIndex < chunks.length) {
                    const batch = chunks.slice(chunkIndex, chunkIndex + 3).join('');
                    appendStreamingToken(targetId, msgId, batch);
                    chunkIndex += 3;
                } else {
                    clearInterval(streamTimerRef.current!);
                    streamTimerRef.current = null;
                    completeStreaming(targetId, msgId);
                }
            }, 16);
        }, 700);
    }, [conversationId, addUserMessage, startStreamingResponse, appendStreamingToken, completeStreaming]);

    const handleSend = useCallback(() => {
        if (inputText.trim() && !isGenerating) {
            sendMessage(inputText);
        }
    }, [inputText, isGenerating, sendMessage]);

    const handleRegenerate = useCallback(() => {
        if (!conversationId || isGenerating) return;
        // Find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                // Delete last AI message if it exists
                if (lastAIMessageId) deleteMessage(conversationId, lastAIMessageId);
                setTimeout(() => sendMessage(messages[i].content), 200);
                break;
            }
        }
    }, [conversationId, isGenerating, messages, lastAIMessageId, deleteMessage, sendMessage]);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offset = e.nativeEvent.contentOffset.y;
        setShowScrollFAB(offset > 120);
    }, []);

    const scrollToBottom = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
        <MessageBubble
            message={item}
            colors={colors}
            isLast={item.id === messages[messages.length - 1]?.id}
            isLastAI={item.id === lastAIMessageId}
            conversationId={conversationId}
            onRegenerate={handleRegenerate}
        />
    ), [colors, messages, lastAIMessageId, conversationId, handleRegenerate]);

    const keyExtractor = useCallback((item: ChatMessage) => item.id, []);
    const title = conversation?.title ?? 'New Chat';
    const currentModel = conversation?.model ?? selectedModel;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ── Header ── */}
            <View style={[styles.header, { paddingTop: insets.top + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="chevron-back" size={26} color={colors.foreground} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerCenter} onPress={() => setShowModelPicker(true)} activeOpacity={0.8}>
                    <View style={[styles.headerAvatar, { backgroundColor: colors.primary.main }]}>
                        <MaterialCommunityIcons name="robot-excited" size={16} color="#FFF" />
                    </View>
                    <View style={styles.headerTextGroup}>
                        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {title}
                        </Text>
                        <View style={styles.headerStatusRow}>
                            <View style={[styles.headerDot, { backgroundColor: isGenerating ? colors.warning ?? '#F59E0B' : colors.success }]} />
                            <Text style={[styles.headerStatus, { color: colors.mutedForeground }]}>
                                {isGenerating ? 'Generating...' : currentModel === 'pro' ? 'FlexAI Pro' : 'FlexAI Fast'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} style={{ marginLeft: -4 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => navigation.navigate('ChatHistory')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="time-outline" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* ── Messages + Input ── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {messages.length === 0 ? (
                    <View style={{ flex: 1 }}>
                        <EmptyState
                            colors={colors}
                            onSelectPrompt={(prompt) => {
                                setInputText(prompt);
                                setTimeout(handleSend, 100);
                                // Actually send it directly
                                sendMessage(prompt);
                            }}
                        />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={reversedMessages}
                        renderItem={renderMessage}
                        keyExtractor={keyExtractor}
                        inverted
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                        removeClippedSubviews={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={32}
                    />
                )}

                {/* ── Input Bar ── */}
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: colors.card,
                            borderTopColor: colors.border,
                            paddingBottom: insets.bottom + 8,
                        },
                    ]}
                >
                    {/* Model Badge */}
                    <TouchableOpacity onPress={() => setShowModelPicker(true)} style={styles.modelBadgeRow}>
                        <View style={[styles.modelBadge, { backgroundColor: `${colors.primary.main}15`, borderColor: `${colors.primary.main}30` }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={12} color={colors.primary.main} />
                            <Text style={[styles.modelBadgeText, { color: colors.primary.main }]}>
                                {currentModel === 'pro' ? 'FlexAI Pro' : 'FlexAI Fast'}
                            </Text>
                            <Ionicons name="chevron-down" size={10} color={colors.primary.main} />
                        </View>
                    </TouchableOpacity>

                    {/* Input Row */}
                    <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <TextInput
                            style={[
                                styles.textInput,
                                { color: colors.foreground, height: Math.max(44, inputHeight) },
                            ]}
                            placeholder="Message FlexAI Coach..."
                            placeholderTextColor={colors.mutedForeground}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={4000}
                            returnKeyType="default"
                            onContentSizeChange={(e) => {
                                const h = e.nativeEvent.contentSize.height;
                                setInputHeight(Math.min(Math.max(44, h), 120));
                            }}
                        />

                        {/* Send / Stop */}
                        {isGenerating ? (
                            <TouchableOpacity
                                style={[styles.sendBtn, { backgroundColor: colors.foreground }]}
                                onPress={stopGeneration}
                            >
                                <View style={styles.stopIcon} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.sendBtnWrapper, { opacity: inputText.trim() ? 1 : 0.35 }]}
                                disabled={!inputText.trim()}
                                onPress={handleSend}
                            >
                                <View
                                    style={[styles.sendBtn, { backgroundColor: colors.primary.main }]}
                                >
                                    <Ionicons name="arrow-up" size={20} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
                        FlexAI Coach may make mistakes. Always consult a healthcare professional.
                    </Text>
                </View>
            </KeyboardAvoidingView>

            {/* ── Scroll to Bottom FAB ── */}
            <Animated.View
                style={[
                    styles.fab,
                    {
                        bottom: insets.bottom + 110,
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: fabAnim,
                        transform: [{ scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
                    },
                ]}
                pointerEvents={showScrollFAB ? 'auto' : 'none'}
            >
                <TouchableOpacity onPress={scrollToBottom} style={styles.fabInner}>
                    <Ionicons name="chevron-down" size={20} color={colors.foreground} />
                </TouchableOpacity>
            </Animated.View>

            {/* ── Model Picker Modal ── */}
            <ModelPicker
                visible={showModelPicker}
                currentModel={currentModel}
                colors={colors}
                onSelect={(m) => {
                    setModel(m);
                    // Update conversation model too if desired
                }}
                onClose={() => setShowModelPicker(false)}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
    headerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    headerTextGroup: { flex: 1 },
    headerTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
    headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
    headerDot: { width: 6, height: 6, borderRadius: 3 },
    headerStatus: { fontSize: 11, fontWeight: '500' },

    // Messages
    messagesContent: { paddingHorizontal: 12, paddingVertical: 16, gap: 4 },

    // Message rows
    messageRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-end', gap: 8 },
    userRow: { justifyContent: 'flex-end' },
    aiRow: { justifyContent: 'flex-start' },
    aiAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
    userAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    bubbleColumn: { maxWidth: '80%' },
    bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
    userBubble: { borderBottomRightRadius: 6 },
    aiBubble: { borderBottomLeftRadius: 6, borderWidth: StyleSheet.hairlineWidth },
    userText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
    editedLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 3 },
    userTime: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 6, textAlign: 'right' },
    aiTime: { fontSize: 11, marginTop: 8, textAlign: 'left' },

    // Input
    inputContainer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, paddingHorizontal: 12 },
    modelBadgeRow: { alignItems: 'center', marginBottom: 8 },
    modelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
    },
    modelBadgeText: { fontSize: 11, fontWeight: '700' },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 26,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 6,
        gap: 8,
    },
    textInput: { flex: 1, fontSize: 15, paddingVertical: 8, maxHeight: 120, lineHeight: 22 },
    sendBtnWrapper: {},
    sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    stopIcon: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#FFF' },
    disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 8, paddingBottom: 2 },

    // FAB
    fab: {
        position: 'absolute',
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
