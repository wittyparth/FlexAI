import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// MOCK DATA - AI Coach conversations
// ============================================================
const QUICK_PROMPTS = [
    { id: 1, icon: '💪', label: 'Create a workout', prompt: 'Create a workout for me' },
    { id: 2, icon: '🍎', label: 'Nutrition tips', prompt: 'Give me nutrition tips' },
    { id: 3, icon: '📈', label: 'Analyze progress', prompt: 'Analyze my progress' },
    { id: 4, icon: '🎯', label: 'Set goals', prompt: 'Help me set fitness goals' },
];

const RECENT_CONVERSATIONS = [
    { id: 1, title: 'Chest & Triceps Workout', preview: 'Here\'s a push day workout targeting...', time: '2h ago', icon: '🏋️' },
    { id: 2, title: 'Protein Intake', preview: 'Based on your weight, aim for...', time: 'Yesterday', icon: '🥩' },
    { id: 3, title: 'Progress Analysis', preview: 'Great progress! Your bench has...', time: '3 days ago', icon: '📊' },
];

export function CoachHubScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [message, setMessage] = useState('');

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

        // Pulse animation for AI avatar
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
                colors={['#0EA5E9', '#0284C7'] as [string, string]}
                style={[styles.header, { paddingTop: insets.top + 8 }]}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontFamily: fontFamilies.display }]}>AI Coach</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* AI Avatar Section */}
                <Animated.View style={[styles.avatarSection, { opacity: fadeAnim }]}>
                    <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient
                            colors={['#0EA5E9', '#6366F1'] as [string, string]}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarEmoji}>🤖</Text>
                        </LinearGradient>
                    </Animated.View>
                    <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>Hi! I'm your AI Coach</Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.mutedForeground }]}>
                        Ask me anything about workouts, nutrition, or your fitness journey
                    </Text>
                </Animated.View>

                {/* Quick Prompts */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
                    <View style={styles.promptsGrid}>
                        {QUICK_PROMPTS.map((prompt, index) => (
                            <TouchableOpacity
                                key={prompt.id}
                                style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('CoachChat', { initialPrompt: prompt.prompt })}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.promptIcon}>{prompt.icon}</Text>
                                <Text style={[styles.promptLabel, { color: colors.foreground }]}>{prompt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Conversations */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Chats</Text>
                        <TouchableOpacity>
                            <Text style={[styles.seeAllText, { color: colors.primary.main }]}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {RECENT_CONVERSATIONS.map((convo) => (
                        <TouchableOpacity
                            key={convo.id}
                            style={[styles.convoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => navigation.navigate('CoachChat', { conversationId: convo.id })}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.convoIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Text style={styles.convoEmoji}>{convo.icon}</Text>
                            </View>
                            <View style={styles.convoContent}>
                                <Text style={[styles.convoTitle, { color: colors.foreground }]}>{convo.title}</Text>
                                <Text style={[styles.convoPreview, { color: colors.mutedForeground }]} numberOfLines={1}>
                                    {convo.preview}
                                </Text>
                            </View>
                            <Text style={[styles.convoTime, { color: colors.mutedForeground }]}>{convo.time}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Features</Text>
                    <View style={[styles.featureCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <View style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: colors.primary.main }]}>
                                <Ionicons name="fitness" size={22} color="#FFF" />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: colors.foreground }]}>Form Analysis</Text>
                                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                                    Record your lifts and get AI feedback on your form
                                </Text>
                            </View>
                            <TouchableOpacity style={[styles.featureBtn, { backgroundColor: colors.primary.main }]}>
                                <Text style={styles.featureBtnText}>Try</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Input */}
            <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
                <View style={[styles.inputRow, { backgroundColor: colors.muted }]}>
                    <TextInput
                        style={[styles.textInput, { color: colors.foreground }]}
                        placeholder="Ask your AI coach..."
                        placeholderTextColor={colors.mutedForeground}
                        value={message}
                        onChangeText={setMessage}
                        onSubmitEditing={() => {
                            if (message.trim()) {
                                navigation.navigate('CoachChat', { initialPrompt: message });
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { opacity: message.trim() ? 1 : 0.5 }]}
                        disabled={!message.trim()}
                        onPress={() => navigation.navigate('CoachChat', { initialPrompt: message })}
                    >
                        <LinearGradient colors={colors.primary.gradient as [string, string]} style={styles.sendGradient}>
                            <Ionicons name="send" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 20 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    avatarSection: { alignItems: 'center', paddingVertical: 30 },
    avatarRing: { marginBottom: 16 },
    avatarGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
    avatarEmoji: { fontSize: 50 },
    welcomeTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    welcomeSubtitle: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
    section: { paddingHorizontal: 16, marginTop: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    seeAllText: { fontSize: 14, fontWeight: '600' },
    promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    promptCard: { width: (width - 44) / 2, padding: 20, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    promptIcon: { fontSize: 32, marginBottom: 10 },
    promptLabel: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
    convoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10, gap: 14 },
    convoIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    convoEmoji: { fontSize: 24 },
    convoContent: { flex: 1 },
    convoTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    convoPreview: { fontSize: 14 },
    convoTime: { fontSize: 12 },
    featureCard: { borderRadius: 18, borderWidth: 1, padding: 18 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    featureContent: { flex: 1 },
    featureTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    featureDesc: { fontSize: 13, lineHeight: 18 },
    featureBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
    featureBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 18, borderRadius: 28, overflow: 'hidden' },
    textInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
    sendBtn: { padding: 8 },
    sendGradient: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
