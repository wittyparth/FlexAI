import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  ACCESS_TOKEN: '@fitness_access_token',
  REFRESH_TOKEN: '@fitness_refresh_token',
  USER: '@fitness_user',
  ONBOARDING_COMPLETE: '@fitness_onboarding_complete',
} as const;

export const storage = {
  // Save access token
  saveAccessToken: async (token: string | null | undefined): Promise<void> => {
    if (token) {
      await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  // Save refresh token
  saveRefreshToken: async (token: string | null | undefined): Promise<void> => {
    if (token) {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  },

  // Save user data
  saveUser: async (user: any): Promise<void> => {
    if (user) {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(KEYS.USER);
    }
  },

  // Get user data
  getUser: async (): Promise<any | null> => {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // Save onboarding complete status
  saveOnboardingComplete: async (): Promise<void> => {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  },

  // Check if onboarding is complete
  isOnboardingComplete: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  },

  // Clear all auth data (logout)
  clearAuth: async (): Promise<void> => {
    console.log('🧹 [STORAGE] Clearing auth data...');
    try {
      await AsyncStorage.multiRemove([
        KEYS.ACCESS_TOKEN,
        KEYS.REFRESH_TOKEN,
        KEYS.USER,
      ]);
      console.log('✅ [STORAGE] Auth data cleared successfully');
      
      // Verify it's cleared
      const [token, refresh, user] = await Promise.all([
        AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(KEYS.USER),
      ]);
      console.log('🔍 [STORAGE] Verification:', {
        hasToken: !!token,
        hasRefresh: !!refresh,
        hasUser: !!user,
      });
    } catch (error) {
      console.error('❌ [STORAGE] Failed to clear auth:', error);
      throw error;
    }
  },

  // Clear all storage
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
