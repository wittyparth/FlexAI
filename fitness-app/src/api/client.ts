import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../store/authStore';
import { Platform } from 'react-native';

// API Configuration
// ----------------------------------------------------------------------------
// IMPORTANT: Update this IP to match your development machine's local IP
// Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find your IP address
const DEV_MACHINE_IP = '192.168.1.6'; // ⚠️ UPDATE THIS TO YOUR MACHINE'S IP
const PROD_URL = 'https://your-production-api.com/api/v1';

const getBaseUrl = () => {
    if (!__DEV__) return PROD_URL;
    
    // ALWAYS use the machine's IP for physical devices and Expo Go
    // Expo Go on physical devices needs the local network IP
    return `http://${DEV_MACHINE_IP}:3000/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

// Log API configuration on startup
console.log('🔧 API Configuration:');
console.log('  Base URL:', API_BASE_URL);
console.log('  Platform:', Platform.OS);
console.log('  Dev Mode:', __DEV__);

// Create Axios Instance
// ----------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    data?: any;
}

// Request Interceptor: Inject Token
// ----------------------------------------------------------------------------
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().accessToken;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling & Token Refresh
// ----------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log detailed error for debugging
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🚨 Network Error Details:');
      console.error('  URL:', originalRequest?.url);
      console.error('  Base URL:', API_BASE_URL);
      console.error('  Full URL:', `${API_BASE_URL}${originalRequest?.url}`);
      console.error('  Method:', originalRequest?.method);
      console.error('  Error:', error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('  1. Is backend running? (npm run dev in fitness-backend)');
      console.error('  2. Are you on the same WiFi network?');
      console.error('  3. Is the IP address correct in client.ts?');
      console.error('  4. Try accessing in browser:', `${API_BASE_URL}/health`);
    }

    // 1. Handle 401 Unauthorized (Token Expiry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStore.getState().refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt Refresh
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update Store
        await authStore.getState().updateTokens(newAccessToken, newRefreshToken);

        // Retry Request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Failed -> Force Logout
        console.warn('Token refresh failed, logging out user.');
        authStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // 2. Standardize Error Format
    const errorData = error.response?.data as any;
    const standardError: ApiError = {
        message: errorData?.message || error.message || 'An unexpected error occurred',
        status: error.response?.status,
        code: errorData?.code,
        data: errorData?.data
    };
    
    return Promise.reject(standardError);
  }
);

export default apiClient;
