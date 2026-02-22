/**
 * authStore.ts — Auth + Onboarding FSM
 *
 * Design principles:
 *  1. Discriminated union `AuthPhase` makes impossible states impossible.
 *     You CANNOT have phase='ready' without a userId.
 *  2. All transitions are explicit named methods — no raw set() from UI.
 *  3. Tokens live outside user object to prevent accidental exposure.
 *  4. Onboarding data is accumulated progressively via saveOnboardingStep().
 *  5. hydrate() is the ONLY entry point on app start.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { storage } from '../utils/storage';
import {
  AuthPhase,
  AuthUser,
  OnboardingStep,
  OnboardingStepData,
  ONBOARDING_STEPS,
} from './types/auth.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthStoreState {
  authPhase: AuthPhase;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  // Staged onboarding data — accumulated across steps, merged on complete
  onboardingData: Partial<OnboardingStepData>;
}

interface AuthStoreActions {
  // Lifecycle
  hydrate: () => Promise<void>;

  // Auth transitions — called by screen handlers
  beginLogin: (email: string) => void;
  loginSuccess: (tokens: AuthTokens, user: AuthUser) => Promise<void>;
  beginRegister: (email: string) => void;
  registerSuccessNeedsVerify: (email: string) => void;
  verifyEmailSuccess: (tokens: AuthTokens, user: AuthUser) => Promise<void>;
  loginFailed: () => void;
  lockAccount: (email: string, waitSeconds: number) => void;
  logout: () => Promise<void>;

  // Token refresh — called by HTTP interceptor ONLY, never by UI
  refreshTokens: (tokens: AuthTokens) => Promise<void>;

  // User data
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;

  // Onboarding flow
  saveOnboardingStep: <K extends keyof OnboardingStepData>(
    step: OnboardingStep,
    data: NonNullable<OnboardingStepData[K]>,
  ) => void;
  advanceOnboarding: (nextStep: OnboardingStep) => void;
  completeOnboarding: () => Promise<void>;
}

type AuthStore = AuthStoreState & AuthStoreActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const firstOnboardingStep = (): OnboardingStep => ONBOARDING_STEPS[0];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  immer((set, get) => ({
    // Purposely "hydrating" until hydrate() resolves — prevents flash of wrong UI
    authPhase: { phase: 'hydrating' },
    user: null,
    tokens: null,
    onboardingData: {},

    // ── Lifecycle ────────────────────────────────────────────────────────────

    hydrate: async () => {
      try {
        const [accessToken, refreshToken, user] = await Promise.all([
          storage.getAccessToken(),
          storage.getRefreshToken(),
          storage.getUser(),
        ]);

        if (accessToken && refreshToken && user) {
          set((s) => {
            s.tokens = { accessToken, refreshToken };
            s.user = user as AuthUser;
            s.authPhase = user.onboardingCompleted
              ? { phase: 'ready', userId: user.id }
              : {
                  phase: 'onboarding',
                  userId: user.id,
                  currentStep: firstOnboardingStep(),
                  completedSteps: [],
                };
          });
        } else {
          // Partial/corrupted session — wipe it
          if (accessToken || refreshToken || user) {
            await storage.clearAuth();
          }
          set((s) => {
            s.authPhase = { phase: 'guest' };
            s.user = null;
            s.tokens = null;
          });
        }
      } catch {
        set((s) => {
          s.authPhase = { phase: 'guest' };
          s.user = null;
          s.tokens = null;
        });
      }
    },

    // ── Auth Transitions ─────────────────────────────────────────────────────

    beginLogin: (email) =>
      set((s) => { s.authPhase = { phase: 'logging_in', email }; }),

    loginSuccess: async (tokens, user) => {
      await Promise.all([
        storage.saveAccessToken(tokens.accessToken),
        storage.saveRefreshToken(tokens.refreshToken),
        storage.saveUser(user as any),
      ]);
      set((s) => {
        s.tokens = tokens;
        s.user = user;
        s.authPhase = user.onboardingCompleted
          ? { phase: 'ready', userId: user.id }
          : { phase: 'onboarding', userId: user.id, currentStep: firstOnboardingStep(), completedSteps: [] };
      });
    },

    beginRegister: (email) =>
      set((s) => { s.authPhase = { phase: 'registering', email }; }),

    registerSuccessNeedsVerify: (email) =>
      set((s) => { s.authPhase = { phase: 'verifying_email', email }; }),

    verifyEmailSuccess: async (tokens, user) => {
      await Promise.all([
        storage.saveAccessToken(tokens.accessToken),
        storage.saveRefreshToken(tokens.refreshToken),
        storage.saveUser(user as any),
      ]);
      set((s) => {
        s.tokens = tokens;
        s.user = user;
        // New users always need onboarding
        s.authPhase = {
          phase: 'onboarding',
          userId: user.id,
          currentStep: firstOnboardingStep(),
          completedSteps: [],
        };
      });
    },

    loginFailed: () =>
      set((s) => { s.authPhase = { phase: 'guest' }; }),

    lockAccount: (email, waitSeconds) =>
      set((s) => {
        s.authPhase = { phase: 'locked', email, unlockAtMs: Date.now() + waitSeconds * 1000 };
      }),

    logout: async () => {
      await storage.clearAuth();
      set((s) => {
        s.authPhase = { phase: 'guest' };
        s.user = null;
        s.tokens = null;
        s.onboardingData = {};
      });
    },

    refreshTokens: async (tokens) => {
      await Promise.all([
        storage.saveAccessToken(tokens.accessToken),
        storage.saveRefreshToken(tokens.refreshToken),
      ]);
      set((s) => { s.tokens = tokens; });
    },

    updateUser: async (updates) => {
      const current = get().user;
      if (!current) return;
      const next: AuthUser = { ...current, ...updates };
      await storage.saveUser(next as any);
      set((s) => { s.user = next; });
    },

    // ── Onboarding ───────────────────────────────────────────────────────────

    saveOnboardingStep: (step, data) =>
      set((s) => { (s.onboardingData as any)[step] = data; }),

    advanceOnboarding: (nextStep) =>
      set((s) => {
        if (s.authPhase.phase !== 'onboarding') return;
        const completed = [...s.authPhase.completedSteps, s.authPhase.currentStep];
        s.authPhase = {
          phase: 'onboarding',
          userId: s.authPhase.userId,
          currentStep: nextStep,
          completedSteps: completed,
        };
      }),

    completeOnboarding: async () => {
      const { user, onboardingData } = get();
      if (!user) return;

      const od = onboardingData as any;
      const updatedUser: AuthUser = {
        ...user,
        onboardingCompleted:  true,
        goals:                od.GoalSelection?.goals          ?? user.goals,
        experienceLevel:      od.ExperienceLevel?.level        ?? user.experienceLevel,
        height:               od.PhysicalProfile?.height       ?? user.height,
        weight:               od.PhysicalProfile?.weight       ?? user.weight,
        gender:               od.PhysicalProfile?.gender       ?? user.gender,
        dateOfBirth:          od.PhysicalProfile?.dateOfBirth  ?? user.dateOfBirth,
        secondaryGoals:       od.SecondaryGoals?.goals         ?? user.secondaryGoals,
        workoutTypes:         od.WorkoutInterests?.types       ?? user.workoutTypes,
        workoutFrequency:     od.WorkoutFrequency?.daysPerWeek ?? user.workoutFrequency,
        workoutDuration:      od.WorkoutDuration?.minutes      ?? user.workoutDuration,
        availableEquipment:   od.Equipment?.equipment          ?? user.availableEquipment,
        preferredUnits:       od.Units?.system                 ?? user.preferredUnits,
        notificationsEnabled: od.Notification?.enabled         ?? user.notificationsEnabled,
      };

      await storage.saveUser(updatedUser as any);
      set((s) => {
        s.user = updatedUser;
        s.onboardingData = {};
        s.authPhase = { phase: 'ready', userId: updatedUser.id };
      });
    },
  })),
);

// ─── Atomic Selectors ─────────────────────────────────────────────────────────
// Components subscribe to the SMALLEST slice possible.
// Each selector triggers a re-render ONLY when its specific value changes.

export const selectAuthPhase       = (s: AuthStore) => s.authPhase;
export const selectIsHydrating     = (s: AuthStore) => s.authPhase.phase === 'hydrating';
export const selectIsReady         = (s: AuthStore) => s.authPhase.phase === 'ready';
export const selectNeedsOnboarding = (s: AuthStore) => s.authPhase.phase === 'onboarding';
export const selectIsGuest         = (s: AuthStore) =>
  (['guest', 'logging_in', 'registering', 'verifying_email', 'locked'] as const)
    .includes(s.authPhase.phase as any);

export const selectUser          = (s: AuthStore) => s.user;
export const selectUserId        = (s: AuthStore) => s.user?.id ?? null;
export const selectAccessToken   = (s: AuthStore) => s.tokens?.accessToken ?? null;
export const selectRefreshToken  = (s: AuthStore) => s.tokens?.refreshToken ?? null;

export const selectOnboardingStep = (s: AuthStore) =>
  s.authPhase.phase === 'onboarding' ? s.authPhase.currentStep : null;

export const selectOnboardingProgress = (s: AuthStore) => {
  if (s.authPhase.phase !== 'onboarding')
    return { current: 0, total: ONBOARDING_STEPS.length, percent: 0 };
  const current = s.authPhase.completedSteps.length;
  return {
    current,
    total:   ONBOARDING_STEPS.length,
    percent: Math.round((current / ONBOARDING_STEPS.length) * 100),
  };
};

// Legacy compat — some files imported as authStore
export const authStore = useAuthStore;


