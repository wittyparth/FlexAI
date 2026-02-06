/**
 * FitTrack - Main App Entry
 * 
 * Features:
 * - Theme Provider (dark/light mode)
 * - Font loading
 * - Auth state management with Zustand
 * - Navigation based on auth state
 * - Drawer navigation with sidebar
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/react-query';
import { useFonts, Calistoga_400Regular } from '@expo-google-fonts/calistoga';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

// Context
import { ThemeProvider, useTheme } from './src/contexts';

// Store
import { authStore } from './src/store/authStore';

// Auth Screens
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  VerifyEmailScreen,
  ForgotPasswordScreen,
  ResetVerifyScreen,
  ResetPasswordScreen,
  AccountLockedScreen
} from './src/screens/auth';

// Onboarding Screens
import {
  GoalSelectionScreen,
  ExperienceLevelScreen,
  PhysicalProfileScreen,
  SecondaryGoalsScreen,
  WorkoutInterestsScreen,
  WorkoutFrequencyScreen,
  WorkoutDurationScreen,
  EquipmentScreen,
  UnitsScreen,
  NotificationScreen,
  AppTourScreen,
  FinalSuccessScreen,
} from './src/screens/onboarding';

// Main Navigation with Drawer
import { AppDrawerNavigator } from './src/navigation/AppDrawerNavigator';

// ============================================================================
// DEV MODE: Auth Bypass Flag
// Set to true to skip authentication and go directly to dashboard
// Set to false when ready to integrate backend authentication
// ============================================================================
const DEV_BYPASS_AUTH = true;

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  ForgotPassword: undefined;
  ResetVerify: { email: string };
  ResetPassword: { email: string; otp: string };
  AccountLocked: { waitTime?: number } | undefined;
};

export type OnboardingStackParamList = {
  GoalSelection: undefined;
  ExperienceLevel: undefined;
  PhysicalProfile: undefined;
  SecondaryGoals: undefined;
  WorkoutInterests: undefined;
  WorkoutFrequency: undefined;
  WorkoutDuration: undefined;
  Equipment: undefined;
  Units: undefined;
  Notification: undefined;
  AppTour: undefined;
  FinalSuccess: undefined;
};

// MainTabs handles its own params

type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const OnboardingStack = createStackNavigator<OnboardingStackParamList>();
// const MainStack = createStackNavigator(); // Removed in favor of MainTabs
const RootStack = createStackNavigator<RootStackParamList>();

// Auth Stack - for unauthenticated users
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetVerify" component={ResetVerifyScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="AccountLocked" component={AccountLockedScreen} />
    </AuthStack.Navigator>
  );
}

// Onboarding Stack - for newly registered users
function OnboardingStackScreen() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <OnboardingStack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <OnboardingStack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <OnboardingStack.Screen name="PhysicalProfile" component={PhysicalProfileScreen} />
      <OnboardingStack.Screen name="SecondaryGoals" component={SecondaryGoalsScreen} />
      <OnboardingStack.Screen name="WorkoutInterests" component={WorkoutInterestsScreen} />
      <OnboardingStack.Screen name="WorkoutFrequency" component={WorkoutFrequencyScreen} />
      <OnboardingStack.Screen name="WorkoutDuration" component={WorkoutDurationScreen} />
      <OnboardingStack.Screen name="Equipment" component={EquipmentScreen} />
      <OnboardingStack.Screen name="Units" component={UnitsScreen} />
      <OnboardingStack.Screen name="Notification" component={NotificationScreen} />
      <OnboardingStack.Screen name="AppTour" component={AppTourScreen} />
      <OnboardingStack.Screen name="FinalSuccess" component={FinalSuccessScreen} />
    </OnboardingStack.Navigator>
  );
}

// MainStackScreen removed, using MainTabs directly

// Root Navigator - switches based on auth state
function RootNavigator() {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const user = authStore((state) => state.user);
  const isLoading = authStore((state) => state.isLoading);
  const { isDark } = useTheme();

  // Hydrate auth state on mount (only when not bypassing auth)
  useEffect(() => {
    if (!DEV_BYPASS_AUTH) {
      console.log('🚀 [ROOT NAV] Mounting, hydrating auth state...');
      authStore.getState().hydrate();
    } else {
      console.log('🔧 [DEV MODE] Auth bypass enabled - skipping hydration');
    }
  }, []);

  // Log auth state changes
  useEffect(() => {
    if (!DEV_BYPASS_AUTH) {
      console.log('🔄 [ROOT NAV] Auth state changed:', {
        isAuthenticated,
        isLoading,
        hasUser: !!user,
        isOnboarded: user?.onboardingCompleted,
      });
    }
  }, [isAuthenticated, isLoading, user]);

  // DEV MODE: Bypass auth and go directly to dashboard
  if (DEV_BYPASS_AUTH) {
    console.log('🔧 [DEV MODE] Bypassing auth - going directly to dashboard');
    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Main" component={AppDrawerNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }

  // Show loading while checking auth state - MUST wait for hydration
  if (isLoading) {
    console.log('⏳ [ROOT NAV] Still loading, showing spinner');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#0F172A' : '#FAFAFA' }]}>
        <ActivityIndicator size="large" color="#0052FF" />
      </View>
    );
  }

  console.log('🎯 [ROOT NAV] Rendering navigation, auth state:', { isAuthenticated, hasUser: !!user, isOnboarded: user?.onboardingCompleted });

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        ) : !user?.onboardingCompleted ? (
          <RootStack.Screen name="Onboarding" component={OnboardingStackScreen} />
        ) : (
          <RootStack.Screen name="Main" component={AppDrawerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// Main App Content (uses theme)
function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

// Root App Component
export default function App() {
  const [fontsLoaded] = useFonts({
    Calistoga: Calistoga_400Regular,
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0052FF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
