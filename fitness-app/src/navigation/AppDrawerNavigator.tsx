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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts';
import { authStore } from '../store/authStore';
import { MainTabs } from './MainTabs';
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* User Profile Header */}
            <LinearGradient
                colors={colors.primary.gradient || [colors.primary[500], colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.profileHeader, { paddingTop: insets.top + 24 }]}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {firstName.charAt(0)}{lastName.charAt(0) || firstName.charAt(1) || ''}
                        </Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.primary[600] }]} />
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
            </LinearGradient>

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
                                    color={colors.primary[500]}
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
                                    color={item.action === 'logout' ? colors.error : colors.primary[500]}
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
                                    { backgroundColor: isDark ? colors.primary[500] : colors.border.default }
                                ]}>
                                    <View style={[
                                        styles.toggleDot,
                                        {
                                            backgroundColor: '#fff',
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
            <View style={[styles.footer, { borderTopColor: colors.border.light }]}>
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
                    backgroundColor: colors.background.primary,
                },
                overlayColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Drawer.Screen name="MainApp" component={MainTabs} />
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

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts';
import { authStore } from '../store/authStore';
import { MainTabs } from './MainTabs';

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const COLORS = {
    light: {
        primary: '#0d59f2',
        accent: '#00f2fe',
        background: '#f8f9fc',
        card: '#ffffff',
        textMain: '#0d121c',
        textMuted: '#64748b',
        border: '#e2e8f0',
        menuItem: '#f1f5f9',
        menuItemActive: '#eff6ff',
    },
    dark: {
        primary: '#3b82f6',
        accent: '#00f2fe',
        background: '#101622',
        card: '#1a2332',
        textMain: '#f1f5f9',
        textMuted: '#94a3b8',
        border: '#2d3748',
        menuItem: '#1e293b',
        menuItemActive: '#1e3a5f',
    },
};

const FONTS = {
    calistoga: 'Calistoga',
    inter: 'Inter',
    interMedium: 'Inter-Medium',
    interSemiBold: 'Inter-SemiBold',
    interBold: 'Inter-Bold',
};

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
    const colors = isDark ? COLORS.dark : COLORS.light;
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* User Profile Header */}
            <LinearGradient
                colors={[colors.primary, '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.profileHeader, { paddingTop: insets.top + 24 }]}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {firstName.charAt(0)}{lastName.charAt(0) || firstName.charAt(1) || ''}
                        </Text>
                    </View>
                    <View style={styles.statusDot} />
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
            </LinearGradient>

            {/* Menu Items */}
            <ScrollView
                style={styles.menuContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuSection}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                        NAVIGATION
                    </Text>
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colors.card }]}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.menuItem }]}>
                                <MaterialCommunityIcons
                                    name={item.icon}
                                    size={22}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.textMain }]}>
                                {item.label}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color={colors.textMuted}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuSection}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                        SETTINGS
                    </Text>
                    {BOTTOM_MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colors.card }]}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.menuIconContainer,
                                {
                                    backgroundColor: item.action === 'logout'
                                        ? '#fee2e2'
                                        : colors.menuItem
                                }
                            ]}>
                                <MaterialCommunityIcons
                                    name={item.action === 'theme' && isDark
                                        ? 'white-balance-sunny'
                                        : item.icon
                                    }
                                    size={22}
                                    color={item.action === 'logout' ? '#ef4444' : colors.primary}
                                />
                            </View>
                            <Text style={[
                                styles.menuLabel,
                                { color: item.action === 'logout' ? '#ef4444' : colors.textMain }
                            ]}>
                                {item.action === 'theme'
                                    ? (isDark ? 'Light Mode' : 'Dark Mode')
                                    : item.label
                                }
                            </Text>
                            {item.action === 'theme' ? (
                                <View style={[
                                    styles.toggleContainer,
                                    { backgroundColor: isDark ? colors.primary : colors.border }
                                ]}>
                                    <View style={[
                                        styles.toggleDot,
                                        {
                                            backgroundColor: '#fff',
                                            transform: [{ translateX: isDark ? 16 : 0 }]
                                        }
                                    ]} />
                                </View>
                            ) : (
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color={colors.textMuted}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* App Version */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <Text style={[styles.versionText, { color: colors.textMuted }]}>
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
    const { isDark } = useTheme();
    const colors = isDark ? COLORS.dark : COLORS.light;

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
                overlayColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            <Drawer.Screen name="MainApp" component={MainTabs} />
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
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
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
        fontFamily: FONTS.interBold,
        fontSize: 28,
        color: '#fff',
    },
    statusDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22c55e',
        borderWidth: 3,
        borderColor: '#0d59f2',
    },
    userName: {
        fontFamily: FONTS.calistoga,
        fontSize: 24,
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontFamily: FONTS.inter,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: FONTS.interBold,
        fontSize: 16,
        color: '#fff',
    },
    statLabel: {
        fontFamily: FONTS.inter,
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 12,
    },

    // Menu
    menuContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: FONTS.interSemiBold,
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontFamily: FONTS.interMedium,
        fontSize: 15,
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
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    versionText: {
        fontFamily: FONTS.inter,
        fontSize: 12,
    },
});
