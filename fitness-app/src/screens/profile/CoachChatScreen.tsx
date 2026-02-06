import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

// ============================================================
// MOCK CHAT DATA
// ============================================================
const INITIAL_MESSAGES = [
    { id: 1, type: 'ai', text: "Hi! I'm your AI fitness coach. How can I help you today?", time: '10:00 AM' },
];

export function CoachChatScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const initialPrompt = route?.params?.initialPrompt;
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        // Auto-send initial prompt
        if (initialPrompt) {
            setTimeout(() => sendMessage(initialPrompt), 500);
        }
    }, []);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', text: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responses: Record<string, string> = {
                'workout': "Here's a great push day workout for you:\n\n💪 **Push Day**\n1. Bench Press: 4×8\n2. Incline DB Press: 3×10\n3. Cable Flies: 3×12\n4. Overhead Press: 4×8\n5. Lateral Raises: 3×15\n6. Tricep Pushdowns: 3×12\n\nRest 90-120 seconds between heavy sets!",
                'nutrition': "Based on your profile, here are some nutrition tips:\n\n🥩 **Protein**: Aim for 1.6-2.2g/kg bodyweight\n🍚 **Carbs**: Focus around workouts\n🥑 **Fats**: Include healthy sources\n💧 **Water**: 3-4 liters daily\n\nWould you like a detailed meal plan?",
                'progress': "Looking at your data:\n\n📈 **Strength**: +15% bench in 3 months\n🔥 **Consistency**: 127 day streak!\n💪 **Volume**: Up 20% this month\n🏆 **PRs**: 8 new records!\n\nYou're making excellent progress! Keep it up!",
                'goals': "Let's set some SMART fitness goals!\n\n1. **Specific**: What exactly do you want?\n2. **Measurable**: How will you track it?\n3. **Achievable**: Is it realistic?\n4. **Relevant**: Why is this important?\n5. **Time-bound**: What's your deadline?\n\nWhat's your main focus - strength, muscle, or endurance?",
            };

            let aiResponse = "I'd be happy to help! Could you tell me more about what you're looking for? I can assist with:\n\n• Custom workout plans\n• Nutrition advice\n• Progress analysis\n• Form tips\n• Goal setting";

            const lowerText = text.toLowerCase();
            if (lowerText.includes('workout') || lowerText.includes('train')) aiResponse = responses.workout;
            if (lowerText.includes('nutrition') || lowerText.includes('diet') || lowerText.includes('eat')) aiResponse = responses.nutrition;
            if (lowerText.includes('progress') || lowerText.includes('analyz')) aiResponse = responses.progress;
            if (lowerText.includes('goal')) aiResponse = responses.goals;

            setIsTyping(false);
            setMessages((prev) => [...prev, {
                id: Date.now(),
                type: 'ai',
                text: aiResponse,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        }, 1500);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerEmoji}>🤖</Text>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Coach</Text>
                        <Text style={[styles.headerStatus, { color: colors.success }]}>● Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <Animated.View
                        key={msg.id}
                        style={[
                            styles.messageBubble,
                            msg.type === 'user' ? styles.userBubble : styles.aiBubble,
                            msg.type === 'user'
                                ? { backgroundColor: colors.primary.main }
                                : { backgroundColor: colors.card, borderColor: colors.border },
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={[
                            styles.messageText,
                            { color: msg.type === 'user' ? '#FFF' : colors.foreground }
                        ]}>{msg.text}</Text>
                        <Text style={[
                            styles.messageTime,
                            { color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }
                        ]}>{msg.time}</Text>
                    </Animated.View>
                ))}

                {isTyping && (
                    <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={styles.typingDots}>● ● ●</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <View style={[styles.inputRow, { backgroundColor: colors.muted }]}>
                        <TextInput
                            style={[styles.textInput, { color: colors.foreground }]}
                            placeholder="Message your AI coach..."
                            placeholderTextColor={colors.mutedForeground}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            onPress={() => sendMessage(input)}
                            disabled={!input.trim()}
                            style={{ opacity: input.trim() ? 1 : 0.4 }}
                        >
                            <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.sendBtn}>
                                <Ionicons name="send" size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerEmoji: { fontSize: 36 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    headerStatus: { fontSize: 12, fontWeight: '500' },
    messagesContainer: { flex: 1 },
    messagesContent: { padding: 16, paddingBottom: 20 },
    messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 12 },
    userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
    aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 6, borderWidth: 1 },
    messageText: { fontSize: 15, lineHeight: 22 },
    messageTime: { fontSize: 11, marginTop: 6, alignSelf: 'flex-end' },
    typingBubble: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20, borderWidth: 1 },
    typingDots: { color: '#6B7280', fontSize: 18, letterSpacing: 4 },
    inputContainer: { padding: 12, borderTopWidth: 1 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingLeft: 18, paddingVertical: 8, borderRadius: 24, gap: 8 },
    textInput: { flex: 1, fontSize: 16, maxHeight: 100, paddingVertical: 8 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
