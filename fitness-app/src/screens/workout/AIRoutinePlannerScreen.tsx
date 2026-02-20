import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

interface AIOptionProps {
    icon: string;
    title: string;
    subtitle: string;
    accentColor: string;
    badge?: string;
    onPress: () => void;
    c: any;
}

function AIOptionCard({ icon, title, subtitle, accentColor, badge, onPress, c }: AIOptionProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
    const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    return (
        <Animated.View style={[styles.optionWrapper, { transform: [{ scale }], shadowColor: c.shadow }]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View style={[styles.optionCard, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>
                    {badge && (
                        <View style={[styles.optionBadge, { backgroundColor: `${accentColor}15` }]}>
                            <Text style={[styles.optionBadgeText, { color: accentColor }]}>{badge}</Text>
                        </View>
                    )}
                    <View style={[styles.optionIconBg, { backgroundColor: `${accentColor}15` }]}>
                        <MaterialCommunityIcons name={icon as any} size={32} color={accentColor} />
                    </View>
                    <View style={styles.optionTextBlock}>
                        <Text style={[styles.optionTitle, { color: c.text }]}>{title}</Text>
                        <Text style={[styles.optionSubtitle, { color: c.muted }]}>{subtitle}</Text>
                    </View>
                    <View style={styles.optionArrow}>
                        <Ionicons name="arrow-forward" size={18} color={c.muted} />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

export function AIRoutinePlannerScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const c = { 
        bg: colors.background, 
        card: colors.card, 
        border: colors.border, 
        text: colors.foreground, 
        muted: colors.mutedForeground, 
        primary: colors.primary.main, 
        surface: colors.muted,
        shadow: '#000'
    };
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
        navigation.navigate('AITemplateGenerator');
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
                    <Text style={[styles.headerTitle, { color: c.text, fontFamily: fontFamilies.display }]}>AI Planner</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={[styles.sparkleContainer, { backgroundColor: colors.chart4 + '20' }]}>
                        <Ionicons name="sparkles" size={20} color={colors.chart4} />
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            >
                <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slide }] }]}>

                    {/* Intro Banner */}
                    <View style={styles.introSection}>
                        <View style={[styles.introBanner, { backgroundColor: c.card, borderColor: c.primary, borderWidth: 1 }]}>
                            <View style={styles.introContent}>
                                <Text style={[styles.introLabel, { color: c.primary }]}>YOUR PERSONAL AI TRAINER</Text>
                                <Text style={[styles.introHeadline, { color: c.text }]}>Let AI build your{'\n'}perfect program</Text>
                                <Text style={[styles.introBody, { color: c.muted }]}>
                                    Create personalized routines, templates and get expert coaching — all powered by AI.
                                </Text>
                            </View>
                            <View style={[styles.introBrainBubble, { backgroundColor: `${c.primary}15` }]}>
                                <MaterialCommunityIcons name="brain" size={40} color={c.primary} />
                            </View>
                        </View>
                    </View>

                    {/* Options Label */}
                    <Text style={[styles.sectionLabel, { color: c.muted }]}>CHOOSE AN OPTION</Text>

                    {/* Option 1: AI Coach */}
                    <AIOptionCard
                        icon="robot-outline"
                        title="AI Coach"
                        subtitle="Chat with your personal AI coach for advice, form tips & motivation"
                        accentColor={colors.chart1 || '#3B82F6'}
                        badge="CHAT"
                        onPress={goToAICoach}
                        c={c}
                    />

                    {/* Option 2: Generate Routine */}
                    <AIOptionCard
                        icon="clipboard-list-outline"
                        title="Generate Routine with AI"
                        subtitle="Build a full weekly training program based on your goals, level & schedule"
                        accentColor={colors.chart2 || '#10B981'}
                        badge="BUILD"
                        onPress={goToAIGenerator}
                        c={c}
                    />

                    {/* Option 3: Generate Template */}
                    <AIOptionCard
                        icon="file-document-edit-outline"
                        title="Generate Template with AI"
                        subtitle="Create a single workout template — exercises, sets & reps auto-selected"
                        accentColor={colors.chart3 || '#F59E0B'}
                        badge="CREATE"
                        onPress={goToTemplateGenerator}
                        c={c}
                    />

                    {/* Tips section */}
                    <View style={[styles.tipsCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <View style={styles.tipsTitleRow}>
                            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={c.primary} />
                            <Text style={[styles.tipsTitle, { color: c.text }]}>Pro Tips</Text>
                        </View>
                        {[
                            'Be specific about your goals for better results',
                            'Share your available equipment for accurate plans',
                            'Mention your experience level (beginner, intermediate, advanced)',
                        ].map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={[styles.tipDot, { backgroundColor: c.primary }]} />
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
    introBanner: { borderRadius: 20, padding: 22, flexDirection: 'row', alignItems: 'center' },
    introContent: { flex: 1 },
    introLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
    introHeadline: { fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 8 },
    introBody: { fontSize: 13, lineHeight: 18 },
    introBrainBubble: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },

    sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },

    // Option Card
    optionWrapper: {
        marginBottom: 14,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
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
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    optionBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    optionIconBg: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    optionTextBlock: { flex: 1, paddingRight: 30 },
    optionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 5 },
    optionSubtitle: { fontSize: 13, lineHeight: 18 },
    optionArrow: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

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
    tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
    tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});

