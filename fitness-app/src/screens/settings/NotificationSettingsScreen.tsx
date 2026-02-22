import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    Animated,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { IconButton } from '../../components/ui';
import { fontFamilies } from '../../theme/typography';
import { useRegisterNotificationDevice } from '../../hooks';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import type { UserSettings } from '../../api/user.api';

type SettingsBooleanKey = keyof Pick<
    UserSettings,
    'pushEnabled' | 'workoutReminders' | 'socialNotifications' | 'emailUpdates'
>;

export function NotificationSettingsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { settingsQuery, updateSettingsMutation } = useUserQueries();
    const registerDeviceMutation = useRegisterNotificationDevice();
    const settings = settingsQuery.data;

    const [restTimerAlerts, setRestTimerAlerts] = useState(true);
    const [prAlerts, setPrAlerts] = useState(true);
    const [challengeUpdates, setChallengeUpdates] = useState(false);
    const [tips, setTips] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const handleRemoteToggle = async (key: SettingsBooleanKey, value: boolean) => {
        try {
            await updateSettingsMutation.mutateAsync({ [key]: value });
            if (key === 'pushEnabled' && value) {
                await registerDeviceMutation.mutateAsync();
            }
        } catch (error: any) {
            Alert.alert('Update failed', error?.message || 'Could not update notification settings.');
        }
    };

    const pushEnabled = settings?.pushEnabled ?? true;
    const workoutReminders = settings?.workoutReminders ?? true;
    const socialNotifications = settings?.socialNotifications ?? true;
    const emailUpdates = settings?.emailUpdates ?? true;
    const isBusy =
        settingsQuery.isLoading ||
        updateSettingsMutation.isPending ||
        registerDeviceMutation.isPending;

    const NotificationItem = ({
        label,
        description,
        value,
        onValueChange,
        disabled,
        localOnly,
        isLast,
    }: {
        label: string;
        description?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        disabled?: boolean;
        localOnly?: boolean;
        isLast?: boolean;
    }) => (
        <View
            style={[
                styles.notificationItem,
                { opacity: disabled ? 0.5 : 1 },
                !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
        >
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationLabel, { color: colors.foreground }]}>{label}</Text>
                {description && <Text style={[styles.notificationDesc, { color: colors.mutedForeground }]}>{description}</Text>}
                {localOnly && (
                    <Text style={[styles.localOnlyText, { color: colors.mutedForeground }]}>Device-only setting</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.muted, true: colors.primary.main }}
                thumbColor="#FFF"
                disabled={disabled}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <IconButton icon="arrow-back" variant="ghost" onPress={() => navigation.goBack()} />
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Notifications</Text>
                <View style={styles.headerBtn}>
                    {isBusy && <ActivityIndicator size="small" color={colors.primary.main} />}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <View style={[styles.masterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.masterIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Ionicons name="notifications" size={28} color={colors.primary.main} />
                            </View>
                            <View style={styles.masterContent}>
                                <Text style={[styles.masterLabel, { color: colors.foreground }]}>Push Notifications</Text>
                                <Text style={[styles.masterDesc, { color: colors.mutedForeground }]}>
                                    {pushEnabled ? 'Backend sync enabled' : 'Backend sync disabled'}
                                </Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={(value) => handleRemoteToggle('pushEnabled', value)}
                                trackColor={{ false: colors.muted, true: colors.primary.main }}
                                thumbColor="#FFF"
                                disabled={updateSettingsMutation.isPending}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Synced Preferences</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <NotificationItem
                                label="Workout Reminders"
                                description="Daily reminders based on your schedule"
                                value={workoutReminders}
                                onValueChange={(value) => handleRemoteToggle('workoutReminders', value)}
                                disabled={!pushEnabled || updateSettingsMutation.isPending}
                            />
                            <NotificationItem
                                label="Social Notifications"
                                description="Likes, comments, and follows"
                                value={socialNotifications}
                                onValueChange={(value) => handleRemoteToggle('socialNotifications', value)}
                                disabled={!pushEnabled || updateSettingsMutation.isPending}
                            />
                            <NotificationItem
                                label="Email Updates"
                                description="Product updates and weekly summaries"
                                value={emailUpdates}
                                onValueChange={(value) => handleRemoteToggle('emailUpdates', value)}
                                disabled={!pushEnabled || updateSettingsMutation.isPending}
                                isLast
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Device Only</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <NotificationItem
                                label="Rest Timer Alerts"
                                description="Vibrate when rest period ends"
                                value={restTimerAlerts}
                                onValueChange={setRestTimerAlerts}
                                disabled={!pushEnabled}
                                localOnly
                            />
                            <NotificationItem
                                label="New PR Alerts"
                                description="Celebrate when you hit a new record"
                                value={prAlerts}
                                onValueChange={setPrAlerts}
                                disabled={!pushEnabled}
                                localOnly
                            />
                            <NotificationItem
                                label="Challenge Updates"
                                value={challengeUpdates}
                                onValueChange={setChallengeUpdates}
                                disabled={!pushEnabled}
                                localOnly
                            />
                            <NotificationItem
                                label="Tips & Motivation"
                                value={tips}
                                onValueChange={setTips}
                                disabled={!pushEnabled}
                                localOnly
                                isLast
                            />
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
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    masterCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 18, borderWidth: 1, gap: 14 },
    masterIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    masterContent: { flex: 1 },
    masterLabel: { fontSize: 17, fontWeight: '600' },
    masterDesc: { fontSize: 13, marginTop: 2 },
    notificationItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    notificationContent: { flex: 1, paddingRight: 12 },
    notificationLabel: { fontSize: 16, fontWeight: '500' },
    notificationDesc: { fontSize: 13, marginTop: 2 },
    localOnlyText: { fontSize: 11, marginTop: 4, fontWeight: '600' },
});
