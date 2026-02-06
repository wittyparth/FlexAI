import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Explore screens
import { ExploreHubScreen } from '../screens/explore/ExploreHubScreen';
import { ExerciseLibraryScreen } from '../screens/explore/ExerciseLibraryScreen';
import { PublicRoutinesScreen } from '../screens/explore/PublicRoutinesScreen';
import { RoutineTemplateScreen } from '../screens/explore/RoutineTemplateScreen';
import { ExerciseCreatorScreen } from '../screens/explore/ExerciseCreatorScreen';

const Stack = createStackNavigator();

export function ExploreNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
            }}
        >
            {/* Main Hub */}
            <Stack.Screen name="ExploreHub" component={ExploreHubScreen} />

            {/* Discovery */}
            <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
            <Stack.Screen name="PublicRoutines" component={PublicRoutinesScreen} />
            <Stack.Screen name="RoutineTemplate" component={RoutineTemplateScreen} />

            {/* Creation */}
            <Stack.Screen name="ExerciseCreator" component={ExerciseCreatorScreen} />
        </Stack.Navigator>
    );
}
