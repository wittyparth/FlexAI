import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils';

export class GamificationService {
  private static readonly XP_RATES = {
    WORKOUT_COMPLETE: 100,
    POST_SHARED: 20,
    SOCIAL_FOLLOW: 10,
    CHALLENGE_JOINED: 50,
    CHALLENGE_COMPLETED: 500,
    GOAL_ACHIEVED: 200,
  };

  /**
   * Process a user action to award XP and check achievements
   */
  async processAction(userId: number, actionType: keyof typeof GamificationService.XP_RATES) {
    try {
      const xpAmount = GamificationService.XP_RATES[actionType];
      if (!xpAmount) {
        logger.warn(`Unknown action type: ${actionType}`);
        return;
      }

      await this.addXp(userId, xpAmount);
      await this.checkAchievements(userId, actionType);
    } catch (error) {
      logger.error(`Error processing gamification action for user ${userId}:`, error);
      // Don't throw, gamification errors shouldn't block main flow
    }
  }

  /**
   * Add XP to user and handle level up
   */
  async addXp(userId: number, amount: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const newXp = user.xp + amount;
    const newLevel = this.calculateLevel(newXp);

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    if (newLevel > user.level) {
      // TODO: Send level up notification
      logger.info(`User ${userId} leveled up to ${newLevel}!`);
    }
  }

  /**
   * Update user streak based on activity
   */
  async updateStreak(userId: number, date: Date = new Date()) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const lastWorkoutDate = user.lastWorkoutDate;
    const today = new Date(date).setHours(0, 0, 0, 0);
    const lastDate = lastWorkoutDate ? new Date(lastWorkoutDate).setHours(0, 0, 0, 0) : null;

    let newStreak = user.currentStreak;

    if (!lastDate) {
      newStreak = 1; // First ever workout
    } else if (today === lastDate) {
      return; // Already logged today
    } else if (today - lastDate === 86400000) {
      newStreak += 1; // Consecutive day
    } else {
      newStreak = 1; // Streak broken
    }

    const longestStreak = Math.max(newStreak, user.longestStreak);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: longestStreak,
        lastWorkoutDate: date,
      },
    });
  }

  /**
   * Calculate level based on XP
   * Formula: Level = floor(sqrt(XP) / 10) + 1
   * Example: 100XP = Lvl 2, 400XP = Lvl 3, 900XP = Lvl 4
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp) / 10) + 1;
  }

  /**
   * Check if action unlocks any achievements
   */
  private async checkAchievements(userId: number, actionType: string) {
    // Placeholder for achievement logic
    // We log it to avoid unused variable error for now
    logger.info(`Checking achievements for user ${userId} on action ${actionType}`);
  }
}

export const gamificationService = new GamificationService();
