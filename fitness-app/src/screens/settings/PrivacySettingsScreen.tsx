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

export function PrivacySettingsScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [profilePublic, setProfilePublic] = useState(true);
    const [showWorkouts, setShowWorkouts] = useState(true);
    const [showStats, setShowStats] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const [allowFollowers, setAllowFollowers] = useState(true);
    const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const PrivacyItem = ({ label, description, value, onValueChange }: any) => (
        <View style={[styles.privacyItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.privacyContent}>
                <Text style={[styles.privacyLabel, { color: colors.foreground }]}>{label}</Text>
                {description && <Text style={[styles.privacyDesc, { color: colors.mutedForeground }]}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.muted, true: colors.primary.main }}
                thumbColor="#FFF"
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
                <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: fontFamilies.display }]}>Privacy</Text>
                <View style={styles.headerBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Profile Visibility */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Profile Visibility</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <PrivacyItem
                                label="Public Profile"
                                description="Anyone can view your profile"
                                value={profilePublic}
                                onValueChange={setProfilePublic}
                            />
                            <PrivacyItem
                                label="Show Workouts"
                                description="Display workout history on profile"
                                value={showWorkouts}
                                onValueChange={setShowWorkouts}
                            />
                            <PrivacyItem
                                label="Show Statistics"
                                description="Display PRs and volume stats"
                                value={showStats}
                                onValueChange={setShowStats}
                            />
                            <View style={styles.privacyItem}>
                                <View style={styles.privacyContent}>
                                    <Text style={[styles.privacyLabel, { color: colors.foreground }]}>Show Progress Photos</Text>
                                    <Text style={[styles.privacyDesc, { color: colors.mutedForeground }]}>Display transformation photos</Text>
                                </View>
                                <Switch
                                    value={showPhotos}
                                    onValueChange={setShowPhotos}
                                    trackColor={{ false: colors.muted, true: colors.primary.main }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Social */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Social</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <PrivacyItem
                                label="Allow Follow Requests"
                                description="Let others follow your profile"
                                value={allowFollowers}
                                onValueChange={setAllowFollowers}
                            />
                            <View style={styles.privacyItem}>
                                <View style={styles.privacyContent}>
                                    <Text style={[styles.privacyLabel, { color: colors.foreground }]}>Show on Leaderboards</Text>
                                    <Text style={[styles.privacyDesc, { color: colors.mutedForeground }]}>Appear in public rankings</Text>
                                </View>
                                <Switch
                                    value={showOnLeaderboard}
                                    onValueChange={setShowOnLeaderboard}
                                    trackColor={{ false: colors.muted, true: colors.primary.main }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Data */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Data & Privacy</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TouchableOpacity style={styles.navItem}>
                                <View style={[styles.navIcon, { backgroundColor: `${colors.primary.main}10` }]}>
                                    <Ionicons name="download-outline" size={22} color={colors.primary.main} />
                                </View>
                                <Text style={[styles.navLabel, { color: colors.foreground }]}>Download My Data</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.navItem, { borderBottomWidth: 0 }]}>
                                <View style={[styles.navIcon, { backgroundColor: `${colors.primary.main}10` }]}>
                                    <Ionicons name="document-text-outline" size={22} color={colors.primary.main} />
                                </View>
                                <Text style={[styles.navLabel, { color: colors.foreground }]}>Privacy Policy</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: `${colors.primary.main}08`, borderColor: `${colors.primary.main}20` }]}>
                        <Ionicons name="information-circle" size={24} color={colors.primary.main} />
                        <Text style={[styles.infoText, { color: colors.foreground }]}>
                            Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
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
    navItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14, borderBottomWidth: 1 },
    navIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    navLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
    infoCard: { flexDirection: 'row', margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
