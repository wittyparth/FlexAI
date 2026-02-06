/**
 * Navigation Type Definitions
 * Defines all navigation stacks, screens, and params
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ==========================================
// Root Navigation
// ==========================================
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
};

// ==========================================
// Auth Stack (Screens 1-8)
// ==========================================
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  GoogleOAuth: undefined;
  AccountLocked: undefined;
};

// ==========================================
// Onboarding Stack (Screens 9-18)
// ==========================================
export type OnboardingStackParamList = {
  OnboardingGoals: undefined;
  OnboardingExperience: undefined;
  OnboardingBodyInfo: undefined;
  OnboardingEquipment: undefined;
  OnboardingSchedule: undefined;
  OnboardingDuration: undefined;
  OnboardingUnits: undefined;
  OnboardingNotifications: undefined;
  OnboardingTour: undefined;
  OnboardingComplete: undefined;
};

// ==========================================
// Main Tabs
// ==========================================
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  WorkoutTab: NavigatorScreenParams<WorkoutStackParamList>;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  SocialTab: NavigatorScreenParams<SocialStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ==========================================
// Home Stack (Screens 19-22)
// ==========================================
export type HomeStackParamList = {
  HomeDashboard: undefined;
  HomeNotifications: undefined;
  FullStreakCalendar: undefined;
  XPLevelDetail: undefined;
};

// ==========================================
// Workout Stack (Screens 23-46)
// ==========================================
export type WorkoutStackParamList = {
  // Phase 2A: Workout Hub
  WorkoutHub: undefined;
  RoutineList: undefined;
  RoutineDetail: { routineId: number };
  RoutineEditor: { routineId?: number };
  ExercisePicker: { onSelect?: (exerciseIds: number[]) => void };
  ExerciseDetail: { exerciseId: number };
  ExerciseFilter: undefined;
  CustomExercise: undefined;
  
  // Phase 2B: Active Workout
  ActiveWorkout: { routineId?: number; workoutId?: number };
  ExerciseSwap: { exerciseId: number; currentExerciseName: string };
  SetConfig: { setId: number; exerciseId: number };
  WorkoutSummary: { workoutId: number };
  
  // Phase 2C: History & AI
  WorkoutHistory: undefined;
  WorkoutDetail: { workoutId: number };
  SessionInsights: { workoutId: number };
  AIGenerator: { presetGoal?: string; presetDuration?: number; customPrompt?: string };
  AIPreview: { workoutData: any };
  AIPrompts: undefined;
};

// ==========================================
// Explore Stack (Screens 39-46)
// ==========================================
export type ExploreStackParamList = {
  ExploreHome: undefined;
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: number };
  RoutineLibrary: undefined;
  RoutinePreview: { routineId: number };
  CreateCustomExercise: undefined;
  MyCustomExercises: undefined;
};

// ==========================================
// Social Stack (Screens 47-58)
// ==========================================
export type SocialStackParamList = {
  SocialHome: undefined;
  CreatePost: { workoutId?: number };
  PostDetail: { postId: number };
  UserProfile: { userId: number };
  FollowersList: { userId: number };
  FollowingList: { userId: number };
  Leaderboard: undefined;
  ChallengesList: undefined;
  ChallengeDetail: { challengeId: number };
  SearchUsers: undefined;
  Activity: undefined;
  ShareWorkout: { workoutId: number };
};

// ==========================================
// Profile Stack (Screens 59-88)
// ==========================================
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Achievements: undefined;
  MyFollowers: undefined;
  MyFollowing: undefined;
  XPHistory: undefined;
  
  // Stats Hub (Screens 65-72)
  StatsHub: undefined;
  PersonalRecords: undefined;
  StrengthProgression: { exerciseId?: number };
  VolumeAnalytics: undefined;
  WorkoutFrequency: undefined;
  MuscleDistribution: undefined;
  RecoveryStatus: undefined;
  StrengthMetrics: undefined;
  
  // AI Coach (Screens 73-75)
  CoachConversations: undefined;
  CoachChat: { conversationId?: number };
  CoachPrompts: undefined;
  
  // Body Tracking (Screens 76-80)
  BodyTrackingHub: undefined;
  LogWeight: undefined;
  LogMeasurements: undefined;
  ProgressPhotos: undefined;
  TakeProgressPhoto: undefined;
  
  // Settings (Screens 81-88)
  Settings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  UnitsPreferences: undefined;
  AccountSettings: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
  About: undefined;
};

// ==========================================
// Screen Props Types (for use in components)
// ==========================================

// Example: HomeStackScreenProps<'HomeDashboard'>
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = StackScreenProps<HomeStackParamList, T>;

export type WorkoutStackScreenProps<T extends keyof WorkoutStackParamList> = StackScreenProps<WorkoutStackParamList, T>;

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> = StackScreenProps<ExploreStackParamList, T>;

export type SocialStackScreenProps<T extends keyof SocialStackParamList> = StackScreenProps<SocialStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = StackScreenProps<ProfileStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> = StackScreenProps<OnboardingStackParamList, T>;

// Main Tab Props
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;
