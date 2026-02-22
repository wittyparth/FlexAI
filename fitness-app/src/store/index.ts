/**
 * Store barrel export
 *
 * Import stores from here, not from individual files.
 * This lets us co-locate related selectors with their store.
 */

// Auth + Onboarding
export { useAuthStore, authStore } from './authStore';
export type { AuthTokens } from './authStore';
export {
  selectAuthPhase,
  selectIsHydrating,
  selectIsReady,
  selectNeedsOnboarding,
  selectIsGuest,
  selectUser,
  selectUserId,
  selectAccessToken,
  selectRefreshToken,
  selectOnboardingStep,
  selectOnboardingProgress,
} from './authStore';

// Active Workout Session
export { useWorkoutStore } from './workoutStore';
export {
  selectSessionPhase,
  selectIsIdle,
  selectIsStarting,
  selectIsActive,
  selectIsCompleting,
  selectIsCompleted,
  selectHasActiveSession,
  selectActiveWorkoutId,
  selectWorkoutName,
  selectCompletedSummary,
  selectExercises,
  selectSets,
  selectSetsByExercise,
  selectCurrentExerciseId,
  selectElapsedSeconds,
  selectMinimized,
  selectRestTimer,
  selectTimerPrefs,
  selectExerciseCount,
  selectTotalSetsLogged,
} from './workoutStore';

// Routine & Template Creation
export { useCreationStore, useTemplateStore } from './creationStore';
export {
  selectRoutinePhase,
  selectRoutineDraft,
  selectIsEditingRoutine,
  selectIsSavingRoutine,
  selectTemplatePhase,
  selectTemplateDraft,
  selectIsEditingTemplate,
  selectIsSavingTemplate,
  selectRoutineExercises,
} from './creationStore';

// AI Generation
export { useAIStore } from './aiStore';
export {
  selectWorkoutGen,
  selectWorkoutGenPhase,
  selectWorkoutGenResult,
  selectWorkoutGenError,
  selectIsGeneratingWorkout,
  selectRoutineGen,
  selectRoutineGenPhase,
  selectRoutineGenResult,
  selectIsGeneratingRoutine,
  selectTemplateGen,
  selectTemplateGenPhase,
  selectTemplateGenResult,
  selectIsGeneratingTemplate,
  selectAnyGenerating,
} from './aiStore';

// Chat
export { useChatStore } from './chatStore';

// Types
export type { AuthPhase, AuthUser, OnboardingStep, OnboardingStepData } from './types/auth.types';
export type { WorkoutSessionPhase, NormalizedSet, NormalizedExercise, RestTimerState, WorkoutSummaryData } from './types/workout.types';
export type { RoutineDraft, TemplateDraft, ExerciseDraft, SetDraft } from './types/creation.types';
export type { AIWorkoutResult, AIRoutineResult, AITemplateResult } from './types/ai.types';
