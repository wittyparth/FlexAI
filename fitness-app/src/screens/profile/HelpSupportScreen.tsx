import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

const FAQ_ITEMS = [
    { q: 'How do I track my workouts?', a: 'Go to the Workout tab and tap "Start Workout" or select a routine to begin tracking.' },
    { q: 'How are personal records calculated?', a: 'PRs are automatically detected when you lift more weight than your previous best at any rep range.' },
    { q: 'Can I export my data?', a: 'Yes! Go to Settings > Data > Export Data to download your workout history as a CSV or JSON file.' },
    { q: 'How does the AI Coach work?', a: 'Our AI Coach uses your workout history and goals to provide personalized recommendations and answer fitness questions.' },
];

export function HelpSupportScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [search, setSearch] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Help & Support</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Search */}
                    <View style={styles.searchSection}>
                        <View style={[styles.searchContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                            <Ionicons name="search" size={20} color={colors.mutedForeground} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.foreground }]}
                                placeholder="Search help articles..."
                                placeholderTextColor={colors.mutedForeground}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    {/* Contact Options */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Contact Us</Text>
                        <View style={styles.contactRow}>
                            <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.contactIcon, { backgroundColor: '#0EA5E915' }]}>
                                    <Ionicons name="chatbubbles" size={26} color="#0EA5E9" />
                                </View>
                                <Text style={[styles.contactLabel, { color: colors.foreground }]}>Live Chat</Text>
                                <Text style={[styles.contactDesc, { color: colors.mutedForeground }]}>Online</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.contactIcon, { backgroundColor: '#6366F115' }]}>
                                    <Ionicons name="mail" size={26} color="#6366F1" />
                                </View>
                                <Text style={[styles.contactLabel, { color: colors.foreground }]}>Email</Text>
                                <Text style={[styles.contactDesc, { color: colors.mutedForeground }]}>24h reply</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.contactIcon, { backgroundColor: '#10B98115' }]}>
                                    <Ionicons name="call" size={26} color="#10B981" />
                                </View>
                                <Text style={[styles.contactLabel, { color: colors.foreground }]}>Call</Text>
                                <Text style={[styles.contactDesc, { color: colors.mutedForeground }]}>9am-6pm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FAQ */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Frequently Asked Questions</Text>
                        <View style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {FAQ_ITEMS.map((faq, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                                    onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                >
                                    <View style={styles.faqHeader}>
                                        <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.q}</Text>
                                        <Ionicons
                                            name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                                            size={20}
                                            color={colors.mutedForeground}
                                        />
                                    </View>
                                    {expandedFaq === i && (
                                        <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.a}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Quick Links */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Quick Links</Text>
                        <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {[
                                { label: 'Video Tutorials', icon: 'play-circle-outline' },
                                { label: 'Community Forum', icon: 'people-outline' },
                                { label: 'Feature Requests', icon: 'bulb-outline' },
                                { label: 'Report a Bug', icon: 'bug-outline' },
                            ].map((link, i) => (
                                <TouchableOpacity key={i} style={[styles.linkItem, i < 3 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                    <Ionicons name={link.icon as any} size={22} color={colors.primary.main} />
                                    <Text style={[styles.linkLabel, { color: colors.foreground }]}>{link.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 16, borderBottomWidth: 1 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    searchSection: { padding: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
    searchInput: { flex: 1, paddingVertical: 14, fontSize: 16 },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    contactRow: { flexDirection: 'row', gap: 10 },
    contactCard: { flex: 1, padding: 18, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    contactIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    contactLabel: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
    contactDesc: { fontSize: 12 },
    faqCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    faqItem: { padding: 16 },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    faqQuestion: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 10 },
    faqAnswer: { fontSize: 14, lineHeight: 22, marginTop: 12 },
    linksCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    linkItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    linkLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
});
