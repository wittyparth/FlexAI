import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginRequest, RegisterRequest } from '../../api/auth.api';
import { authStore } from '../../store/authStore';

export const useAuthQueries = () => {
    const queryClient = useQueryClient();
    // Using direct store access or hooks if needed, but for mutations simple access is often enough
    // or we can use the hook: const login = authStore((state) => state.login);
    
    // However, since we are inside useMutation, we can access the store directly via export or getState()
    // But it's better to stick to the hook pattern if possible, or just use `authStore.getState()` for imperative updates
    
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
        onSuccess: async (data) => {
            // Update client-side auth state
            await authStore.getState().login(
                { accessToken: data.accessToken, refreshToken: data.refreshToken },
                data.user
            );
            // Invalidate any user-related queries
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
    });

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: async () => {
             await authStore.getState().logout();
            queryClient.clear();
        },
    });

    const verifyEmailMutation = useMutation({
        mutationFn: (data: { email: string; otp: string }) => authApi.verifyEmail(data),
        onSuccess: async (data: any) => {
            // Update client-side auth state
             await authStore.getState().login(
                { accessToken: data.accessToken, refreshToken: data.refreshToken },
                data.user
            );
             queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });

    const resendVerificationMutation = useMutation({
        mutationFn: (email: string) => authApi.resendVerification(email),
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (email: string) => authApi.forgotPassword(email),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (data: any) => authApi.resetPassword(data),
    });

    return {
        loginMutation,
        registerMutation,
        logoutMutation,
        verifyEmailMutation,
        resendVerificationMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
    };
};
