import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fontFamilies } from '../../theme/typography';
import { useUserQueries } from '../../hooks/queries/useUserQueries';

export function SettingsScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { settingsQuery } = useUserQueries();
    const units = settingsQuery.data?.units || 'metric';

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const getSettingsSections = () => [
        {
            title: 'Preferences',
            items: [
                {
                    id: 'units',
                    label: 'Units',
                    value: units === 'imperial' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)',
                    icon: 'scale-outline',
                    type: 'nav'
                },
                { id: 'theme', label: 'Dark Mode', icon: 'moon-outline', type: 'toggle' },
                { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', type: 'nav' },
            ],
        },
        {
            title: 'Account',
            items: [
                { id: 'profile', label: 'Edit Profile', icon: 'person-outline', type: 'nav' },
                { id: 'password', label: 'Change Password', icon: 'lock-closed-outline', type: 'nav' },
                { id: 'privacy', label: 'Privacy Settings', icon: 'shield-outline', type: 'nav' },
            ],
        },
        {
            title: 'Support',
            items: [
                { id: 'help', label: 'Help & FAQ', icon: 'help-circle-outline', type: 'nav' },
                { id: 'feedback', label: 'Send Feedback', icon: 'chatbubble-outline', type: 'nav' },
                { id: 'rate', label: 'Rate the App', icon: 'star-outline', type: 'nav' },
            ],
        },
        {
            title: 'About',
            items: [
                { id: 'version', label: 'Version', value: '2.1.0', icon: 'information-circle-outline', type: 'info' },
                { id: 'terms', label: 'Terms of Service', icon: 'document-text-outline', type: 'nav' },
                { id: 'privacy_policy', label: 'Privacy Policy', icon: 'shield-checkmark-outline', type: 'nav' },
            ],
        },
    ];

    const handleNavigation = (item: any) => {
        if (item.type !== 'nav') return;

        switch (item.id) {
            case 'units':
                navigation.navigate('UnitsPreferences');
                break;
            case 'notifications':
                navigation.navigate('NotificationSettings');
                break;
            case 'profile':
                navigation.navigate('EditProfile');
                break;
            case 'password':
                navigation.navigate('ChangePassword');
                break;
            case 'privacy':
                navigation.navigate('PrivacySettings');
                break;
            case 'help':
                navigation.navigate('HelpSupport');
                break;
            case 'about':
                navigation.navigate('About');
                break;
            case 'feedback':
            case 'rate':
            case 'terms':
            case 'privacy_policy':
                Alert.alert('Coming Soon', 'This feature is not yet implemented.');
                break;
            default:
                break;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Settings</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {getSettingsSections().map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
                            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {section.items.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.settingItem,
                                            index < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                                        ]}
                                        activeOpacity={item.type === 'toggle' || item.type === 'info' ? 1 : 0.7}
                                        disabled={item.type === 'toggle' || item.type === 'info'}
                                        onPress={() => handleNavigation(item)}
                                    >
                                        <View style={[styles.settingIcon, { backgroundColor: `${colors.primary.main}10` }]}>
                                            <Ionicons name={item.icon as any} size={22} color={colors.primary.main} />
                                        </View>
                                        <View style={styles.settingContent}>
                                            <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                                            {item.value && item.type !== 'toggle' && (
                                                <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{item.value}</Text>
                                            )}
                                        </View>
                                        {item.type === 'toggle' && (
                                            <Switch
                                                value={item.id === 'theme' ? isDark : false}
                                                onValueChange={item.id === 'theme' ? toggleTheme : undefined}
                                                trackColor={{ false: colors.muted, true: colors.primary.main }}
                                                thumbColor="#FFF"
                                            />
                                        )}
                                        {item.type === 'nav' && (
                                            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Logout Button */}
                    <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]}>
                        <Ionicons name="log-out-outline" size={22} color={colors.error} />
                        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                    </TouchableOpacity>

                    {/* Delete Account */}
                    <TouchableOpacity style={styles.deleteBtn}>
                        <Text style={[styles.deleteText, { color: colors.mutedForeground }]}>Delete Account</Text>
                    </TouchableOpacity>
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
    headerTitle: { fontSize: 20, fontWeight: '700' },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
    settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    settingContent: { flex: 1 },
    settingLabel: { fontSize: 16, fontWeight: '500' },
    settingValue: { fontSize: 14, marginTop: 2 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
    logoutText: { fontSize: 16, fontWeight: '600' },
    deleteBtn: { alignItems: 'center', marginTop: 20, padding: 12 },
    deleteText: { fontSize: 14 },
});
