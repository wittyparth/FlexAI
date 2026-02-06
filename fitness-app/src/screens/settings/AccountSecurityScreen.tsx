import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export function AccountSecurityScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const SECURITY_ITEMS = [
        { id: 'password', label: 'Change Password', icon: 'lock-closed-outline', action: 'ChangePassword' },
        { id: 'email', label: 'Update Email', value: 'alex@example.com', icon: 'mail-outline', action: 'UpdateEmail' },
        { id: '2fa', label: 'Two-Factor Authentication', value: 'Disabled', icon: 'shield-checkmark-outline', action: '2FA' },
        { id: 'sessions', label: 'Active Sessions', value: '2 devices', icon: 'phone-portrait-outline', action: 'Sessions' },
    ];

    const DANGER_ITEMS = [
        { id: 'deactivate', label: 'Deactivate Account', icon: 'pause-circle-outline' },
        { id: 'delete', label: 'Delete Account', icon: 'trash-outline', danger: true },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Account & Security</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Security Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Security</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {SECURITY_ITEMS.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.settingItem,
                                        index < SECURITY_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                    ]}
                                    onPress={() => item.action && navigation.navigate(item.action)}
                                >
                                    <View style={[styles.settingIcon, { backgroundColor: `${colors.primary.main}10` }]}>
                                        <Ionicons name={item.icon as any} size={22} color={colors.primary.main} />
                                    </View>
                                    <View style={styles.settingContent}>
                                        <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                                        {item.value && (
                                            <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{item.value}</Text>
                                        )}
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Login History */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Recent Login Activity</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {[
                                { device: 'iPhone 14 Pro', location: 'New York, US', time: 'Now', current: true },
                                { device: 'MacBook Pro', location: 'New York, US', time: '2 hours ago', current: false },
                            ].map((session, i) => (
                                <View key={i} style={[styles.sessionItem, i < 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                    <View style={[styles.sessionIcon, { backgroundColor: session.current ? `${colors.success}15` : `${colors.muted}` }]}>
                                        <Ionicons name="phone-portrait-outline" size={20} color={session.current ? colors.success : colors.mutedForeground} />
                                    </View>
                                    <View style={styles.sessionContent}>
                                        <Text style={[styles.sessionDevice, { color: colors.foreground }]}>{session.device}</Text>
                                        <Text style={[styles.sessionLocation, { color: colors.mutedForeground }]}>{session.location} • {session.time}</Text>
                                    </View>
                                    {session.current && (
                                        <View style={[styles.currentBadge, { backgroundColor: `${colors.success}15` }]}>
                                            <Text style={[styles.currentText, { color: colors.success }]}>Current</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {DANGER_ITEMS.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.settingItem,
                                        index < DANGER_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                    ]}
                                    onPress={() => Alert.alert('Confirm', `Are you sure you want to ${item.label.toLowerCase()}?`)}
                                >
                                    <View style={[styles.settingIcon, { backgroundColor: `${colors.error}10` }]}>
                                        <Ionicons name={item.icon as any} size={22} color={colors.error} />
                                    </View>
                                    <Text style={[styles.settingLabel, { color: colors.error, flex: 1 }]}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.error} />
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
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
    settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: 16, fontWeight: '500' },
    settingValue: { fontSize: 14, marginTop: 2 },
    sessionItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
    sessionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    sessionContent: { flex: 1 },
    sessionDevice: { fontSize: 15, fontWeight: '600' },
    sessionLocation: { fontSize: 13, marginTop: 2 },
    currentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    currentText: { fontSize: 12, fontWeight: '600' },
});
