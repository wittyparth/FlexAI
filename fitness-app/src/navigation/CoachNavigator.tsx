import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { CoachStackParamList } from './types';

// AI Coach screens
import { CoachHubScreen } from '../screens/coach/CoachHubScreen';
import { CoachChatScreen } from '../screens/coach/CoachChatScreen';
import { FormAnalysisScreen } from '../screens/coach/FormAnalysisScreen';
import { ChatHistoryScreen } from '../screens/coach/ChatHistoryScreen';

const Stack = createStackNavigator<CoachStackParamList>();

export function CoachNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Main Hub — conversation list + quick prompts */}
            <Stack.Screen name="CoachHub" component={CoachHubScreen} />

            {/* Individual chat thread */}
            <Stack.Screen
                name="CoachChat"
                component={CoachChatScreen}
                options={{ gestureEnabled: true }}
            />

            {/* Dedicated full history screen */}
            <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />

            {/* Form Analysis (AI-powered lift feedback) */}
            <Stack.Screen name="FormAnalysis" component={FormAnalysisScreen} />
        </Stack.Navigator>
    );
}
