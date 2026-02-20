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
  bodyFat?: number;
  notes?: string;
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
    const response = await apiClient.post<{ data: any }>('/body/weight', data);
    const entry = response.data.data;
    return {
      id: String(entry.id),
      userId: String(entry.userId),
      weight: entry.weight,
      date: entry.date,
      createdAt: entry.createdAt ?? entry.date,
    };
  },

  /**
   * Get weight history
   */
  getWeightHistory: async (params?: DateRangeParams): Promise<WeightEntry[]> => {
    const response = await apiClient.get<{ data: any[] }>('/body/weight-history', {
      params,
    });
    return response.data.data.map((entry) => ({
      id: String(entry.id),
      userId: String(entry.userId),
      weight: entry.weight,
      date: entry.date,
      createdAt: entry.createdAt ?? entry.date,
    }));
  },

  /**
   * Log body measurements
   */
  logMeasurements: async (data: LogMeasurementRequest): Promise<MeasurementEntry> => {
    const payload = {
      neck: data.neck,
      shoulders: data.shoulders,
      chest: data.chest,
      bicepLeft: data.leftBicep,
      bicepRight: data.rightBicep,
      forearmLeft: data.leftForearm,
      forearmRight: data.rightForearm,
      waist: data.waist,
      hips: data.hips,
      thighLeft: data.leftThigh,
      thighRight: data.rightThigh,
      calfLeft: data.leftCalf,
      calfRight: data.rightCalf,
      bodyFatPercentage: data.bodyFat,
      notes: data.notes,
      date: data.date,
    };

    const response = await apiClient.post<{ data: any }>('/body/measurements', payload);
    const entry = response.data.data;
    return {
      id: String(entry.id),
      userId: String(entry.userId),
      date: entry.date,
      createdAt: entry.createdAt ?? entry.date,
      measurements: {
        neck: entry.neck,
        shoulders: entry.shoulders,
        chest: entry.chest,
        leftBicep: entry.leftArm,
        rightBicep: entry.rightArm,
        leftForearm: entry.leftForearm,
        rightForearm: entry.rightForearm,
        waist: entry.waist,
        hips: entry.hips,
        leftThigh: entry.leftThigh,
        rightThigh: entry.rightThigh,
        leftCalf: entry.leftCalf,
        rightCalf: entry.rightCalf,
        bodyFat: entry.bodyFat,
        notes: entry.notes,
      },
    };
  },

  /**
   * Get measurement history
   */
  getMeasurementHistory: async (params?: DateRangeParams): Promise<MeasurementEntry[]> => {
    const response = await apiClient.get<{ data: any[] }>('/body/measurements-history', {
      params,
    });
    return response.data.data.map((entry) => ({
      id: String(entry.id),
      userId: String(entry.userId),
      date: entry.date,
      createdAt: entry.createdAt ?? entry.date,
      measurements: {
        neck: entry.neck,
        shoulders: entry.shoulders,
        chest: entry.chest,
        leftBicep: entry.leftArm,
        rightBicep: entry.rightArm,
        leftForearm: entry.leftForearm,
        rightForearm: entry.rightForearm,
        waist: entry.waist,
        hips: entry.hips,
        leftThigh: entry.leftThigh,
        rightThigh: entry.rightThigh,
        leftCalf: entry.leftCalf,
        rightCalf: entry.rightCalf,
        bodyFat: entry.bodyFat,
        notes: entry.notes,
      },
    }));
  },

  /**
   * Log a progress photo
   */
  logProgressPhoto: async (data: LogPhotoRequest): Promise<ProgressPhoto> => {
    const response = await apiClient.post<{ data: any }>('/body/photos', data);
    const photo = response.data.data;
    return {
      id: String(photo.id),
      userId: String(photo.userId),
      url: photo.url ?? photo.imageUrl,
      type: (photo.type ?? photo.pose ?? 'front') as 'front' | 'side' | 'back',
      date: photo.date,
      notes: photo.notes,
      createdAt: photo.createdAt ?? photo.date,
    };
  },

  /**
   * Get progress photos
   */
  getPhotos: async (params?: DateRangeParams): Promise<ProgressPhoto[]> => {
    const response = await apiClient.get<{ data: any[] }>('/body/photos', {
      params,
    });
    return response.data.data.map((photo) => ({
      id: String(photo.id),
      userId: String(photo.userId),
      url: photo.url ?? photo.imageUrl,
      type: (photo.type ?? photo.pose ?? 'front') as 'front' | 'side' | 'back',
      date: photo.date,
      notes: photo.notes,
      createdAt: photo.createdAt ?? photo.date,
    }));
  },
};
