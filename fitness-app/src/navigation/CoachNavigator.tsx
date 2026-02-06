import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { CoachStackParamList } from './types';

// AI Coach screens
import { CoachHubScreen } from '../screens/coach/CoachHubScreen';
import { CoachChatScreen } from '../screens/coach/CoachChatScreen';
import { FormAnalysisScreen } from '../screens/coach/FormAnalysisScreen';
// Missing screen - will be placeholder for now
// import { CoachPromptsScreen } from '../screens/coach/CoachPromptsScreen';

const Stack = createStackNavigator<CoachStackParamList>();

export function CoachNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Coach Hub - Main landing screen */}
            <Stack.Screen
                name="CoachHub"
                component={CoachHubScreen}
                options={{ headerShown: false }}
            />

            {/* Coach Chat */}
            <Stack.Screen
                name="CoachChat"
                component={CoachChatScreen}
            />

            {/* Form Analysis */}
            <Stack.Screen
                name="FormAnalysis"
                component={FormAnalysisScreen}
            />

            {/* TODO: Missing screen - create placeholder or implement
            <Stack.Screen 
                name="CoachPrompts" 
                component={CoachPromptsScreen} 
            />
            */}
        </Stack.Navigator>
    );
}
