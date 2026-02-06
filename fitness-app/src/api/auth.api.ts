import apiClient from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  avatarUrl?: string;
  units?: 'metric' | 'imperial';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface AuthResponse {
  message: string;
}

// Backend response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Auth API endpoints
export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
    return response.data.data;
  },

  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Verify email with OTP - returns tokens and user after verification
  verifyEmail: async (data: { email: string; otp: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/verify-email', data);
    return response.data.data;
  },

  // Resend verification OTP
  resendVerification: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/resend-verification', { email });
    return response.data.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Logout
  logout: async (refreshToken?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/logout', { refreshToken });
    return response.data.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  // Reset password
  resetPassword: async (data: { email: string; otp: string; newPassword: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/reset-password', data);
    return response.data.data;
  },

  // Google OAuth
  googleAuth: async (idToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/google', { idToken });
    return response.data.data;
  },
};

