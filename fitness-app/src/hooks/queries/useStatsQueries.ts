import { useQuery } from '@tanstack/react-query';
import {
  statsApi,
  DashboardStatsResponse,
  VolumeStatsResponse,
  VolumeTimeframe,
  PersonalRecordResponse,
  MuscleDistributionResponse,
} from '../../api/stats.api';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery<DashboardStatsResponse>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      console.log('📊 Fetching dashboard stats...');
      try {
        const data = await statsApi.getDashboardStats();
        console.log('✅ Dashboard stats received:', data);
        return data;
      } catch (error: any) {
        console.error('❌ Dashboard stats error:', error.message || error);
        console.error('Error details:', error.response?.data || error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    enabled: true, // Always enabled when dashboard is mounted (means user is authenticated)
  });
}

/**
 * Hook to fetch consistency heatmap
 */
export function useConsistencyHeatmap() {
  return useQuery<number[][]>({
    queryKey: ['dashboard', 'heatmap'],
    queryFn: () => statsApi.getConsistencyHeatmap(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch volume analytics
 */
export function useVolumeStats(timeframe: VolumeTimeframe) {
  return useQuery<VolumeStatsResponse>({
    queryKey: ['stats', 'volume', timeframe],
    queryFn: () => statsApi.getVolumeStats(timeframe),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch personal records
 */
export function usePersonalRecords(exerciseId?: number) {
  return useQuery<PersonalRecordResponse[]>({
    queryKey: ['stats', 'prs', exerciseId ?? 'all'],
    queryFn: () => statsApi.getPersonalRecords(exerciseId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch strength progression for one exercise
 */
export function useStrengthProgression(exerciseId?: number) {
  return useQuery<PersonalRecordResponse[]>({
    queryKey: ['stats', 'strength-progression', exerciseId ?? 'none'],
    queryFn: () => statsApi.getStrengthProgression(exerciseId!),
    enabled: Boolean(exerciseId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch muscle distribution.
 * Optionally accepts startDate / endDate ('YYYY-MM-DD') to filter by date range.
 * When neither is provided the backend defaults to the last 30 days.
 */
export function useMuscleDistribution(startDate?: string, endDate?: string) {
  return useQuery<MuscleDistributionResponse>({
    queryKey: ['stats', 'muscle-distribution', startDate ?? 'default', endDate ?? 'default'],
    queryFn: () => statsApi.getMuscleDistribution(startDate, endDate),
    staleTime: 1000 * 60 * 5,
  });
}
