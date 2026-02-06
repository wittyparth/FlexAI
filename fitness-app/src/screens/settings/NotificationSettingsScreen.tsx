import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';

export function NotificationSettingsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [pushEnabled, setPushEnabled] = useState(true);
    const [workoutReminders, setWorkoutReminders] = useState(true);
    const [restTimerAlerts, setRestTimerAlerts] = useState(true);
    const [prAlerts, setPrAlerts] = useState(true);
    const [socialLikes, setSocialLikes] = useState(true);
    const [socialComments, setSocialComments] = useState(true);
    const [socialFollows, setSocialFollows] = useState(true);
    const [challengeUpdates, setChallengeUpdates] = useState(false);
    const [weeklyProgress, setWeeklyProgress] = useState(true);
    const [tips, setTips] = useState(false);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const NotificationItem = ({ label, description, value, onValueChange, disabled }: any) => (
        <View style={[styles.notificationItem, { opacity: disabled ? 0.5 : 1 }]}>
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationLabel, { color: colors.foreground }]}>{label}</Text>
                {description && <Text style={[styles.notificationDesc, { color: colors.mutedForeground }]}>{description}</Text>}
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
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Notifications</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Master Toggle */}
                    <View style={styles.section}>
                        <View style={[styles.masterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.masterIcon, { backgroundColor: `${colors.primary.main}15` }]}>
                                <Ionicons name="notifications" size={28} color={colors.primary.main} />
                            </View>
                            <View style={styles.masterContent}>
                                <Text style={[styles.masterLabel, { color: colors.foreground }]}>Push Notifications</Text>
                                <Text style={[styles.masterDesc, { color: colors.mutedForeground }]}>
                                    {pushEnabled ? 'All notifications enabled' : 'All notifications disabled'}
                                </Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: colors.muted, true: colors.primary.main }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>

                    {/* Workout */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Workout</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <NotificationItem
                                label="Workout Reminders"
                                description="Daily reminders based on your schedule"
                                value={workoutReminders}
                                onValueChange={setWorkoutReminders}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="Rest Timer Alerts"
                                description="Vibrate when rest period ends"
                                value={restTimerAlerts}
                                onValueChange={setRestTimerAlerts}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="New PR Alerts"
                                description="Celebrate when you hit a new record"
                                value={prAlerts}
                                onValueChange={setPrAlerts}
                                disabled={!pushEnabled}
                            />
                        </View>
                    </View>

                    {/* Social */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Social</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <NotificationItem
                                label="Likes"
                                value={socialLikes}
                                onValueChange={setSocialLikes}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="Comments"
                                value={socialComments}
                                onValueChange={setSocialComments}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="New Followers"
                                value={socialFollows}
                                onValueChange={setSocialFollows}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="Challenge Updates"
                                value={challengeUpdates}
                                onValueChange={setChallengeUpdates}
                                disabled={!pushEnabled}
                            />
                        </View>
                    </View>

                    {/* Other */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Other</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <NotificationItem
                                label="Weekly Progress Report"
                                description="Summary of your week's achievements"
                                value={weeklyProgress}
                                onValueChange={setWeeklyProgress}
                                disabled={!pushEnabled}
                            />
                            <NotificationItem
                                label="Tips & Motivation"
                                description="Occasional fitness tips and quotes"
                                value={tips}
                                onValueChange={setTips}
                                disabled={!pushEnabled}
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
    notificationItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
    notificationContent: { flex: 1 },
    notificationLabel: { fontSize: 16, fontWeight: '500' },
    notificationDesc: { fontSize: 13, marginTop: 2 },
});
