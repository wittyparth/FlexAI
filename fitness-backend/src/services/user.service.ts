import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import type { UpdateProfileInput, UpdateSettingsInput } from '../schemas/user.schema';

/**
 * User Service - handles user profile and settings business logic
 */
export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        experienceLevel: true,
        primaryGoal: true,
        secondaryGoals: true,
        trainingDaysPerWeek: true,
        workoutDuration: true,
        equipmentAvailable: true,
        injuryHistory: true,
        // Gamification
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastWorkoutDate: true,
        // Meta
        role: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: number, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        experienceLevel: true,
        primaryGoal: true,
        secondaryGoals: true,
        trainingDaysPerWeek: true,
        workoutDuration: true,
        equipmentAvailable: true,
        injuryHistory: true,
        updatedAt: true,
      },
    });

    return user;
  },

  /**
   * Get user settings
   */
  async getSettings(userId: number) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if not exist
      return prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  },

  /**
   * Update user settings
   */
  async updateSettings(userId: number, input: UpdateSettingsInput) {
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: input,
      create: { userId, ...input },
    });

    return settings;
  },

  /**
   * Update avatar
   */
  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return user;
  },

  /**
   * Delete user account (GDPR compliance)
   */
  async deleteAccount(userId: number) {
    // Soft delete - deactivate account
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${userId}_${Date.now()}@deleted.local`, // Anonymize email
        firstName: null,
        lastName: null,
        avatarUrl: null,
        // Keep workout data for analytics but anonymize
      },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Account deleted successfully' };
  },

  /**
   * Complete onboarding and update profile with onboarding data
   */
  async completeOnboarding(userId: number, onboardingData: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    experienceLevel?: string;
    primaryGoal?: string;
    secondaryGoals?: string[];
    workoutInterests?: string[];
    trainingDaysPerWeek?: number;
    workoutDuration?: number;
    equipmentAvailable?: string[];
    units?: string;
    pushEnabled?: boolean;
  }) {
    // Build update data, filtering out undefined values
    const updateData: Record<string, unknown> = {
      onboardingCompleted: true,
    };

    if (onboardingData.age !== undefined) updateData.age = onboardingData.age;
    if (onboardingData.gender !== undefined) updateData.gender = onboardingData.gender;
    if (onboardingData.height !== undefined) updateData.height = onboardingData.height;
    if (onboardingData.weight !== undefined) updateData.weight = onboardingData.weight;
    if (onboardingData.experienceLevel !== undefined) updateData.experienceLevel = onboardingData.experienceLevel;
    if (onboardingData.primaryGoal !== undefined) updateData.primaryGoal = onboardingData.primaryGoal;
    if (onboardingData.secondaryGoals !== undefined) updateData.secondaryGoals = onboardingData.secondaryGoals;
    if (onboardingData.trainingDaysPerWeek !== undefined) updateData.trainingDaysPerWeek = onboardingData.trainingDaysPerWeek;
    if (onboardingData.workoutDuration !== undefined) updateData.workoutDuration = onboardingData.workoutDuration;
    if (onboardingData.equipmentAvailable !== undefined) updateData.equipmentAvailable = onboardingData.equipmentAvailable;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        onboardingCompleted: true,
        emailVerified: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        experienceLevel: true,
        primaryGoal: true,
        secondaryGoals: true,
        trainingDaysPerWeek: true,
        workoutDuration: true,
        equipmentAvailable: true,
      },
    });

    // Update settings for units if provided
    if (onboardingData.units) {
      await prisma.userSettings.upsert({
        where: { userId },
        update: { units: onboardingData.units },
        create: { userId, units: onboardingData.units },
      });
    }

    return user;
  },
};
