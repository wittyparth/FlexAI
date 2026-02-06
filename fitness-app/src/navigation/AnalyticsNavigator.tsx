import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { AnalyticsStackParamList } from './types';

// Analytics screens
import { AnalyticsHubScreen } from '../screens/analytics/AnalyticsHubScreen';
import { PersonalRecordsScreen } from '../screens/analytics/PersonalRecordsScreen';
import { StrengthProgressionScreen } from '../screens/analytics/StrengthProgressionScreen';
import { VolumeAnalyticsScreen } from '../screens/analytics/VolumeAnalyticsScreen';
import { MuscleDistributionScreen } from '../screens/analytics/MuscleDistributionScreen';
import { MuscleHeatmapScreen } from '../screens/analytics/MuscleHeatmapScreen';
// Missing screens - will be placeholders for now
// import { WorkoutFrequencyScreen } from '../screens/analytics/WorkoutFrequencyScreen';
// import { RecoveryStatusScreen } from '../screens/analytics/RecoveryStatusScreen';

const Stack = createStackNavigator<AnalyticsStackParamList>();

export function AnalyticsNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Analytics Hub - Main landing screen */}
            <Stack.Screen
                name="AnalyticsHub"
                component={AnalyticsHubScreen}
                options={{ headerShown: false }}
            />

            {/* Performance Analytics */}
            <Stack.Screen
                name="PersonalRecords"
                component={PersonalRecordsScreen}
            />
            <Stack.Screen
                name="StrengthProgression"
                component={StrengthProgressionScreen}
            />

            {/* Volume Analytics */}
            <Stack.Screen
                name="VolumeAnalytics"
                component={VolumeAnalyticsScreen}
            />

            {/* Muscle Analytics */}
            <Stack.Screen
                name="MuscleDistribution"
                component={MuscleDistributionScreen}
            />
            <Stack.Screen
                name="MuscleHeatmap"
                component={MuscleHeatmapScreen}
            />

            {/* TODO: Missing screens - create placeholders or implement
            <Stack.Screen 
                name="WorkoutFrequency" 
                component={WorkoutFrequencyScreen} 
            />
            <Stack.Screen 
                name="RecoveryStatus" 
                component={RecoveryStatusScreen} 
            />
            */}
        </Stack.Navigator>
    );
}
