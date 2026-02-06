import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { BodyTrackingStackParamList } from './types';

// Body Tracking screens
import { BodyTrackingHubScreen } from '../screens/body/BodyTrackingHubScreen';
import { WeightLogScreen } from '../screens/body/WeightLogScreen';
import { MeasurementsScreen } from '../screens/body/MeasurementsScreen';
import { ProgressPhotosScreen } from '../screens/body/ProgressPhotosScreen';
// Missing screen - will be placeholder for now
// import { TakeProgressPhotoScreen } from '../screens/body/TakeProgressPhotoScreen';

const Stack = createStackNavigator<BodyTrackingStackParamList>();

export function BodyTrackingNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Body Tracking Hub - Main landing screen */}
            <Stack.Screen
                name="BodyTrackingHub"
                component={BodyTrackingHubScreen}
                options={{ headerShown: false }}
            />

            {/* Weight Tracking */}
            <Stack.Screen
                name="WeightLog"
                component={WeightLogScreen}
            />

            {/* Measurements */}
            <Stack.Screen
                name="Measurements"
                component={MeasurementsScreen}
            />

            {/* Progress Photos */}
            <Stack.Screen
                name="ProgressPhotos"
                component={ProgressPhotosScreen}
            />

            {/* TODO: Missing screen - create placeholder or implement
            <Stack.Screen 
                name="TakeProgressPhoto" 
                component={TakeProgressPhotoScreen} 
            />
            */}
        </Stack.Navigator>
    );
}
