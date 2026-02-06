import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils';

/**
 * Service for handling social interactions (following/followers)
 */
export class SocialService {
  /**
   * Follow a user
   */
  async followUser(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself');
    }

    // Check if user to follow exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId }
    });

    if (!userToFollow) {
      throw new NotFoundError('User not found');
    }

    // Check if already following
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existingFollow) {
      // Already following
      return existingFollow;
    }

    // Create follow relationship
    const follow = await prisma.follower.create({
      data: {
        followerId,
        followingId
      }
    });

    logger.info(`User ${followerId} is now following User ${followingId}`);
    return follow;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: number, followingId: number) {
    // Check if relationship exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (!existingFollow) {
      throw new BadRequestError('You are not following this user');
    }

    // Delete follow relationship
    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    logger.info(`User ${followerId} unfollowed User ${followingId}`);
    return { success: true };
  }

  /**
   * Get list of followers for a user
   */
  async getFollowers(userId: number, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follower.findMany({
        where: { followingId: userId }, // People who follow me
        skip,
        take: limit,
        include: {
          follower: { // The person following me
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              level: true,
              xp: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follower.count({ where: { followingId: userId } })
    ]);

    return {
      followers: followers.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get list of users a user is following
   */
  async getFollowing(userId: number, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follower.findMany({
        where: { followerId: userId }, // People I follow
        skip,
        take: limit,
        include: {
          following: { // The person I am following
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              level: true,
              xp: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.follower.count({ where: { followerId: userId } })
    ]);

    return {
      following: following.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Check if user A is following user B
   */
  async getFollowStatus(followerId: number, followingId: number) {
    const follow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    return { isFollowing: !!follow };
  }
}

export const socialService = new SocialService();
