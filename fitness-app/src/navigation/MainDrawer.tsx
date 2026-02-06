import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import { MainTabs } from './MainTabs';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { CoachNavigator } from './CoachNavigator';
import { BodyTrackingNavigator } from './BodyTrackingNavigator';
import { SettingsNavigator } from './SettingsNavigator';
import { MainDrawerParamList } from './types';
import { useColors } from '../hooks';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export function MainDrawer() {
    const dimensions = useWindowDimensions();
    const colors = useColors();

    const isLargeScreen = dimensions.width >= 768;

    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerPosition: 'right',
                drawerType: isLargeScreen ? 'permanent' : 'front',
                drawerStyle: {
                    backgroundColor: colors.card,
                    width: isLargeScreen ? 320 : '80%',
                },
                drawerActiveTintColor: colors.primary.main,
                drawerInactiveTintColor: colors.mutedForeground,
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={MainTabs}
                options={{
                    title: 'Home',
                    drawerItemStyle: { display: 'none' } // Hide MainTabs from drawer menu, as it's the main view
                }}
            />

            <Drawer.Screen
                name="Analytics"
                component={AnalyticsNavigator}
                options={{
                    title: 'Analytics',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart-outline" size={size} color={color} />
                    )
                }}
            />

            <Drawer.Screen
                name="Coach"
                component={CoachNavigator}
                options={{
                    title: 'AI Coach',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="school-outline" size={size} color={color} />
                    )
                }}
            />

            <Drawer.Screen
                name="BodyTracking"
                component={BodyTrackingNavigator}
                options={{
                    title: 'Body Tracking',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="body-outline" size={size} color={color} />
                    )
                }}
            />

            <Drawer.Screen
                name="SettingsNavigator"
                component={SettingsNavigator}
                options={{
                    title: 'Settings',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}
