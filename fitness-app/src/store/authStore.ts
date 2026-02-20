import { create } from 'zustand';
import { storage } from '../utils/storage';
import { UserProfile } from '../api/auth.api';

// Re-export UserProfile as User for backward compatibility if needed, or update references
type User = UserProfile;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updatedUser: Partial<User> | null;
  
  // Actions
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setUpdatedUser: (updates: Partial<User>) => void;
  hydrate: () => Promise<void>;
}

export const authStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  updatedUser: null,

  // Login action
  login: async (tokens, user) => {
    await storage.saveAccessToken(tokens.accessToken);
    await storage.saveRefreshToken(tokens.refreshToken);
    await storage.saveUser(user);
    
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Logout action
  logout: async () => {
    console.log('🚪 [AUTH STORE] Starting logout...');
    console.log('🚪 [AUTH STORE] Current state:', {
      isAuthenticated: get().isAuthenticated,
      hasUser: !!get().user,
      hasToken: !!get().accessToken,
    });
    
    try {
      // Clear storage first
      await storage.clearAuth();
      console.log('✅ [AUTH STORE] Storage cleared');
      
      // Then update state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        updatedUser: null,
      });
      
      console.log('✅ [AUTH STORE] State reset - isAuthenticated:', false);
      console.log('✅ [AUTH STORE] Logout complete');
    } catch (error) {
      console.error('❌ [AUTH STORE] Logout failed:', error);
      throw error;
    }
  },

  // Update tokens (after refresh)
  updateTokens: async (accessToken, refreshToken) => {
    await storage.saveAccessToken(accessToken);
    await storage.saveRefreshToken(refreshToken);
    
    set({ accessToken, refreshToken });
  },

  // Update user data
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      storage.saveUser(updatedUser);
      set({ user: updatedUser });
    }
  },

  // Set onboarding as completed
  // Set onboarding as completed and merge pending updates
  setOnboardingCompleted: (completed) => {
    const user = get().user;
    const pendingUpdates = get().updatedUser || {};
    
    if (user) {
      const finalUser = { 
        ...user, 
        ...pendingUpdates,
        onboardingCompleted: completed 
      };
      storage.saveUser(finalUser);
      set({ 
        user: finalUser,
        updatedUser: null 
      });
    }
  },

  // Stage user updates (for onboarding)
  setUpdatedUser: (updates) => {
    const current = get().updatedUser || {};
    set({ updatedUser: { ...current, ...updates } });
  },

  // Hydrate from AsyncStorage on app start
  hydrate: async () => {
    console.log('🔄 [AUTH STORE] Starting hydration...');
    try {
      const [accessToken, refreshToken, user] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
        storage.getUser(),
      ]);

      if (accessToken && refreshToken && user) {
        console.log('✅ [AUTH STORE] User found, setting authenticated');
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        if (accessToken || refreshToken || user) {
          await storage.clearAuth();
        }

        console.log('❌ [AUTH STORE] No user found, setting unauthenticated');
        set({ 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('❌ [AUTH STORE] Hydration failed:', error);
      set({ 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));

export const useAuthStore = authStore;
