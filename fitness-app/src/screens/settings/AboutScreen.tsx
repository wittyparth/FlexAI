import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export function AboutScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

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
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>About</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* App Info */}
                    <View style={styles.appSection}>
                        <View style={styles.appIcon}>
                            <Ionicons name="barbell" size={50} color="#FFF" />
                        </View>
                        <Text style={[styles.appName, { color: colors.foreground, fontFamily: fontFamilies.display }]}>FitApp Pro</Text>
                        <Text style={[styles.appVersion, { color: colors.mutedForeground }]}>Version 2.1.0 (Build 142)</Text>
                        <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
                            Your AI-powered fitness companion
                        </Text>
                    </View>

                    {/* Legal Links */}
                    <View style={styles.section}>
                        <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {[
                                { label: 'Terms of Service', icon: 'document-text-outline' },
                                { label: 'Privacy Policy', icon: 'shield-checkmark-outline' },
                                { label: 'Open Source Licenses', icon: 'code-outline' },
                                { label: 'Cookie Policy', icon: 'information-circle-outline' },
                            ].map((link, i) => (
                                <TouchableOpacity key={i} style={[styles.linkItem, i < 3 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                    <View style={[styles.linkIcon, { backgroundColor: `${colors.primary.main}10` }]}>
                                        <Ionicons name={link.icon as any} size={22} color={colors.primary.main} />
                                    </View>
                                    <Text style={[styles.linkLabel, { color: colors.foreground }]}>{link.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Social */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Follow Us</Text>
                        <View style={styles.socialRow}>
                            {[
                                { icon: 'logo-twitter', color: '#1DA1F2' },
                                { icon: 'logo-instagram', color: '#E1306C' },
                                { icon: 'logo-youtube', color: '#FF0000' },
                                { icon: 'logo-tiktok', color: '#000' },
                            ].map((social, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                                >
                                    <Ionicons name={social.icon as any} size={26} color={social.color} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Team */}
                    <View style={styles.section}>
                        <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={styles.teamEmoji}>💪</Text>
                            <Text style={[styles.teamTitle, { color: colors.foreground }]}>Made with ❤️ by FitApp Team</Text>
                            <Text style={[styles.teamDesc, { color: colors.mutedForeground }]}>
                                We're a team of fitness enthusiasts and engineers building the best workout app experience.
                            </Text>
                        </View>
                    </View>

                    {/* Copyright */}
                    <View style={styles.copyrightSection}>
                        <Text style={[styles.copyrightText, { color: colors.mutedForeground }]}>
                            © 2025 FitApp Inc. All rights reserved.
                        </Text>
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
    appSection: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
    appIcon: { width: 100, height: 100, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    appName: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
    appVersion: { fontSize: 14, marginBottom: 10 },
    appTagline: { fontSize: 15, textAlign: 'center' },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    linksCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    linkItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
    linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    linkLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
    socialBtn: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    teamCard: { padding: 24, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
    teamEmoji: { fontSize: 48, marginBottom: 14 },
    teamTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
    teamDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    copyrightSection: { alignItems: 'center', paddingVertical: 20 },
    copyrightText: { fontSize: 13 },
});
