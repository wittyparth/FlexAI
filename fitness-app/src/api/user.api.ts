/**
 * User API - Profile & Onboarding
 * 
 * Handles user profile management, onboarding flows, and body stats.
 */

import apiClient from './client';

export interface UserProfile {
    id: number | string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string;
    onboardingCompleted: boolean;
    emailVerified?: boolean;
    role: string;
    createdAt?: string;
    updatedAt?: string;
    // Profile fields
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    height?: number;
    weight?: number;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    primaryGoal?: 'muscle_gain' | 'fat_loss' | 'strength' | 'athletic' | 'general';
    secondaryGoals?: string[];
    workoutInterests?: string[];
    trainingDaysPerWeek?: number;
    workoutDuration?: number;
    equipmentAvailable?: string[];
    // Settings
    units?: 'metric' | 'imperial';
}

export interface OnboardingData {
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    height?: number;
    weight?: number; // currentWeight
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    primaryGoal?: 'muscle_gain' | 'fat_loss' | 'strength' | 'athletic' | 'general';
    secondaryGoals?: string[];
    workoutInterests?: string[];
    trainingDaysPerWeek?: number;
    workoutDuration?: number;
    equipmentAvailable?: string[];
    units?: 'metric' | 'imperial';
    pushEnabled?: boolean;
}

export interface UserSettings {
    id: string;
    userId: string;
    units: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
    language: string;
    pushEnabled: boolean;
    emailUpdates: boolean;
    workoutReminders: boolean;
    socialNotifications: boolean;
    profilePrivate: boolean;
    showStats: boolean;
    showWorkouts: boolean;
    defaultRestTime: number;
    autoStartRest: boolean;
}

export const userApi = {
    // Get current user profile
    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get('/users/me');
        return response.data.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.patch('/users/me', data);
        return response.data.data;
    },

    // Submit onboarding data
    submitOnboarding: async (data: OnboardingData): Promise<UserProfile> => {
        const response = await apiClient.post('/users/me/complete-onboarding', data);
        return response.data.data;
    },

    // Upload avatar
    uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
        const response = await apiClient.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    // Get user settings
    getSettings: async (): Promise<UserSettings> => {
        const response = await apiClient.get('/users/me/settings');
        return response.data.data;
    },

    // Update user settings
    updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
        const response = await apiClient.patch('/users/me/settings', data);
        return response.data.data;
    },
};
