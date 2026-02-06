import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, OnboardingData, UserProfile } from '../../api/user.api';
import { useAuthStore } from '../../store/authStore';

export const userKeys = {
    all: ['user'] as const,
    profile: () => [...userKeys.all, 'profile'] as const,
    settings: () => [...userKeys.all, 'settings'] as const,
};

export function useUserQueries() {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);

    // Query: Get User Profile
    const profileQuery = useQuery({
        queryKey: userKeys.profile(),
        queryFn: userApi.getProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Mutation: Update Profile
    const updateProfileMutation = useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(userKeys.profile(), updatedUser);
            updateUser(updatedUser); // Sync with auth store
        },
    });

    // Mutation: Submit Onboarding
    const submitOnboardingMutation = useMutation({
        mutationFn: async (data: OnboardingData) => {
            console.log('📤 Submitting onboarding data:', data);
            try {
                const result = await userApi.submitOnboarding(data);
                console.log('✅ Onboarding submission successful:', result);
                return result;
            } catch (error: any) {
                console.error('❌ Onboarding submission failed:', error.message);
                console.error('Error details:', error.response?.data || error);
                throw error;
            }
        },
        onSuccess: (updatedUser) => {
            console.log('🎉 Onboarding completed, updating local state');
            queryClient.setQueryData(userKeys.profile(), updatedUser);
            updateUser(updatedUser); // Sync with auth store
            queryClient.invalidateQueries({ queryKey: userKeys.settings() });
        },
        onError: (error: any) => {
            console.error('🚨 Onboarding mutation error:', error);
        },
    });

    // Mutation: Upload Avatar
    const uploadAvatarMutation = useMutation({
        mutationFn: userApi.uploadAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile() });
        },
    });

    // Query: Get User Settings
    const settingsQuery = useQuery({
        queryKey: userKeys.settings(),
        queryFn: userApi.getSettings,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Mutation: Update User Settings
    const updateSettingsMutation = useMutation({
        mutationFn: userApi.updateSettings,
        onSuccess: (newSettings) => {
            queryClient.setQueryData(userKeys.settings(), newSettings);
        },
    });

    return {
        profileQuery,
        updateProfileMutation,
        submitOnboardingMutation,
        uploadAvatarMutation,
        settingsQuery,
        updateSettingsMutation,
    };
}
