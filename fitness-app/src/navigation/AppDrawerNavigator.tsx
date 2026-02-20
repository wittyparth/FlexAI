/**
 * App Drawer Navigator - Sidebar Navigation
 * 
 * Features:
 * - Custom drawer content with user profile
 * - Navigation to main screens
 * - Theme toggle
 * - Logout option
 * - Light/Dark mode support
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    createDrawerNavigator,
    DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts';
import { authStore } from '../store/authStore';
import { MainTabs } from './MainTabs';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { BodyTrackingNavigator } from './BodyTrackingNavigator';
import { CoachNavigator } from './CoachNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { useColors } from '../hooks';
import { typography, spacing, borderRadius } from '../constants';

// =============================================================================
// MENU ITEMS
// =============================================================================

interface MenuItem {
    id: string;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    route?: string;
    action?: 'theme' | 'logout';
}

const MENU_ITEMS: MenuItem[] = [
    { id: 'home', label: 'Dashboard', icon: 'view-dashboard-outline', route: 'HomeTab' },
    { id: 'workouts', label: 'Workouts', icon: 'dumbbell', route: 'WorkoutTab' },
    { id: 'templates', label: 'Templates', icon: 'file-document-multiple-outline', route: 'RoutineList' },
    { id: 'exercises', label: 'Exercise Library', icon: 'weight-lifter', route: 'ExerciseLibrary' },
    { id: 'progress', label: 'Progress & Stats', icon: 'chart-line', route: 'StatsScreen' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar-month-outline', route: 'FullStreakCalendar' },
];

const BOTTOM_MENU_ITEMS: MenuItem[] = [
    { id: 'settings', label: 'Settings', icon: 'cog-outline', route: 'SettingsScreen' },
    { id: 'theme', label: 'Dark Mode', icon: 'moon-waning-crescent', action: 'theme' },
    { id: 'logout', label: 'Logout', icon: 'logout', action: 'logout' },
];

// =============================================================================
// CUSTOM DRAWER CONTENT
// =============================================================================

function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { navigation } = props;
    const insets = useSafeAreaInsets();
    const { isDark, toggleTheme } = useTheme();
    const colors = useColors();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);

    const handleMenuPress = (item: MenuItem) => {
        if (item.action === 'theme') {
            toggleTheme();
        } else if (item.action === 'logout') {
            logout();
        } else if (item.route) {
            navigation.navigate(item.route as any);
            navigation.closeDrawer();
        }
    };

    const firstName = user?.firstName || 'Athlete';
    const lastName = user?.lastName || '';
    const email = user?.email || 'athlete@fittrack.app';

    // Safe gradient colors
    const gradientColors = colors.primary.gradient 
        ? (colors.primary.gradient as unknown as [string, string, ...string[]])
        : [colors.primary.main, colors.primary.dark] as unknown as [string, string, ...string[]];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* User Profile Header */}
            <View
                style={[styles.profileHeader, { paddingTop: insets.top + 24 }]}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {firstName.charAt(0)}{lastName.charAt(0) || firstName.charAt(1) || ''}
                        </Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.primary.dark }]} />
                </View>
                <Text style={styles.userName}>{firstName} {lastName}</Text>
                <Text style={styles.userEmail}>{email}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>23</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>Level 8</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <ScrollView
                style={styles.menuContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuSection}>
                    <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                        NAVIGATION
                    </Text>
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: 'transparent' }]}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.menu.item }]}>
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={20}
                                    color={colors.primary.main}
                                />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.text.primary }]}>
                                {item.label}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={colors.text.tertiary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>
                        SETTINGS
                    </Text>
                    {BOTTOM_MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: 'transparent' }]}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.menuIconContainer,
                                {
                                    backgroundColor: item.action === 'logout'
                                        ? colors.error + '20'
                                        : colors.menu.item
                                }
                            ]}>
                                <MaterialCommunityIcons
                                    name={item.action === 'theme' && isDark
                                        ? 'white-balance-sunny'
                                        : item.icon
                                    }
                                    size={20}
                                    color={item.action === 'logout' ? colors.error : colors.primary.main}
                                />
                            </View>
                            <Text style={[
                                styles.menuLabel,
                                { color: item.action === 'logout' ? colors.error : colors.text.primary }
                            ]}>
                                {item.action === 'theme'
                                    ? (isDark ? 'Light Mode' : 'Dark Mode')
                                    : item.label
                                }
                            </Text>
                            {item.action === 'theme' ? (
                                <View style={[
                                    styles.toggleContainer,
                                    { backgroundColor: isDark ? colors.primary.main : colors.border }
                                ]}>
                                    <View style={[
                                        styles.toggleDot,
                                        {
                                            backgroundColor: colors.primaryForeground,
                                            transform: [{ translateX: isDark ? 16 : 0 }]
                                        }
                                    ]} />
                                </View>
                            ) : (
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color={colors.text.tertiary}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* App Version */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <Text style={[styles.versionText, { color: colors.text.tertiary }]}>
                    FitTrack v1.0.0
                </Text>
            </View>
        </View>
    );
}

// =============================================================================
// DRAWER NAVIGATOR
// =============================================================================

const Drawer = createDrawerNavigator();

export function AppDrawerNavigator() {
    const colors = useColors();

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                    width: 320,
                    backgroundColor: colors.background,
                },
                overlayColor: 'rgba(0, 0, 0, 0.6)',
            }}
        >
            {/* Primary: all tabs */}
            <Drawer.Screen name="MainApp" component={MainTabs} />
            {/* Secondary navigators — accessible from drawer menus and cross-tab navigation */}
            <Drawer.Screen name="Analytics" component={AnalyticsNavigator} options={{ headerShown: false }} />
            <Drawer.Screen name="BodyTracking" component={BodyTrackingNavigator} options={{ headerShown: false }} />
            <Drawer.Screen name="Coach" component={CoachNavigator} options={{ headerShown: false }} />
            <Drawer.Screen name="SettingsNavigator" component={SettingsNavigator} options={{ headerShown: false }} />
        </Drawer.Navigator>
    );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Profile Header
    profileHeader: {
        paddingHorizontal: spacing[6], // 24px
        paddingBottom: spacing[6],
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing[4], // 16px
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        ...typography.h3,
        color: '#fff',
    },
    statusDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
    },
    userName: {
        ...typography.h2,
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        ...typography.bodyRegular,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: spacing[5], // 20px
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: borderRadius.md,
        padding: spacing[3], // 12px
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...typography.h4,
        color: '#fff',
    },
    statLabel: {
        ...typography.caption,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: spacing[3],
    },

    // Menu
    menuContainer: {
        flex: 1,
        paddingHorizontal: spacing[4], // 16px
        paddingTop: spacing[5], // 20px
    },
    menuSection: {
        marginBottom: spacing[6], // 24px
    },
    sectionLabel: {
        ...typography.label,
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: spacing[3], // 12px
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[3], // 12px
        borderRadius: borderRadius.md,
        marginBottom: spacing[2], // 8px
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[3],
    },
    menuLabel: {
        flex: 1,
        ...typography.bodyLarge,
        fontWeight: '500',
    },

    // Toggle
    toggleContainer: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },

    // Footer
    footer: {
        padding: spacing[4],
        alignItems: 'center',
        borderTopWidth: 1,
    },
    versionText: {
        ...typography.caption,
    },
});
