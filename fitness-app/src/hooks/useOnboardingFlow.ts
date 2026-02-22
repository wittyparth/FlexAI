/**
 * useOnboardingFlow — Typed hook for onboarding screens
 *
 * Each onboarding screen calls `saveStep()` to stage its data,
 * then `advance()` to move to the next step.
 * On the final step, call `complete()` to persist everything and
 * transition the auth phase to 'ready'.
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  useAuthStore,
  selectAuthPhase,
  selectOnboardingStep,
  selectOnboardingProgress,
  selectUser,
} from '../store/authStore';
import { OnboardingStep, OnboardingStepData, ONBOARDING_STEPS } from '../store/types/auth.types';

export function useOnboardingFlow() {
  const navigation   = useNavigation<any>();
  const authPhase    = useAuthStore(selectAuthPhase);
  const currentStep  = useAuthStore(selectOnboardingStep);
  const progress     = useAuthStore(selectOnboardingProgress);
  const user         = useAuthStore(selectUser);

  const { saveOnboardingStep, advanceOnboarding, completeOnboarding } = useAuthStore.getState();

  /**
   * Save data for the current step then advance to next.
   * If no next step exists, calls completeOnboarding().
   */
  const goNext = useCallback(
    async <K extends keyof OnboardingStepData>(
      step: OnboardingStep,
      data: NonNullable<OnboardingStepData[K]>,
    ) => {
      saveOnboardingStep(step, data);

      const currentIdx = ONBOARDING_STEPS.indexOf(step);
      const hasNext    = currentIdx < ONBOARDING_STEPS.length - 1;

      if (hasNext) {
        const nextStep = ONBOARDING_STEPS[currentIdx + 1];
        advanceOnboarding(nextStep);
        navigation.navigate(nextStep);
      } else {
        // Final step — commit everything
        await completeOnboarding();
        // RootNavigator will detect phase='ready' and render MainDrawer
      }
    },
    [saveOnboardingStep, advanceOnboarding, completeOnboarding, navigation],
  );

  /** Skip current step without saving data */
  const skip = useCallback(
    (step: OnboardingStep) => {
      const currentIdx = ONBOARDING_STEPS.indexOf(step);
      const hasNext    = currentIdx < ONBOARDING_STEPS.length - 1;

      if (hasNext) {
        const nextStep = ONBOARDING_STEPS[currentIdx + 1];
        advanceOnboarding(nextStep);
        navigation.navigate(nextStep);
      } else {
        completeOnboarding();
      }
    },
    [advanceOnboarding, completeOnboarding, navigation],
  );

  /** Go back one step */
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    currentStep,
    progress,
    user,
    authPhase,
    goNext,
    skip,
    goBack,
    isLastStep: currentStep === ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1],
  };
}
