import * as admin from 'firebase-admin';
import { prisma } from '../config/database';
import { logger } from '../utils';
import { NotFoundError, ForbiddenError } from '../utils/errors';

// Initialize Firebase Admin (lazy initialization recommended in production)
// Check if app is already initialized to avoid errors
if (!admin.apps.length) {
  try {
    // In production, use environment variables or a service account key file
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : undefined;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('Firebase Admin initialized successfully');
    } else {
        // Fallback for dev without creds - mock mode or warning
        logger.warn('FIREBASE_SERVICE_ACCOUNT not found. Push notifications will be mocked.');
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
  }
}

export class NotificationService {
  
  /**
   * Register a device token for a user
   */
  async registerDevice(userId: number, token: string, platform: 'android' | 'ios' | 'web' = 'android') {
    try {
      await prisma.deviceToken.upsert({
        where: { token },
        update: { userId, updatedAt: new Date() },
        create: { userId, token, platform },
      });
    } catch (error) {
        logger.error(`Error registering device token for user ${userId}:`, error);
        throw error;
    }
  }

  /**
   * Send a push notification to a user
   */
  async sendPushNotification(userId: number, title: string, body: string, data?: Record<string, string>) {
    try {
      // 1. Create in-app notification record
      await prisma.notification.create({
        data: {
          userId,
          title,
          body,
          type: 'system', // Default type, can be enhanced
          data: data || {},
        }
      });

      // 2. Fetch device tokens
      const devices = await prisma.deviceToken.findMany({
        where: { userId },
        select: { token: true }
      });

      if (devices.length === 0) {
        logger.info(`No devices found for user ${userId}. Notification saved to DB only.`);
        return;
      }

      const tokens = devices.map((d: { token: string }) => d.token);

      // 3. Send via FCM if initialized
      if (admin.apps.length) {
        const message = {
          tokens,
          notification: {
            title,
            body,
          },
          data: data,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        
        // Handle invalid tokens (cleanup)
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp: { success: boolean }, idx: number) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            
            if (failedTokens.length > 0) {
                await prisma.deviceToken.deleteMany({
                    where: { token: { in: failedTokens } }
                });
                logger.info(`Removed ${failedTokens.length} invalid device tokens.`);
            }
        }
        logger.info(`Push notification sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed.`);
      } else {
          logger.info(`[MOCK] Push Notification to User ${userId}: ${title} - ${body}`);
      }

    } catch (error) {
      logger.error(`Error sending push notification to user ${userId}:`, error);
      // Don't throw, failing to send push shouldn't break the caller
    }
  }

  /**
   * Get user's notification history
   */
  async getNotifications(userId: number, limit = 20, offset = 0, unreadOnly = false) {
      const where: any = { userId };
      if (unreadOnly) {
          where.isRead = false;
      }
      return prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
      });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: number, notificationId: number) {
      const notification = await prisma.notification.findUnique({
          where: { id: notificationId }
      });

      if (!notification) {
          throw new NotFoundError('Notification');
      }

      if (notification.userId !== userId) {
          throw new ForbiddenError('This notification belongs to another user');
      }

      await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true }
      });
  }

  /**
   * Mark all notifications as read
   */
    async markAllAsRead(userId: number) {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
}

export const notificationService = new NotificationService();
