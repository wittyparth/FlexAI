export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type PrimaryGoal = 'muscle_gain' | 'fat_loss' | 'strength' | 'athletic' | 'general';
export type UnitSystem = 'metric' | 'imperial';
export type SecondaryGoal = 'strength' | 'mass' | 'toning' | 'endurance' | 'flexibility' | 'health' | 'speed' | 'balance';
export type WorkoutInterest = 'gym' | 'home' | 'yoga' | 'running' | 'swimming' | 'cycling' | 'calisthenics' | 'sports';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  experienceLevel?: ExperienceLevel;
  primaryGoal?: PrimaryGoal;
  secondaryGoals?: string[];
  trainingDaysPerWeek?: number;
  workoutDuration?: number;
  equipmentAvailable?: string[];
  injuryHistory?: string;
}

export interface UpdateSettingsInput {
  units?: UnitSystem;
  theme?: ThemePreference;
  language?: string;
  pushEnabled?: boolean;
  emailUpdates?: boolean;
  workoutReminders?: boolean;
  socialNotifications?: boolean;
  profilePrivate?: boolean;
  showStats?: boolean;
  showWorkouts?: boolean;
  defaultRestTime?: number;
  autoStartRest?: boolean;
}
