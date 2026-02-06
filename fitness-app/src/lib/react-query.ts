import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache is kept for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed requests 2 times
      retry: 2,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Disable auto-focus refetching in development to prevent flashing
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      // Don't retry mutations automatically (can lead to duplicate posts)
      retry: false,
    },
  },
});
