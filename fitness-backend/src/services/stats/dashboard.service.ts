import { prisma } from '../../config/database';
import { statsService } from './stats.service';

export class DashboardService {
  /**
   * 3.6 Dashboard Aggregation
   * Returns a summary object for the main dashboard.
   */
  async getDashboardStats(userId: number) {
    const workouts = await prisma.workout.findMany({
        where: { userId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 5
    });

    const [volumeStats, consistency, recovery] = await Promise.all([
        statsService.getVolumeStats(userId, 'week'),
        statsService.getConsistencyStats(userId),
        statsService.getRecoveryStatus(userId)
    ]);

    // Recent Activity Summary
    const recentWorkouts = workouts.map(w => ({
        id: w.id,
        name: w.name || 'Untitled Workout',
        date: w.completedAt,
        volume: w.totalVolume,
        prCount: 0 // Placeholder, could query if we wanted to show specific PR badge
    }));

    return {
        streak: {
            current: consistency.currentStreak,
            best: consistency.heatmap ? (Object.values(consistency.heatmap) as number[]).reduce((a, b) => Math.max(a, b), 0) : 0 // Simplified best streak estimate or fetch from user profile
        },
        weeklyVolume: volumeStats.totalVolume,
        recentWorkouts,
        recoveryStatus: recovery, // "Overall status" could be derived here
        // Quick Actions or "Up Next" could be routine suggestions
    };
  }
}

export const dashboardService = new DashboardService();
