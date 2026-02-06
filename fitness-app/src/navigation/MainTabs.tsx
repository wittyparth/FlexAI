import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList, HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { StreakCalendarScreen } from '../screens/home/StreakCalendarScreen';
import { LevelXpModalScreen } from '../screens/home/LevelXpModalScreen';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useColors } from '../hooks';
import { Ionicons } from '@expo/vector-icons';
import { fontFamilies } from '../theme/typography';
import { WorkoutNavigator } from './WorkoutNavigator';
import { SocialNavigator } from './SocialNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ExploreNavigator } from './ExploreNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

// Placeholder components for other tabs
function WorkoutPlaceholder() {
    const colors = useColors();
    return (
        <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
            <Ionicons name="barbell-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Workout Tab - Coming Soon
            </Text>
        </View>
    );
}
function ExplorePlaceholder() {
    const colors = useColors();
    return (
        <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
            <Ionicons name="compass-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Explore Tab - Coming Soon
            </Text>
        </View>
    );
}
function SocialPlaceholder() {
    const colors = useColors();
    return (
        <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
            <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Social Tab - Coming Soon
            </Text>
        </View>
    );
}
function ProfilePlaceholder() {
    const colors = useColors();
    return (
        <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
            <Ionicons name="person-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Profile Tab - Coming Soon
            </Text>
        </View>
    );
}

// Custom Tab Bar Icon with active indicator
function TabBarIcon({
    route,
    focused,
    color,
}: {
    route: string;
    focused: boolean;
    color: string;
}) {
    const colors = useColors();
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (route) {
        case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
        case 'WorkoutTab':
            iconName = focused ? 'barbell' : 'barbell-outline';
            break;
        case 'ExploreTab':
            iconName = focused ? 'compass' : 'compass-outline';
            break;
        case 'SocialTab':
            iconName = focused ? 'people' : 'people-outline';
            break;
        case 'ProfileTab':
            iconName = focused ? 'person' : 'person-outline';
            break;
        default:
            iconName = 'help-circle-outline';
    }

    return (
        <View style={styles.iconWrapper}>
            {/* Active indicator pill behind the icon */}
            {focused && (
                <View
                    style={[
                        styles.activeIndicator,
                        { backgroundColor: colors.primary.main + '20' },
                    ]}
                />
            )}
            <Ionicons name={iconName} size={26} color={color} />
        </View>
    );
}

// Home Stack Navigator
function HomeStackNavigator() {
    const colors = useColors();
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.foreground,
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                },
                headerShadowVisible: false,
            }}
        >
            <HomeStack.Screen
                name="HomeDashboard"
                component={HomeScreen}
                options={{ headerTitle: 'Home', headerShown: false }}
            />
            <HomeStack.Screen
                name="HomeNotifications"
                component={NotificationsScreen}
                options={{ headerTitle: 'Notifications' }}
            />
            <HomeStack.Screen
                name="FullStreakCalendar"
                component={StreakCalendarScreen}
                options={{ headerTitle: 'Streak Calendar' }}
            />
            <HomeStack.Screen
                name="XPLevelDetail"
                component={LevelXpModalScreen}
                options={{
                    headerTitle: 'Level Progress',
                    presentation: 'modal',
                }}
            />
        </HomeStack.Navigator>
    );
}

// Main Tab Navigator
export function MainTabs() {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    // Tab bar height calculation
    const bottomInset = Math.max(insets.bottom, 8);
    const tabBarHeight = 70 + bottomInset;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary.main,
                tabBarInactiveTintColor: colors.mutedForeground,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: tabBarHeight,
                    paddingTop: 10,
                    paddingBottom: bottomInset + 6,
                    // Add subtle shadow for depth
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    fontFamily: fontFamilies.body,
                    marginTop: 4,
                },
                tabBarIcon: ({ focused, color }) => (
                    <TabBarIcon route={route.name} focused={focused} color={color} />
                ),
                // Hide label when not focused for cleaner look (optional - remove if you prefer always visible)
                // tabBarShowLabel: true,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="WorkoutTab"
                component={WorkoutNavigator}
                options={{
                    tabBarLabel: 'Workout',
                }}
            />
            <Tab.Screen
                name="ExploreTab"
                component={ExploreNavigator}
                options={{
                    tabBarLabel: 'Explore',
                }}
            />
            <Tab.Screen
                name="SocialTab"
                component={SocialNavigator}
                options={{
                    tabBarLabel: 'Social',
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileNavigator}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    placeholderText: {
        fontSize: 16,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 32,
    },
    activeIndicator: {
        position: 'absolute',
        width: 50,
        height: 32,
        borderRadius: 16,
    },
});
