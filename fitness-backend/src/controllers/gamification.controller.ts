import { Response, Request } from 'express';
import { prisma } from '../config/database';

import { UnauthorizedError, NotFoundError } from '../utils/errors';

export class GamificationController {
  
  /**
   * Get user's gamification stats (XP, level, streak)
   */
  async getStats(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) {
        throw new UnauthorizedError();
    }

    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastWorkoutDate: true,
      }
    });

    if (!stats) throw new NotFoundError('User stats');

    // Calculate progress to next level
    // Next level XP = (Level)^2 * 100
    const currentLevelBaseXp = Math.pow(stats.level - 1, 2) * 100;
    const nextLevelXp = Math.pow(stats.level, 2) * 100;
    const progress = stats.xp - currentLevelBaseXp;
    const needed = nextLevelXp - currentLevelBaseXp;
    
    // Handle edge case for level 1
    const safeNeeded = needed > 0 ? needed : 100;
    const percentage = Math.min(100, Math.max(0, (progress / safeNeeded) * 100));

    res.json({
      ...stats,
      nextLevelXp,
      levelProgress: Math.round(percentage),
    });
  }

  /**
   * Get all achievements with unlock status
   */
  async getAchievements(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) {
        throw new UnauthorizedError();
    }

    const allAchievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: userId },
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    const result = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt || null,
    }));

    res.json(result);
  }
}

export const gamificationController = new GamificationController();
