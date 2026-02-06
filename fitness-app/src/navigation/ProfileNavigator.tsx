import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Profile screens
import { ProfileHubScreen } from '../screens/profile/ProfileHubScreen';
import { StatsHubScreen } from '../screens/profile/StatsHubScreen';
import { StrengthProgressionScreen } from '../screens/profile/StrengthProgressionScreen';
import { VolumeAnalyticsScreen } from '../screens/profile/VolumeAnalyticsScreen';
import { MuscleDistributionScreen } from '../screens/profile/MuscleDistributionScreen';
import { PersonalRecordsScreen } from '../screens/profile/PersonalRecordsScreen';
import { MuscleHeatmapScreen } from '../screens/profile/MuscleHeatmapScreen';

// AI Coach screens
import { CoachHubScreen } from '../screens/profile/CoachHubScreen';
import { CoachChatScreen } from '../screens/profile/CoachChatScreen';
import { FormAnalysisScreen } from '../screens/profile/FormAnalysisScreen';

// Body Tracking screens
import { BodyTrackingHubScreen } from '../screens/profile/BodyTrackingHubScreen';
import { WeightLogScreen } from '../screens/profile/WeightLogScreen';
import { MeasurementsScreen } from '../screens/profile/MeasurementsScreen';
import { ProgressPhotosScreen } from '../screens/profile/ProgressPhotosScreen';

// Settings screens
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AccountSecurityScreen } from '../screens/profile/AccountSecurityScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { PrivacySettingsScreen } from '../screens/profile/PrivacySettingsScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { UnitsPreferencesScreen } from '../screens/profile/UnitsPreferencesScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';

const Stack = createStackNavigator();

export function ProfileNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Main Hub */}
            <Stack.Screen name="ProfileHub" component={ProfileHubScreen} />

            {/* Stats & Analytics */}
            <Stack.Screen name="StatsHub" component={StatsHubScreen} />
            <Stack.Screen name="StrengthProgression" component={StrengthProgressionScreen} />
            <Stack.Screen name="VolumeAnalytics" component={VolumeAnalyticsScreen} />
            <Stack.Screen name="MuscleDistribution" component={MuscleDistributionScreen} />
            <Stack.Screen name="PersonalRecords" component={PersonalRecordsScreen} />
            <Stack.Screen name="MuscleHeatmap" component={MuscleHeatmapScreen} />

            {/* AI Coach */}
            <Stack.Screen name="CoachHub" component={CoachHubScreen} />
            <Stack.Screen name="CoachChat" component={CoachChatScreen} />
            <Stack.Screen name="FormAnalysis" component={FormAnalysisScreen} />

            {/* Body Tracking */}
            <Stack.Screen name="BodyTrackingHub" component={BodyTrackingHubScreen} />
            <Stack.Screen name="WeightLog" component={WeightLogScreen} />
            <Stack.Screen name="Measurements" component={MeasurementsScreen} />
            <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} />

            {/* Settings */}
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

