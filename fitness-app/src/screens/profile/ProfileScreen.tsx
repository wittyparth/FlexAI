/**
 * Profile Screen
 * 
 * User profile with logout functionality
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';
import { fontFamilies } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { authStore } from '../../store/authStore';
import { API_BASE_URL } from '../../api/client';

export function ProfileScreen() {
    const colors = useColors();
    const user = authStore((state) => state.user);
    const isAuthenticated = authStore((state) => state.isAuthenticated);
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
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
                </View>

                {/* User Info Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary.main }]}>
                        <Ionicons name="person" size={40} color="white" />
                    </View>
                    <Text style={[styles.name, { color: colors.foreground }]}>
                        {user?.firstName || 'User'} {user?.lastName || ''}
                    </Text>
                    <Text style={[styles.email, { color: colors.mutedForeground }]}>
                        {user?.email || 'user@example.com'}
                    </Text>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                        SETTINGS
                    </Text>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.foreground} />
                        <Text style={[styles.menuText, { color: colors.foreground }]}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
                        <Text style={[styles.menuText, { color: colors.foreground }]}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>

                {/* Debug Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                        DEBUG INFO
                    </Text>
                    <View style={[styles.debugCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.debugText, { color: colors.mutedForeground }]}>
                            API: {API_BASE_URL}
                        </Text>
                        <Text style={[styles.debugText, { color: colors.mutedForeground }]}>
                            User ID: {user?.id || 'Not logged in'}
                        </Text>
                        <Text style={[styles.debugText, { color: colors.mutedForeground }]}>
                            Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                        </Text>
                        <Text style={[styles.debugText, { color: colors.mutedForeground }]}>
                            Onboarded: {user?.onboardingCompleted ? 'Yes' : 'No'}
                        </Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.destructive }]}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={24} color="white" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

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
        fontWeight: '600',
    },
    card: {
        marginHorizontal: spacing[6],
        padding: spacing[6],
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[4],
    },
    name: {
        fontFamily: fontFamilies.display,
        fontSize: 24,
        fontWeight: '600',
        marginBottom: spacing[1],
    },
    email: {
        fontFamily: fontFamilies.body,
        fontSize: 14,
    },
    section: {
        marginBottom: spacing[6],
        paddingHorizontal: spacing[6],
    },
    sectionTitle: {
        fontFamily: fontFamilies.bodySemibold,
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: spacing[3],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: spacing[2],
    },
    menuText: {
        fontFamily: fontFamilies.body,
        fontSize: 16,
        flex: 1,
        marginLeft: spacing[3],
    },
    debugCard: {
        padding: spacing[4],
        borderRadius: 12,
        borderWidth: 1,
    },
    debugText: {
        fontFamily: fontFamilies.mono,
        fontSize: 11,
        marginBottom: spacing[1],
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing[6],
        padding: spacing[4],
        borderRadius: 16,
        gap: spacing[2],
    },
    logoutText: {
        fontFamily: fontFamilies.bodySemibold,
        fontSize: 16,
        color: 'white',
    },
});
