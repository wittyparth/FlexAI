import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../store/authStore';
import { NativeModules, Platform } from 'react-native';

// API Configuration
// ----------------------------------------------------------------------------
const PROD_URL = 'https://your-production-api.com/api/v1';
const DEV_PORT = '3000';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const inferMetroHost = (): string | undefined => {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL as string | undefined;
    if (!scriptURL) return undefined;
    const match = scriptURL.match(/^[a-zA-Z]+:\/\/([^/:?#]+)(?::\d+)?/);
    return match?.[1];
  } catch {
    return undefined;
  }
};

const dedupe = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

/**
 * Priority order:
 * 1. EXPO_PUBLIC_API_BASE_URL (full URL, e.g. http://192.168.1.6:3000/api/v1)
 * 2. EXPO_PUBLIC_DEV_MACHINE_IP (host only, e.g. 192.168.1.6)
 * 3. Platform fallback (Android emulator -> 10.0.2.2, iOS/web -> localhost)
 */
const getDevBaseUrlCandidates = (): string[] => {
  const candidates: string[] = [];

  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (explicitBaseUrl) {
    // If user explicitly sets a base URL, do not cycle through fallbacks.
    return [normalizeBaseUrl(explicitBaseUrl)];
  }

  const explicitHost = process.env.EXPO_PUBLIC_DEV_MACHINE_IP?.trim();
  if (explicitHost) candidates.push(`http://${explicitHost}:${DEV_PORT}/api/v1`);

  const metroHost = inferMetroHost();
  if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
    candidates.push(`http://${metroHost}:${DEV_PORT}/api/v1`);
  }

  if (Platform.OS === 'android') {
    candidates.push(`http://10.0.2.2:${DEV_PORT}/api/v1`);
  }

  candidates.push(`http://localhost:${DEV_PORT}/api/v1`);

  return dedupe(candidates.map(normalizeBaseUrl));
};

const DEV_BASE_URL_CANDIDATES = __DEV__ ? getDevBaseUrlCandidates() : [normalizeBaseUrl(PROD_URL)];

let currentApiBaseUrl = DEV_BASE_URL_CANDIDATES[0] || normalizeBaseUrl(PROD_URL);

export const API_BASE_URL = currentApiBaseUrl;

// Log API configuration on startup
console.log('🔧 API Configuration:');
console.log('  Base URL:', currentApiBaseUrl);
console.log('  Candidates:', DEV_BASE_URL_CANDIDATES);
console.log('  Platform:', Platform.OS);
console.log('  Dev Mode:', __DEV__);
console.log('  EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL || '(not set)');
console.log('  EXPO_PUBLIC_DEV_MACHINE_IP:', process.env.EXPO_PUBLIC_DEV_MACHINE_IP || '(not set)');

// Create Axios Instance
// ----------------------------------------------------------------------------
const apiClient: AxiosInstance = axios.create({
  baseURL: currentApiBaseUrl,
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

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _networkRetryAttempted?: boolean;
};

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
  const nestedError = errorData?.error as Record<string, unknown> | undefined;
  const topLevelMessage = errorData?.message as string | undefined;
  const nestedMessage = nestedError?.message as string | undefined;
  const topLevelCode = errorData?.code as string | undefined;
  const nestedCode = nestedError?.code as string | undefined;
  const topLevelData = errorData?.data;
  const nestedDetails = nestedError?.details;

  return {
    message: nestedMessage || topLevelMessage || error.message || 'An unexpected error occurred',
    status: error.response?.status,
    code: nestedCode || topLevelCode,
    data: topLevelData ?? nestedDetails,
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
    config.baseURL = config.baseURL || currentApiBaseUrl;
    const token = authStore.getState().tokens?.accessToken ?? null;
    
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
      // One-shot fallback to next candidate base URL in dev
      if (__DEV__ && originalRequest && !originalRequest._networkRetryAttempted && DEV_BASE_URL_CANDIDATES.length > 1) {
        const currentBase = normalizeBaseUrl(String(originalRequest.baseURL || currentApiBaseUrl));
        const nextBase = DEV_BASE_URL_CANDIDATES.find((url) => normalizeBaseUrl(url) !== currentBase);

        if (nextBase) {
          originalRequest._networkRetryAttempted = true;
          originalRequest.baseURL = nextBase;
          currentApiBaseUrl = nextBase;
          apiClient.defaults.baseURL = nextBase;
          console.warn(`🔁 Retrying request with fallback API base URL: ${nextBase}`);
          return apiClient(originalRequest);
        }
      }

      console.error('🚨 Network Error Details:');
      console.error('  URL:', originalRequest?.url);
      console.error('  Base URL:', originalRequest?.baseURL || currentApiBaseUrl);
      console.error('  Full URL:', `${originalRequest?.baseURL || currentApiBaseUrl}${originalRequest?.url}`);
      console.error('  Method:', originalRequest?.method);
      console.error('  Error:', error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('  1. Is backend running? (npm run dev in fitness-backend)');
      console.error('  2. Are you on the same WiFi network?');
      console.error('  3. Set EXPO_PUBLIC_API_BASE_URL or EXPO_PUBLIC_DEV_MACHINE_IP correctly');
      console.error('  4. Try accessing in browser:', `${currentApiBaseUrl}/health`);
    }

    // 1. Handle 401 Unauthorized (Token Expiry) with a single-flight refresh queue
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      const refreshToken = authStore.getState().tokens?.refreshToken ?? null;
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
        const refreshResponse = await axios.post(`${currentApiBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        await authStore.getState().refreshTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
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
