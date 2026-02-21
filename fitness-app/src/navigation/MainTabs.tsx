import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList, HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { StreakCalendarScreen } from '../screens/home/StreakCalendarScreen';
import { LevelXpModalScreen } from '../screens/home/LevelXpModalScreen';
import { View, StyleSheet, Platform } from 'react-native';
import { useColors } from '../hooks';
import { Ionicons } from '@expo/vector-icons';
import { fontFamilies } from '../theme/typography';
import { WorkoutNavigator } from './WorkoutNavigator';
import { SocialNavigator } from './SocialNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ExploreNavigator } from './ExploreNavigator';
import { FloatingWorkoutPill } from '../components/active-workout/FloatingWorkoutPill';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();

// Premium Tab Bar Icon with animated active indicator
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
            {/* Premium gradient active indicator pill */}
            {focused && (
                <View
                    style={[
                        styles.activeIndicator,
                        { backgroundColor: colors.primary.main + '18' },
                    ]}
                />
            )}
            <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
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
                    fontFamily: fontFamilies.display,
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

// Main Tab Navigator — Premium Design
export function MainTabs() {
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const bottomInset = Math.max(insets.bottom, 8);
    const tabBarHeight = 72 + bottomInset;
    const baseTabBarStyle = {
        position: 'absolute' as const,
        backgroundColor: colors.tabBarBackground + 'F2',
        borderTopColor: colors.tabBarBorder,
        borderTopWidth: StyleSheet.hairlineWidth,
        height: tabBarHeight,
        paddingTop: 8,
        paddingBottom: bottomInset + 4,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary.main,
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    };

    const shouldShowTabBar = (route: any, rootRouteName: string) => {
        const nestedRoute = getFocusedRouteNameFromRoute(route) ?? rootRouteName;
        return nestedRoute === rootRouteName;
    };

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: colors.primary.main,
                    tabBarInactiveTintColor: colors.mutedForeground,
                    tabBarStyle: baseTabBarStyle,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        fontFamily: fontFamilies.body,
                        marginTop: 2,
                        letterSpacing: 0.3,
                    },
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon route={route.name} focused={focused} color={color} />
                    ),
                })}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeStackNavigator}
                    options={({ route }) => ({
                        tabBarLabel: 'Home',
                        tabBarStyle: shouldShowTabBar(route, 'HomeDashboard')
                            ? baseTabBarStyle
                            : { display: 'none' },
                    })}
                />
                <Tab.Screen
                    name="WorkoutTab"
                    component={WorkoutNavigator}
                    options={({ route }) => ({
                        tabBarLabel: 'Workout',
                        tabBarStyle: shouldShowTabBar(route, 'WorkoutHub')
                            ? baseTabBarStyle
                            : { display: 'none' },
                    })}
                />
                <Tab.Screen
                    name="ExploreTab"
                    component={ExploreNavigator}
                    options={({ route }) => ({
                        tabBarLabel: 'Explore',
                        tabBarStyle: shouldShowTabBar(route, 'ExploreHub')
                            ? baseTabBarStyle
                            : { display: 'none' },
                    })}
                />
                <Tab.Screen
                    name="SocialTab"
                    component={SocialNavigator}
                    options={({ route }) => ({
                        tabBarLabel: 'Social',
                        tabBarStyle: shouldShowTabBar(route, 'SocialHome')
                            ? baseTabBarStyle
                            : { display: 'none' },
                    })}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileNavigator}
                    options={({ route }) => ({
                        tabBarLabel: 'Profile',
                        tabBarStyle: shouldShowTabBar(route, 'ProfileHub')
                            ? baseTabBarStyle
                            : { display: 'none' },
                    })}
                />
            </Tab.Navigator>

            {/* Floating workout indicator — shows when workout active & user navigated away */}
            <FloatingWorkoutPill />
        </View>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 32,
    },
    activeIndicator: {
        position: 'absolute',
        width: 56,
        height: 32,
        borderRadius: 16,
    },
});
