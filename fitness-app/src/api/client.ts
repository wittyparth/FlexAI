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
  data?: unknown;
}

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (accessToken: string) => void;
  reject: (error: ApiError) => void;
}> = [];

const createApiError = (error: AxiosError | unknown): ApiError => {
  if (!axios.isAxiosError(error)) {
    return {
      message: (error as Error)?.message || 'An unexpected error occurred',
    };
  }

  const errorData = error.response?.data as Record<string, unknown> | undefined;

  return {
    message: (errorData?.message as string) || error.message || 'An unexpected error occurred',
    status: error.response?.status,
    code: errorData?.code as string | undefined,
    data: errorData?.data,
  };
};

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) return false;

  const skipPaths = [
    '/auth/register',
    '/auth/login',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/google',
    '/auth/refresh',
  ];

  return skipPaths.some((path) => url.includes(path));
};

const flushRefreshQueue = (error: ApiError | null, accessToken?: string) => {
  refreshQueue.forEach((pending) => {
    if (error || !accessToken) {
      pending.reject(error ?? { message: 'Token refresh failed' });
      return;
    }

    pending.resolve(accessToken);
  });

  refreshQueue = [];
};

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
    const originalRequest = error.config as RetryRequestConfig | undefined;

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

    // 1. Handle 401 Unauthorized (Token Expiry) with a single-flight refresh queue
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      const refreshToken = authStore.getState().refreshToken;
      if (!refreshToken) {
        await authStore.getState().logout();
        return Promise.reject({
          message: 'No refresh token available',
          status: 401,
        } as ApiError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newAccessToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              originalRequest._retry = true;
              resolve(apiClient(originalRequest));
            },
            reject: (queueError) => {
              reject(queueError);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        await authStore.getState().updateTokens(newAccessToken, newRefreshToken);
        flushRefreshQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        const standardizedRefreshError = createApiError(refreshError);
        flushRefreshQueue(standardizedRefreshError);
        await authStore.getState().logout();
        return Promise.reject(standardizedRefreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Standardize Error Format
    return Promise.reject(createApiError(error));
  }
);

export default apiClient;
