import apiClient from './client';

// ==========================================
// Types
// ==========================================

export interface LogWeightRequest {
  weight: number;
  date?: string; // ISO Date string
}

export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  date: string;
  createdAt: string;
}

export interface BodyMeasurements {
  neck?: number;
  shoulders?: number;
  chest?: number;
  leftBicep?: number;
  rightBicep?: number;
  leftForearm?: number;
  rightForearm?: number;
  waist?: number;
  hips?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
}

export interface LogMeasurementRequest extends BodyMeasurements {
  date?: string;
}

export interface MeasurementEntry {
  id: string;
  userId: string;
  date: string;
  measurements: BodyMeasurements; // JSONB in backend
  createdAt: string;
}

export interface LogPhotoRequest {
  photoUrl: string;
  type: 'front' | 'side' | 'back';
  date?: string;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  url: string;
  type: 'front' | 'side' | 'back';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// ==========================================
// API Client
// ==========================================

export const BodyApi = {
  /**
   * Log user weight
   */
  logWeight: async (data: LogWeightRequest): Promise<WeightEntry> => {
    const response = await apiClient.post<{ data: WeightEntry }>('/body/weight', data);
    return response.data.data;
  },

  /**
   * Get weight history
   */
  getWeightHistory: async (params?: DateRangeParams): Promise<WeightEntry[]> => {
    const response = await apiClient.get<{ data: WeightEntry[] }>('/body/weight-history', {
      params,
    });
    return response.data.data;
  },

  /**
   * Log body measurements
   */
  logMeasurements: async (data: LogMeasurementRequest): Promise<MeasurementEntry> => {
    const response = await apiClient.post<{ data: MeasurementEntry }>('/body/measurements', data);
    return response.data.data;
  },

  /**
   * Get measurement history
   */
  getMeasurementHistory: async (params?: DateRangeParams): Promise<MeasurementEntry[]> => {
    const response = await apiClient.get<{ data: MeasurementEntry[] }>('/body/measurements-history', {
      params,
    });
    return response.data.data;
  },

  /**
   * Log a progress photo
   */
  logProgressPhoto: async (data: LogPhotoRequest): Promise<ProgressPhoto> => {
    const response = await apiClient.post<{ data: ProgressPhoto }>('/body/photos', data);
    return response.data.data;
  },

  /**
   * Get progress photos
   */
  getPhotos: async (params?: DateRangeParams): Promise<ProgressPhoto[]> => {
    const response = await apiClient.get<{ data: ProgressPhoto[] }>('/body/photos', {
      params,
    });
    return response.data.data;
  },
};
