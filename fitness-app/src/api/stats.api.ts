import apiClient from './client';

export interface DashboardStatsResponse {
    streak: {
        current: number;
        best: number;
    };
    weeklyVolume: number;
    recentWorkouts: Array<{
        id: string; // Changed from number to string to match other APIs
        name: string;
        date: string;
        volume: number;
        prCount: number;
    }>;
    recoveryStatus: {
        [key: string]: {
            status: string;
            freshness: number;
        };
    };
}

export type VolumeTimeframe = 'week' | 'month' | 'year';

export interface VolumeTrendPoint {
    date: string;
    volume: number;
}

export interface VolumeStatsResponse {
    totalVolume: number;
    trend: VolumeTrendPoint[];
    workoutCount: number;
}

export type PersonalRecordType = 'max_weight' | 'max_reps' | 'max_volume' | 'estimated_1rm';

export interface PersonalRecordResponse {
    id: number;
    userId: number;
    exerciseId: number;
    recordType: PersonalRecordType;
    value: number;
    reps?: number | null;
    bodyWeight?: number | null;
    workoutId?: number | null;
    setId?: number | null;
    date: string;
    exercise?: {
        name: string;
    };
}

export interface MuscleDistributionResponse {
    muscleSets: Record<string, number>;
    imbalances: {
        pushRatio: number;
        pullRatio: number;
        alert?: string | null;
    };
}

export const statsApi = {
    /**
     * Get aggregated dashboard statistics
     */
    getDashboardStats: async (): Promise<DashboardStatsResponse> => {
        const response = await apiClient.get<{ data: DashboardStatsResponse }>('/stats/dashboard');
        return response.data.data;
    },

    /**
     * Get consistency heatmap data specifically
     */
    getConsistencyHeatmap: async (): Promise<number[][]> => {
        const response = await apiClient.get<{ data: number[][] }>('/stats/consistency');
        return response.data.data;
    },

    /**
     * Get volume stats for a given timeframe
     */
    getVolumeStats: async (timeframe: VolumeTimeframe): Promise<VolumeStatsResponse> => {
        const response = await apiClient.get<{ data: VolumeStatsResponse }>('/stats/volume', {
            params: { timeframe },
        });
        return response.data.data;
    },

    /**
     * Get personal records. Optionally filter by exercise.
     */
    getPersonalRecords: async (exerciseId?: number): Promise<PersonalRecordResponse[]> => {
        const response = await apiClient.get<{ data: PersonalRecordResponse[] }>('/stats/prs', {
            params: exerciseId ? { exerciseId } : undefined,
        });
        return response.data.data;
    },

    /**
     * Get strength progression records for one exercise.
     */
    getStrengthProgression: async (exerciseId: number): Promise<PersonalRecordResponse[]> => {
        const response = await apiClient.get<{ data: PersonalRecordResponse[] }>(`/stats/strength-progression/${exerciseId}`);
        return response.data.data;
    },

    /**
     * Get muscle distribution and imbalance analysis.
     * Pass optional startDate / endDate ('YYYY-MM-DD') to filter by date range.
     */
    getMuscleDistribution: async (startDate?: string, endDate?: string): Promise<MuscleDistributionResponse> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await apiClient.get<{ data: MuscleDistributionResponse }>('/stats/muscle-distribution', {
            params: Object.keys(params).length ? params : undefined,
        });
        return response.data.data;
    },
};
