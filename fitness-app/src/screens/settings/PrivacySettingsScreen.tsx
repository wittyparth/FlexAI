import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { useUserQueries } from '../../hooks/queries/useUserQueries';
import type { UserSettings } from '../../api/user.api';

type PrivacyBooleanKey = keyof Pick<UserSettings, 'profilePrivate' | 'showWorkouts' | 'showStats'>;

export function PrivacySettingsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { settingsQuery, updateSettingsMutation } = useUserQueries();
    const settings = settingsQuery.data;

    const [showPhotos, setShowPhotos] = useState(false);
    const [allowFollowers, setAllowFollowers] = useState(true);
    const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [fadeAnim]);

    const handleRemoteToggle = async (key: PrivacyBooleanKey, value: boolean) => {
        try {
            await updateSettingsMutation.mutateAsync({ [key]: value });
        } catch (error: any) {
            Alert.alert('Update failed', error?.message || 'Could not update privacy settings.');
        }
    };

    const profilePrivate = settings?.profilePrivate ?? false;
    const showWorkouts = settings?.showWorkouts ?? true;
    const showStats = settings?.showStats ?? true;
    const isBusy = settingsQuery.isLoading || updateSettingsMutation.isPending;

    const PrivacyItem = ({
        label,
        description,
        value,
        onValueChange,
        localOnly,
        isLast,
    }: {
        label: string;
        description?: string;
        value: boolean;
        onValueChange: (value: boolean) => void;
        localOnly?: boolean;
        isLast?: boolean;
    }) => (
        <View
            style={[
                styles.privacyItem,
                !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
        >
            <View style={styles.privacyContent}>
                <Text style={[styles.privacyLabel, { color: colors.foreground }]}>{label}</Text>
                {description && <Text style={[styles.privacyDesc, { color: colors.mutedForeground }]}>{description}</Text>}
                {localOnly && (
                    <Text style={[styles.localOnlyText, { color: colors.mutedForeground }]}>Device-only setting</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.muted, true: colors.primary.main }}
                thumbColor="#FFF"
                disabled={updateSettingsMutation.isPending}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Privacy</Text>
                <View style={styles.headerBtn}>
                    {isBusy && <ActivityIndicator size="small" color={colors.primary.main} />}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Synced Privacy</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <PrivacyItem
                                label="Private Profile"
                                description="Only approved followers can view your profile"
                                value={profilePrivate}
                                onValueChange={(value) => handleRemoteToggle('profilePrivate', value)}
                            />
                            <PrivacyItem
                                label="Show Workouts"
                                description="Display workout history on profile"
                                value={showWorkouts}
                                onValueChange={(value) => handleRemoteToggle('showWorkouts', value)}
                            />
                            <PrivacyItem
                                label="Show Statistics"
                                description="Display PRs and volume stats"
                                value={showStats}
                                onValueChange={(value) => handleRemoteToggle('showStats', value)}
                                isLast
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Device Only</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <PrivacyItem
                                label="Show Progress Photos"
                                description="Display transformation photos"
                                value={showPhotos}
                                onValueChange={setShowPhotos}
                                localOnly
                            />
                            <PrivacyItem
                                label="Allow Follow Requests"
                                description="Let others follow your profile"
                                value={allowFollowers}
                                onValueChange={setAllowFollowers}
                                localOnly
                            />
                            <PrivacyItem
                                label="Show on Leaderboards"
                                description="Appear in public rankings"
                                value={showOnLeaderboard}
                                onValueChange={setShowOnLeaderboard}
                                localOnly
                                isLast
                            />
                        </View>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <Ionicons name="information-circle" size={24} color={colors.primary.main} />
                        <Text style={[styles.infoText, { color: colors.foreground }]}>
                            Synced privacy settings are saved to your account and apply across devices.
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
    section: { marginTop: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    privacyItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    privacyContent: { flex: 1 },
    privacyLabel: { fontSize: 16, fontWeight: '500' },
    privacyDesc: { fontSize: 13, marginTop: 2 },
    localOnlyText: { fontSize: 11, marginTop: 4, fontWeight: '600' },
    infoCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
