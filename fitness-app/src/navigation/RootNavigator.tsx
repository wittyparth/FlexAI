import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainDrawer } from './MainDrawer';
import { authStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const isAuthenticated = authStore((state) => state.isAuthenticated);
    const user = authStore((state) => state.user);
    const isLoading = authStore((state) => state.isLoading);

    // Hydrate auth state on app start
    useEffect(() => {
        authStore.getState().hydrate();
    }, []);

    // Show loading spinner while hydrating
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
                <ActivityIndicator size="large" color="#0052FF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : !user?.onboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingStack} />
                ) : (
                    <Stack.Screen name="Main" component={MainDrawer} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
