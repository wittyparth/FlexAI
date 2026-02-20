import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { colors as themeColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

// ============================================================
// QUICK PROMPTS
// ============================================================
const QUICK_PROMPTS = [
    { id: 1, title: 'Hypertrophy Focus', description: 'Maximize muscle growth', icon: 'arm-flex', accent: '#6366F1', duration: 60 },
    { id: 2, title: 'Strength Builder', description: 'Get stronger, lift heavier', icon: 'weight-lifter', accent: '#EC4899', duration: 75 },
    { id: 3, title: 'HIIT Circuit', description: 'High intensity fat burn', icon: 'fire', accent: '#EF4444', duration: 30 },
    { id: 4, title: 'Quick Pump', description: 'Get in, get out, look great', icon: 'lightning-bolt', accent: '#10B981', duration: 20 },
    { id: 5, title: 'Full Body Blast', description: 'Hit every muscle group', icon: 'human', accent: '#F59E0B', duration: 45 },
    { id: 6, title: 'Upper Power', description: 'Chest, back, shoulders', icon: 'human-handsup', accent: '#06B6D4', duration: 50 },
];

const RECENT_PROMPTS = [
    'Give me a chest workout with only dumbbells',
    'Quick 20 minute core routine',
    'Shoulder workout avoiding overhead movements',
];

export function AIPromptsScreen({ navigation, route }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const handlePromptSelect = (prompt: typeof QUICK_PROMPTS[0]) => {
        navigation.navigate('AIGenerator', { presetGoal: prompt.title, presetDuration: prompt.duration });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="close" size={26} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Quick Prompts</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {/* Hero Section */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.heroSection}>
                        <View style={[styles.heroIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={36} color={colors.primary.main} />
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.foreground }]}>Instant Workouts</Text>
                        <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                            Select a preset or create your own custom prompt
                        </Text>
                    </View>
                </Animated.View>

                {/* Quick Prompts Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Popular Presets</Text>
                    <View style={styles.promptsGrid}>
                        {QUICK_PROMPTS.map((prompt, index) => (
                            <Animated.View
                                key={prompt.id}
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20 + index * 5, 0]
                                        })
                                    }]
                                }}
                            >
                                <TouchableOpacity
                                    style={[styles.promptCard, { shadowColor: '#000' }]}
                                    onPress={() => handlePromptSelect(prompt)}
                                    activeOpacity={0.95}
                                >
                                    <View style={[styles.promptGradient, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                                        <View style={[styles.promptIconContainer, { backgroundColor: `${prompt.accent}15` }]}>
                                            <MaterialCommunityIcons name={prompt.icon as any} size={28} color={prompt.accent} />
                                        </View>
                                        <Text style={[styles.promptTitle, { color: colors.foreground }]}>{prompt.title}</Text>
                                        <Text style={[styles.promptDesc, { color: colors.mutedForeground }]}>{prompt.description}</Text>
                                        <View style={styles.promptMeta}>
                                            <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
                                            <Text style={[styles.promptDuration, { color: colors.mutedForeground }]}>{prompt.duration} min</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Recent Prompts */}
                {RECENT_PROMPTS.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent</Text>
                            <TouchableOpacity>
                                <Text style={[styles.clearText, { color: colors.mutedForeground }]}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                        {RECENT_PROMPTS.map((prompt, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => navigation.navigate('AIGenerator', { customPrompt: prompt })}
                            >
                                <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
                                <Text style={[styles.recentText, { color: colors.foreground }]} numberOfLines={1}>{prompt}</Text>
                                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Custom Prompt CTA */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.customCard, { backgroundColor: colors.card, borderColor: colors.primary.main }]}
                        onPress={() => navigation.navigate('AIGenerator')}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.customIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                            <MaterialCommunityIcons name="pencil-plus" size={26} color={colors.primary.main} />
                        </View>
                        <View style={styles.customContent}>
                            <Text style={[styles.customTitle, { color: colors.foreground }]}>Create Custom Prompt</Text>
                            <Text style={[styles.customDesc, { color: colors.mutedForeground }]}>
                                Describe your perfect workout in detail
                            </Text>
                        </View>
                        <Ionicons name="arrow-forward" size={22} color={colors.primary.main} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 140 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    scroll: { padding: 16 },
    heroSection: { alignItems: 'center', paddingVertical: 24 },
    heroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    heroTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8, fontFamily: fontFamilies.display },
    heroSubtitle: { fontSize: 15, textAlign: 'center', maxWidth: '80%', lineHeight: 22 },
    section: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    clearText: { fontSize: 14 },
    promptsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    promptCard: { width: (width - 44) / 2, height: 160, borderRadius: 22, overflow: 'hidden', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    promptGradient: { flex: 1, padding: 18, justifyContent: 'space-between', borderRadius: 22 },
    promptIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    promptTitle: { fontSize: 17, fontWeight: '800', marginTop: 8 },
    promptDesc: { fontSize: 13 },
    promptMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    promptDuration: { fontSize: 13 },
    recentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, gap: 12 },
    recentText: { flex: 1, fontSize: 15 },
    customCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', gap: 16 },
    customIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    customContent: { flex: 1 },
    customTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    customDesc: { fontSize: 14 },
});
