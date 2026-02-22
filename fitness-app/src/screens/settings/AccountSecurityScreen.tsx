import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { NavigationBar, ListItem } from '../../components/ui';
import { useUserQueries } from '../../hooks/queries/useUserQueries';

export function AccountSecurityScreen({ navigation }: any) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const { profileQuery, deleteAccountMutation } = useUserQueries();

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, []);

    const email = profileQuery.data?.email ?? 'Not available';
    const joinedOn = profileQuery.data?.createdAt
        ? new Date(profileQuery.data.createdAt).toLocaleDateString()
        : 'Unknown';

    const handleDelete = () => {
        Alert.alert(
            'Delete account',
            'This will permanently delete your account and cannot be undone.',
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

    const SecurityRow = ({
        icon,
        label,
        value,
        onPress,
        danger,
        isLast,
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        label: string;
        value?: string;
        onPress?: () => void;
        danger?: boolean;
        isLast?: boolean;
    }) => (
        <TouchableOpacity
            style={[
                styles.settingItem,
                !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View
                style={[
                    styles.settingIcon,
                    { backgroundColor: danger ? `${colors.error}10` : `${colors.primary.main}10` },
                ]}
            >
                <Ionicons name={icon} size={22} color={danger ? colors.error : colors.primary.main} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
                {value && (
                    <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
                )}
            </View>
            {onPress && <Ionicons name="chevron-forward" size={20} color={danger ? colors.error : colors.mutedForeground} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <NavigationBar
                title="Account & Security"
                onBack={() => navigation.goBack()}
                rightActions={deleteAccountMutation.isPending ? [{ icon: 'time-outline', onPress: () => {}, label: 'Loading' }] : []}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Security</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <ListItem
                                icon="lock-closed-outline"
                                title="Change Password"
                                subtitle="Update your login credentials"
                                showChevron
                                showDivider
                                onPress={() => navigation.navigate('ChangePassword')}
                            />
                            <ListItem
                                icon="mail-outline"
                                title="Email"
                                subtitle={email}
                                showDivider
                            />
                            <ListItem
                                icon="calendar-outline"
                                title="Joined"
                                subtitle={joinedOn}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.error }]}>Danger Zone</Text>
                        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                            <ListItem
                                icon="trash-outline"
                                title="Delete Account"
                                subtitle="Permanently remove your account"
                                showChevron
                                destructive
                                onPress={handleDelete}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionCard: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 13,
        marginTop: 2,
    },
});
