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
    }
};
