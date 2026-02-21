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
};
