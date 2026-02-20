import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from './types';
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
} from '../screens/onboarding';

const Stack = createStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
            <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
            <Stack.Screen name="PhysicalProfile" component={PhysicalProfileScreen} />
            <Stack.Screen name="SecondaryGoals" component={SecondaryGoalsScreen} />
            <Stack.Screen name="WorkoutInterests" component={WorkoutInterestsScreen} />
            <Stack.Screen name="WorkoutFrequency" component={WorkoutFrequencyScreen} />
            <Stack.Screen name="WorkoutDuration" component={WorkoutDurationScreen} />
            <Stack.Screen name="Equipment" component={EquipmentScreen} />
            <Stack.Screen name="Units" component={UnitsScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="AppTour" component={AppTourScreen} />
            <Stack.Screen name="FinalSuccess" component={FinalSuccessScreen} />
        </Stack.Navigator>
    );
}
