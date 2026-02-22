/**
 * useFlowGuard — Navigation layer for FSM-backed flows
 *
 * Prevents users from entering screens they shouldn't be on.
 * Uses the store's phase as the single source of truth.
 *
 * Usage:
 *   useFlowGuard('workout') → redirects away if no active workout
 *   useFlowGuard('onboarding') → redirects away if already onboarded
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore, selectIsReady, selectNeedsOnboarding } from '../store/authStore';
import { useWorkoutStore, selectIsActive } from '../store/workoutStore';

type GuardType = 'auth' | 'onboarding' | 'workout_active' | 'workout_completed';

/**
 * Guards a screen based on current FSM phase.
 * Navigates away if the guard condition is not met.
 */
export function useFlowGuard(guard: GuardType) {
  const navigation = useNavigation<any>();

  const isReady         = useAuthStore(selectIsReady);
  const needsOnboarding = useAuthStore(selectNeedsOnboarding);
  const hasActiveWorkout    = useWorkoutStore(selectIsActive);
  const hasCompletedWorkout = useWorkoutStore((s) => s.sessionPhase.phase === 'completed');

  useEffect(() => {
    switch (guard) {
      case 'auth':
        // This screen requires authentication
        if (!isReady && !needsOnboarding) {
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
        break;

      case 'onboarding':
        // This screen requires onboarding phase
        if (!needsOnboarding) {
          if (isReady) {
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
          } else {
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          }
        }
        break;

      case 'workout_active':
        // This screen requires an active workout session
        if (!hasActiveWorkout) {
          navigation.goBack();
        }
        break;

      case 'workout_completed':
        // This screen requires a completed workout summary in store
        if (!hasCompletedWorkout) {
          navigation.navigate('WorkoutHub');
        }
        break;
    }
  }, [guard, isReady, needsOnboarding, hasActiveWorkout, hasCompletedWorkout, navigation]);
}
