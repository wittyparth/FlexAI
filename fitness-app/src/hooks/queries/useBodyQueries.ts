import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BodyApi, DateRangeParams, LogWeightRequest, LogPhotoRequest, LogMeasurementRequest } from '../../api/body.api';

// ==========================================
// Query Keys
// ==========================================
export const BODY_KEYS = {
  all: ['body'] as const,
  weight: (params?: DateRangeParams) => [...BODY_KEYS.all, 'weight', params] as const,
  measurements: (params?: DateRangeParams) => [...BODY_KEYS.all, 'measurements', params] as const,
  photos: (params?: DateRangeParams) => [...BODY_KEYS.all, 'photos', params] as const,
};

// ==========================================
// Hooks
// ==========================================

/**
 * Hook to fetch weight history
 */
export function useWeightHistory(params?: DateRangeParams) {
  return useQuery({
    queryKey: BODY_KEYS.weight(params),
    queryFn: () => BodyApi.getWeightHistory(params),
  });
}

/**
 * Hook to fetch measurement history
 */
export function useMeasurementHistory(params?: DateRangeParams) {
  return useQuery({
    queryKey: BODY_KEYS.measurements(params),
    queryFn: () => BodyApi.getMeasurementHistory(params),
  });
}

/**
 * Hook to fetch progress photos
 */
export function useProgressPhotos(params?: DateRangeParams) {
  return useQuery({
    queryKey: BODY_KEYS.photos(params),
    queryFn: () => BodyApi.getPhotos(params),
  });
}

// ==========================================
// Mutations
// ==========================================

/**
 * Mutation to log weight
 */
export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LogWeightRequest) => BodyApi.logWeight(data),
    onSuccess: () => {
      // Invalidate weight history to trigger refetch
      queryClient.invalidateQueries({ queryKey: BODY_KEYS.weight() });
    },
  });
}

/**
 * Mutation to log measurements
 */
export function useLogMeasurements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LogMeasurementRequest) => BodyApi.logMeasurements(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BODY_KEYS.measurements() });
    },
  });
}

/**
 * Mutation to log progress photo
 */
export function useLogProgressPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LogPhotoRequest) => BodyApi.logProgressPhoto(data),
    onSuccess: () => {
      // Invalidate photos list to trigger refetch
      queryClient.invalidateQueries({ queryKey: BODY_KEYS.photos() });
    },
  });
}
