import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutStackParamList } from './types';

// ============================================================
// Phase 2A: Workout Hub Screens
// ============================================================
import { WorkoutHubScreen } from '../screens/workout/WorkoutHubScreen';
import { RoutineListScreen } from '../screens/workout/RoutineListScreen';
import { RoutineDetailScreen } from '../screens/workout/RoutineDetailScreen';
import { RoutineEditorScreen } from '../screens/workout/RoutineEditorScreen';
import { ExercisePickerScreen } from '../screens/workout/ExercisePickerScreen';
import { ExerciseDetailScreen } from '../screens/workout/ExerciseDetailScreen';
import { ExerciseFilterScreen } from '../screens/workout/ExerciseFilterScreen';
import { CustomExerciseScreen } from '../screens/workout/CustomExerciseScreen';

// ============================================================
// Phase 2B: Active Workout Screens
// ============================================================
import { ActiveWorkoutScreen } from '../screens/workout/ActiveWorkoutScreen';
import { ExerciseSwapScreen } from '../screens/workout/ExerciseSwapScreen';
import { SetConfigScreen } from '../screens/workout/SetConfigScreen';
import { WorkoutSummaryScreen } from '../screens/workout/WorkoutSummaryScreen';

// ============================================================
// Phase 2C: History & AI Screens
// ============================================================
import { WorkoutHistoryScreen } from '../screens/workout/WorkoutHistoryScreen';
import { WorkoutDetailScreen } from '../screens/workout/WorkoutDetailScreen';
import { SessionInsightsScreen } from '../screens/workout/SessionInsightsScreen';
import { AIGeneratorScreen } from '../screens/workout/AIGeneratorScreen';
import { AIPreviewScreen } from '../screens/workout/AIPreviewScreen';
import { AIPromptsScreen } from '../screens/workout/AIPromptsScreen';

const Stack = createStackNavigator<WorkoutStackParamList>();

export function WorkoutNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
                gestureEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                    cardStyle: {
                        opacity: current.progress,
                    },
                }),
            }}
        >
            {/* Phase 2A: Workout Hub */}
            <Stack.Screen name="WorkoutHub" component={WorkoutHubScreen} />
            <Stack.Screen name="RoutineList" component={RoutineListScreen} />
            <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
            <Stack.Screen name="RoutineEditor" component={RoutineEditorScreen} />
            <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen as any} />
            <Stack.Screen name="ExerciseFilter" component={ExerciseFilterScreen} />
            <Stack.Screen name="CustomExercise" component={CustomExerciseScreen} />

            {/* Phase 2B: Active Workout */}
            <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
            <Stack.Screen
                name="ExerciseSwap"
                component={ExerciseSwapScreen}
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen
                name="SetConfig"
                component={SetConfigScreen}
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />

            {/* Phase 2C: History & AI */}
            <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
            <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
            <Stack.Screen name="SessionInsights" component={SessionInsightsScreen} />
            <Stack.Screen name="AIGenerator" component={AIGeneratorScreen} />
            <Stack.Screen name="AIPreview" component={AIPreviewScreen} />
            <Stack.Screen
                name="AIPrompts"
                component={AIPromptsScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}
