/**
 * Profile Screen
 * 
 * User profile with logout functionality
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { authStore } from '../../store/authStore';
import { API_BASE_URL } from '../../api/client';
import { Avatar, Button, Card, ListItem, Divider } from '../../components/ui';

export function ProfileScreen() {
    const colors = useColors();
    const user = authStore((state) => state.user);
    const authPhase = authStore((state) => state.authPhase);
    const isAuthenticated = authPhase.phase === 'ready';
    const logout = authStore((state) => state.logout);

    const handleLogout = () => {
        console.log('🔘 [PROFILE] Logout button pressed');
        console.log('🔘 [PROFILE] Current auth state:', { isAuthenticated, hasUser: !!user });

        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('❌ [PROFILE] Logout cancelled'),
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        console.log('🚪 [PROFILE] Logout confirmed, calling logout()...');
                        try {
                            await logout();
                            console.log('✅ [PROFILE] Logout completed successfully');
                        } catch (error) {
                            console.error('❌ [PROFILE] Logout failed:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
                </View>

                {/* User Info Card */}
                <Card style={styles.profileCard} variant="elevated">
                    <Avatar
                        initials={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                        size="xl"
                        backgroundColor={colors.primary.main}
                        style={{ marginBottom: 12 }}
                    />
                    <Text style={[styles.name, { color: colors.foreground }]}>
                        {user?.firstName || 'User'} {user?.lastName || ''}
                    </Text>
                    <Text style={[styles.email, { color: colors.mutedForeground }]}>
                        {user?.email || 'user@example.com'}
                    </Text>
                </Card>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
                    <Card style={styles.menuCard} padding="none">
                        <ListItem
                            icon="settings-outline"
                            title="Settings"
                            showDivider
                        />
                        <ListItem
                            icon="notifications-outline"
                            title="Notifications"
                            showDivider={false}
                        />
                    </Card>
                </View>

                {/* Debug Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DEBUG INFO</Text>
                    <Card style={styles.debugCard} padding="none">
                        {[
                            ['API', API_BASE_URL],
                            ['User ID', user?.id || 'Not logged in'],
                            ['Authenticated', isAuthenticated ? 'Yes' : 'No'],
                            ['Onboarded', user?.onboardingCompleted ? 'Yes' : 'No'],
                        ].map(([label, value], i, arr) => (
                            <ListItem
                                key={label}
                                title={label}
                                subtitle={String(value)}
                                showChevron={false}
                                showDivider={i < arr.length - 1}
                            />
                        ))}
                    </Card>
                </View>

                {/* Logout Button */}
                <View style={styles.actionSection}>
                    <Button
                        variant="primary"
                        label="Logout"
                        leftElement={<Ionicons name="log-out-outline" size={20} color="#fff" />}
                        style={{ backgroundColor: colors.error }}
                        onPress={handleLogout}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: spacing[6],
        paddingBottom: spacing[4],
    },
    title: {
        fontFamily: fontFamilies.display,
        fontSize: 32,
        fontWeight: '700',
    },
    profileCard: {
        marginHorizontal: spacing[6],
        padding: spacing[6],
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    name: {
        fontFamily: fontFamilies.display,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 2,
    },
    email: {
        fontFamily: fontFamilies.body,
        fontSize: 14,
    },
    section: {
        marginBottom: spacing[4],
        paddingHorizontal: spacing[6],
    },
    sectionTitle: {
        fontFamily: fontFamilies.bodySemibold,
        fontSize: 11,
        letterSpacing: 0.8,
        marginBottom: spacing[3],
        textTransform: 'uppercase',
    },
    menuCard: {
        overflow: 'hidden',
    },
    debugCard: {
        overflow: 'hidden',
    },
    actionSection: {
        paddingHorizontal: spacing[6],
        marginTop: spacing[4],
    },
});
