import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils';

interface CreatePostDTO {
  userId: number;
  content: string;
  imageUrl?: string;
  workoutId?: number;
  visibility?: 'public' | 'friends' | 'private';
}

/**
 * Service for handling activity feed (posts, likes, comments)
 */
export class FeedService {
  /**
   * Create a new post
   */
  async createPost(data: CreatePostDTO) {
    const post = await prisma.post.create({
      data: {
        userId: data.userId,
        content: data.content,
        imageUrl: data.imageUrl,
        workoutId: data.workoutId,
        visibility: data.visibility || 'public'
      },
      include: {
        user: {
          select: {
             id: true,
             firstName: true,
             lastName: true,
             avatarUrl: true
          }
        },
        workout: {
          select: {
             id: true,
             name: true,
             exercises: {
               take: 3,
               include: { exercise: true }
             }
          }
        }
      }
    });

    logger.info(`User ${data.userId} created post ${post.id}`);
    return post;
  }

  /**
   * Get global feed (all public posts)
   */
  async getGlobalFeed(options: { cursor?: number; limit?: number } = {}) {
    const { cursor, limit = 20 } = options;

    const posts = await prisma.post.findMany({
      take: limit + 1, // Fetch one extra to check for next cursor
      skip: cursor ? 1 : 0, // Skip the cursor itself if provided
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        visibility: 'public'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
             id: true,
             firstName: true,
             lastName: true,
             avatarUrl: true
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    let nextCursor: number | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop(); // Remove the extra item
      nextCursor = nextItem?.id;
    }

    return {
      posts,
      nextCursor
    };
  }

  /**
   * Get user's personalized feed (following + self)
   */
  async getUserFeed(userId: number, options: { cursor?: number; limit?: number } = {}) {
    const { cursor, limit = 20 } = options;

    // Get IDs of people user follows
    const following = await prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    // Include user's own ID
    followingIds.push(userId);

    const posts = await prisma.post.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        OR: [
          // Public posts from people I follow
          {
            userId: { in: followingIds },
            visibility: 'public'
          },
          // details visible only to friends (assuming follow = friends for simplicity in this MVP logic or explicit)
           {
            userId: { in: followingIds },
            visibility: 'friends' // In a real app we'd strict check friendship
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
             id: true,
             firstName: true,
             lastName: true,
             avatarUrl: true
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    let nextCursor: number | undefined = undefined;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem?.id;
    }

    return {
      posts,
      nextCursor
    };
  }

  /**
   * Like a post
   */
  async likePost(userId: number, postId: number) {
    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    if (existingLike) {
      // Unlike if already liked
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });
      
      // Decrement count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });

      return { liked: false };
    } else {
      // Create like
      await prisma.like.create({
        data: {
          postId,
          userId
        }
      });

      // Increment count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });

      return { liked: true };
    }
  }

  /**
   * Add a comment
   */
  async addComment(userId: number, postId: number, content: string) {
    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Increment count
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    return comment;
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number, options: { page?: number; limit?: number } = {}) {
     const { page = 1, limit = 20 } = options;
     const skip = (page - 1) * limit;

     const comments = await prisma.comment.findMany({
       where: { postId },
       skip,
       take: limit,
       orderBy: { createdAt: 'asc' }, // Oldest first typically for comments
       include: {
         user: {
           select: {
             id: true,
             firstName: true,
             lastName: true,
             avatarUrl: true
           }
         }
       }
     });

     return comments;
  }

  /**
   * Delete a comment
   */
  async deleteComment(userId: number, commentId: number) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.userId !== userId) {
      const { ForbiddenError } = await import('../utils/errors');
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    // Decrement count on post
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } }
    });

    return { success: true };
  }
}

export const feedService = new FeedService();
