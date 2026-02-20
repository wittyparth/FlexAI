import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import {
    WelcomeScreen,
    LoginScreen,
    RegisterScreen,
    VerifyEmailScreen,
    ForgotPasswordScreen,
    ResetVerifyScreen,
    ResetPasswordScreen,
    AccountLockedScreen,
} from '../screens/auth';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FAFAFA' },
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetVerify" component={ResetVerifyScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="AccountLocked" component={AccountLockedScreen} />
        </Stack.Navigator>
    );
}
