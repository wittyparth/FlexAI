import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts';

const C = {
    dark:  { bg: '#0A0E1A', card: '#131C2E', border: '#1F2D45', text: '#F1F5FF', muted: '#7A8BAA', primary: '#3B82F6', surface: '#1A2540' },
    light: { bg: '#F0F4FF', card: '#FFFFFF', border: '#E2E8F8', text: '#0D1526', muted: '#64748B', primary: '#2563EB', surface: '#EEF2FF' },
};
const FNT = { display: 'Calistoga', mono: 'JetBrainsMono', bold: 'Inter-Bold', semi: 'Inter-SemiBold' };

interface AIOptionProps {
    icon: string;
    title: string;
    subtitle: string;
    gradient: [string, string];
    badge?: string;
    onPress: () => void;
}

function AIOptionCard({ icon, title, subtitle, gradient, badge, onPress }: AIOptionProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    return (
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale }] }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.optionCard}>
                    {badge && (
                        <View style={styles.optionBadge}>
                            <Text style={styles.optionBadgeText}>{badge}</Text>
                        </View>
                    )}
                    <View style={styles.optionIconBg}>
                        <MaterialCommunityIcons name={icon as any} size={32} color="#FFF" />
                    </View>
                    <View style={styles.optionTextBlock}>
                        <Text style={styles.optionTitle}>{title}</Text>
                        <Text style={styles.optionSubtitle}>{subtitle}</Text>
                    </View>
                    <View style={styles.optionArrow}>
                        <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
                    </View>
                    {/* Decorative circles */}
                    <View style={styles.deco1} />
                    <View style={styles.deco2} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

export function AIRoutinePlannerScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();
    const c = isDark ? C.dark : C.light;
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const getDrawerNav = () => navigation.getParent()?.getParent() ?? navigation;

    const goToAICoach = () => {
        getDrawerNav().navigate('Coach', { screen: 'CoachHub' });
    };

    const goToAIGenerator = () => {
        navigation.navigate('AIGenerator', { presetGoal: 'Build Muscle' });
    };

    const goToTemplateGenerator = () => {
        navigation.navigate('RoutineEditor', { routineId: undefined });
    };

    return (
        <View style={[styles.container, { backgroundColor: c.bg }]}>
            {/* HEADER */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={[styles.backBtn, { backgroundColor: c.card, borderColor: c.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={22} color={c.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerSub, { color: c.muted }]}>POWERED BY AI</Text>
                    <Text style={[styles.headerTitle, { color: c.text, fontFamily: FNT.display }]}>AI Planner</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={[styles.sparkleContainer, { backgroundColor: '#7C3AED20' }]}>
                        <Ionicons name="sparkles" size={20} color="#7C3AED" />
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
                <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>

                    {/* Intro Banner */}
                    <View style={styles.introSection}>
                        <LinearGradient
                            colors={['#1E1B4B', '#312E81']}
                            style={styles.introBanner}
                        >
                            <View style={styles.introContent}>
                                <Text style={styles.introLabel}>YOUR PERSONAL AI TRAINER</Text>
                                <Text style={styles.introHeadline}>Let AI build your{'\n'}perfect program</Text>
                                <Text style={styles.introBody}>
                                    Create personalized routines, templates and get expert coaching — all powered by AI.
                                </Text>
                            </View>
                            <View style={styles.introBrainBubble}>
                                <MaterialCommunityIcons name="brain" size={40} color="#A78BFA" />
                            </View>
                            <View style={styles.introDeco1} />
                            <View style={styles.introDeco2} />
                        </LinearGradient>
                    </View>

                    {/* Options Label */}
                    <Text style={[styles.sectionLabel, { color: c.muted }]}>CHOOSE AN OPTION</Text>

                    {/* Option 1: AI Coach */}
                    <AIOptionCard
                        icon="robot-outline"
                        title="AI Coach"
                        subtitle="Chat with your personal AI coach for advice, form tips & motivation"
                        gradient={['#1E40AF', '#3B82F6']}
                        badge="CHAT"
                        onPress={goToAICoach}
                    />

                    {/* Option 2: Generate Routine */}
                    <AIOptionCard
                        icon="clipboard-list-outline"
                        title="Generate Routine with AI"
                        subtitle="Build a full weekly training program based on your goals, level & schedule"
                        gradient={['#065F46', '#10B981']}
                        badge="BUILD"
                        onPress={goToAIGenerator}
                    />

                    {/* Option 3: Generate Template */}
                    <AIOptionCard
                        icon="file-document-edit-outline"
                        title="Generate Template with AI"
                        subtitle="Create a single workout template — exercises, sets & reps auto-selected"
                        gradient={['#92400E', '#F59E0B']}
                        badge="CREATE"
                        onPress={goToTemplateGenerator}
                    />

                    {/* Tips section */}
                    <View style={[styles.tipsCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={styles.tipsTitleRow}>
                            <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#F59E0B" />
                            <Text style={[styles.tipsTitle, { color: c.text }]}>Pro Tips</Text>
                        </View>
                        {[
                            'Be specific about your goals for better results',
                            'Share your available equipment for accurate plans',
                            'Mention your experience level (beginner, intermediate, advanced)',
                        ].map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={styles.tipDot} />
                                <Text style={[styles.tipText, { color: c.muted }]}>{tip}</Text>
                            </View>
                        ))}
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    headerCenter: { flex: 1 },
    headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
    headerTitle: { fontSize: 28 },
    headerRight: {},
    sparkleContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: { paddingHorizontal: 20 },

    // Intro
    introSection: { marginBottom: 28 },
    introBanner: { borderRadius: 20, padding: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
    introContent: { flex: 1 },
    introLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 6 },
    introHeadline: { fontSize: 24, fontWeight: '800', color: '#FFF', lineHeight: 30, marginBottom: 8 },
    introBody: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
    introBrainBubble: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(167,139,250,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    introDeco1: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', right: -15, top: -15 },
    introDeco2: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.04)', left: -10, bottom: -10 },

    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },

    // Option Card
    optionWrapper: {
        marginBottom: 14,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    optionCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
        minHeight: 100,
    },
    optionBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    optionBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
    optionIconBg: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    optionTextBlock: { flex: 1, paddingRight: 30 },
    optionTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 5 },
    optionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
    optionArrow: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deco1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', right: -20, bottom: -30 },
    deco2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.04)', left: -10, top: -15 },

    // Tips
    tipsCard: {
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
        marginTop: 8,
        marginBottom: 8,
        gap: 12,
    },
    tipsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tipsTitle: { fontSize: 15, fontWeight: '700' },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', marginTop: 6 },
    tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
