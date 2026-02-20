import { z } from 'zod';

// =============================================================================
// UPDATE PROFILE
// =============================================================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  
  // Fitness profile
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  height: z.number().min(50).max(300).optional(), // cm
  weight: z.number().min(20).max(500).optional(), // kg
  
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  primaryGoal: z.enum(['muscle_gain', 'fat_loss', 'strength', 'athletic', 'general']).optional(),
  secondaryGoals: z.array(z.string()).max(3).optional(),
  workoutInterests: z.array(z.string()).max(10).optional(),
  
  trainingDaysPerWeek: z.number().int().min(1).max(7).optional(),
  workoutDuration: z.number().int().min(15).max(180).optional(), // minutes
  
  equipmentAvailable: z.array(z.string()).optional(),
  injuryHistory: z.string().max(1000).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =============================================================================
// COMPLETE ONBOARDING
// =============================================================================

export const completeOnboardingSchema = z.object({
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),

  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  primaryGoal: z.enum(['muscle_gain', 'fat_loss', 'strength', 'athletic', 'general']).optional(),
  secondaryGoals: z.array(z.string()).max(3).optional(),
  workoutInterests: z.array(z.string()).max(10).optional(),

  trainingDaysPerWeek: z.number().int().min(1).max(7).optional(),
  workoutDuration: z.number().int().min(15).max(180).optional(),
  equipmentAvailable: z.array(z.string()).optional(),

  units: z.enum(['metric', 'imperial']).optional(),
  pushEnabled: z.boolean().optional(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

// =============================================================================
// USER SETTINGS
// =============================================================================

export const updateSettingsSchema = z.object({
  units: z.enum(['metric', 'imperial']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().max(10).optional(),
  
  // Notifications
  pushEnabled: z.boolean().optional(),
  emailUpdates: z.boolean().optional(),
  workoutReminders: z.boolean().optional(),
  socialNotifications: z.boolean().optional(),
  
  // Privacy
  profilePrivate: z.boolean().optional(),
  showStats: z.boolean().optional(),
  showWorkouts: z.boolean().optional(),
  
  // Rest timer
  defaultRestTime: z.number().int().min(10).max(600).optional(),
  autoStartRest: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
