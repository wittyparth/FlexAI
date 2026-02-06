import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { ProfileStackParamList } from './types'; // We might want to separate this later, but for now sharing params or creating new one

// Settings screens
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AccountSecurityScreen } from '../screens/settings/AccountSecurityScreen';
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen';
import { PrivacySettingsScreen } from '../screens/settings/PrivacySettingsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { UnitsPreferencesScreen } from '../screens/settings/UnitsPreferencesScreen';
import { HelpSupportScreen } from '../screens/settings/HelpSupportScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';

const Stack = createStackNavigator<ProfileStackParamList>(); // Reuse ProfileParamList for now or create SettingsParamList

export function SettingsNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="UnitsPreferences" component={UnitsPreferencesScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}
