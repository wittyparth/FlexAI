import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fontFamilies } from '../../theme/typography';
import { useAuthQueries } from '../../hooks/queries/useAuthQueries';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import { NavigationBar, ListItem, Button, Divider } from '../../components/ui';

export function SettingsScreen({ navigation }: any) {
    const colors = useColors();
    const { isDark, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();

    const { settingsQuery, deleteAccountMutation } = useUserQueries();
    const { logoutMutation } = useAuthQueries();
    const units = settingsQuery.data?.units || 'metric';

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
                { id: 'account_security', label: 'Account Security', icon: 'shield-checkmark-outline', type: 'nav' },
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
            case 'account_security':
                navigation.navigate('AccountSecurity');
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

    const handleLogout = () => {
        Alert.alert('Log out', 'Do you want to log out from this device?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log out',
                style: 'destructive',
                onPress: () => logoutMutation.mutate(),
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete account',
            'This will permanently remove your account and data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteAccountMutation.mutate(),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <NavigationBar
                title="Settings"
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                    {getSettingsSections().map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
                            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: (colors as any).cardBorder ?? colors.border }]}>
                                {section.items.map((item, index) => (
                                    item.type === 'toggle' ? (
                                        <ListItem
                                            key={item.id}
                                            icon={item.icon as any}
                                            title={item.label}
                                            showChevron={false}
                                            showDivider={index < section.items.length - 1}
                                            rightElement={
                                                <Switch
                                                    value={item.id === 'theme' ? isDark : false}
                                                    onValueChange={item.id === 'theme' ? toggleTheme : undefined}
                                                    trackColor={{ false: (colors as any).cardBorder ?? colors.border, true: colors.primary.main }}
                                                    thumbColor="#FFF"
                                                />
                                            }
                                        />
                                    ) : (
                                        <ListItem
                                            key={item.id}
                                            icon={item.icon as any}
                                            title={item.label}
                                            subtitle={item.value}
                                            showChevron={item.type === 'nav'}
                                            showDivider={index < section.items.length - 1}
                                            onPress={item.type === 'nav' ? () => handleNavigation(item) : undefined}
                                        />
                                    )
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Logout Button */}
                    <View style={styles.actionSection}>
                        <Button
                            variant="outlined"
                            label={logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
                            leftElement={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
                            textStyle={{ color: colors.error }}
                            style={{ borderColor: colors.error }}
                            onPress={handleLogout}
                            disabled={logoutMutation.isPending || deleteAccountMutation.isPending}
                        />
                        <Button
                            variant="ghost"
                            label={deleteAccountMutation.isPending ? 'Deleting account...' : 'Delete Account'}
                            textStyle={{ color: colors.mutedForeground, fontSize: 14 }}
                            onPress={handleDeleteAccount}
                            disabled={deleteAccountMutation.isPending || logoutMutation.isPending}
                        />
                    </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 11, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    actionSection: { marginTop: 32, paddingHorizontal: 16, gap: 8 },
});
