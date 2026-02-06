import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { BadRequestError, NotFoundError } from '../utils/errors';


/**
 * Service for leaderboards and challenges
 */
export class LeaderboardService {
  /**
   * Update a user's score in the leaderboard
   */
  async updateUserScore(userId: number, type: 'strength' | 'volume' | 'consistency' | 'weekly', score: number) {
    const key = `leaderboard:${type}`;
    // Store in Redis Sorted Set
    await redis.zadd(key, score, userId.toString());
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(type: 'strength' | 'volume' | 'consistency' | 'weekly', limit: number = 50) {
    const key = `leaderboard:${type}`;
    
    // Get top users (ID and score)
    const topUsersWithScores = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    
    // Parse Redis result (flat array: [id1, score1, id2, score2, ...])
    const leaderboardData = [];
    for (let i = 0; i < topUsersWithScores.length; i += 2) {
      leaderboardData.push({
        userId: parseInt(topUsersWithScores[i]),
        score: parseFloat(topUsersWithScores[i + 1])
      });
    }

    if (leaderboardData.length === 0) {
       return [];
    }

    // Hydrate with user details
    const userIds = leaderboardData.map(d => d.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        level: true
      }
    });

    // Map details back to order
    return leaderboardData.map((entry, index) => {
      const user = users.find(u => u.id === entry.userId);
      return {
        rank: index + 1,
        score: entry.score,
        user: user || { id: entry.userId, firstName: 'Unknown', lastName: 'User' }
      };
    });
  }

  /**
   * Create a challenge
   */
  async createChallenge(data: any) {
    return prisma.challenge.create({
      data
    });
  }

  /**
   * Join a challenge
   */
  async joinChallenge(userId: number, challengeId: number) {
    // Check if challenge exists and is active
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }
    if (!challenge.isActive) {
       throw new BadRequestError('Challenge is not active');
    }
    if (new Date() > challenge.endDate) {
       throw new BadRequestError('Challenge has ended');
    }

    // Check existing participation
    const existing = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId
        }
      }
    });

    if (existing) {
      throw new BadRequestError('Already joined this challenge');
    }

    return prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId
      }
    });
  }

  /**
   * Get active challenges
   */
  async getChallenges() {
    return prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { endDate: 'asc' }
    });
  }
}

export const leaderboardService = new LeaderboardService();
