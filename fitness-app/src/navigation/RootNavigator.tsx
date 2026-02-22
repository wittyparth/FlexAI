import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainDrawer } from './MainDrawer';
import { useAuthStore, selectIsHydrating, selectIsReady, selectNeedsOnboarding } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
    // Atomic selectors — each triggers re-render ONLY when its boolean flips
    const isHydrating      = useAuthStore(selectIsHydrating);
    const isReady          = useAuthStore(selectIsReady);
    const needsOnboarding  = useAuthStore(selectNeedsOnboarding);

    // Kick off auth hydration once on mount
    useEffect(() => {
        useAuthStore.getState().hydrate();
    }, []);

    // Attempt crash recovery for in-progress workout session
    useEffect(() => {
        if (isReady) {
            useWorkoutStore.getState().recoverFromStorage();
        }
    }, [isReady]);

    // Block render until we know which stack to show
    if (isHydrating) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
                <ActivityIndicator size="large" color="#0052FF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
                {isReady ? (
                    <Stack.Screen name="Main" component={MainDrawer} />
                ) : needsOnboarding ? (
                    <Stack.Screen name="Onboarding" component={OnboardingStack} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
