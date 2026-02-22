/**
 * Auth & Onboarding FSM Types
 * 
 * Uses discriminated unions to make impossible states impossible.
 * You CANNOT have isAuthenticated=true while user=null.
 */

export type OnboardingStep =
  | 'GoalSelection'
  | 'ExperienceLevel'
  | 'PhysicalProfile'
  | 'SecondaryGoals'
  | 'WorkoutInterests'
  | 'WorkoutFrequency'
  | 'WorkoutDuration'
  | 'Equipment'
  | 'Units'
  | 'Notification'
  | 'AppTour'
  | 'FinalSuccess';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'GoalSelection',
  'ExperienceLevel',
  'PhysicalProfile',
  'SecondaryGoals',
  'WorkoutInterests',
  'WorkoutFrequency',
  'WorkoutDuration',
  'Equipment',
  'Units',
  'Notification',
  'AppTour',
  'FinalSuccess',
];

// ─── Auth Phase Machine ───────────────────────────────────────────────────────

/**
 * Discriminated union: each phase has only valid fields.
 * 
 *  hydrating  → loading stored credentials
 *  guest      → not logged in
 *  logging_in → network request in flight
 *  onboarding → logged in, but onboarding incomplete
 *  ready      → fully authenticated & onboarded
 *  locked     → account locked, shows countdown
 */
export type AuthPhase =
  | { phase: 'hydrating' }
  | { phase: 'guest' }
  | { phase: 'logging_in'; email: string }
  | { phase: 'registering'; email: string }
  | { phase: 'verifying_email'; email: string }
  | { phase: 'onboarding'; userId: number; currentStep: OnboardingStep; completedSteps: OnboardingStep[] }
  | { phase: 'ready'; userId: number }
  | { phase: 'locked'; email: string; unlockAtMs: number };

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  // Onboarding data staged progressively
  goals?: string[];
  experienceLevel?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  gender?: string;
  dateOfBirth?: string;
  secondaryGoals?: string[];
  workoutTypes?: string[];
  workoutFrequency?: number;
  workoutDuration?: number;
  availableEquipment?: string[];
  preferredUnits?: 'metric' | 'imperial';
  notificationsEnabled?: boolean;
}

// Onboarding step data - typed per step
export interface OnboardingStepData {
  GoalSelection?: { goals: string[] };
  ExperienceLevel?: { level: string };
  PhysicalProfile?: { height: number; weight: number; gender: string; dateOfBirth: string };
  SecondaryGoals?: { goals: string[] };
  WorkoutInterests?: { types: string[] };
  WorkoutFrequency?: { daysPerWeek: number };
  WorkoutDuration?: { minutes: number };
  Equipment?: { equipment: string[] };
  Units?: { system: 'metric' | 'imperial' };
  Notification?: { enabled: boolean };
}
