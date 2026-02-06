import { Response, Request } from 'express';
import { notificationService } from '../services/notification.service';

import { UnauthorizedError, BadRequestError, ValidationError } from '../utils/errors';
import { z } from 'zod';

export class NotificationController {
  
  /**
   * Register a device token
   */
  async registerDevice(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) throw new UnauthorizedError();

    const schema = z.object({
      deviceToken: z.string().min(1),
      platform: z.enum(['android', 'ios', 'web']).optional().default('android'),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error);
    }

    await notificationService.registerDevice(
      userId,
      validation.data.deviceToken,
      validation.data.platform
    );

    res.status(200).json({ success: true, message: 'Device registered successfully' });
  }

  /**
   * Get notification history
   */
  async getNotifications(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) throw new UnauthorizedError();

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await notificationService.getNotifications(userId, limit, offset, unreadOnly);
    res.json({ success: true, data: notifications });
  }

  /**
   * Mark notification as read
   */
  async markRead(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) throw new UnauthorizedError();

    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
        throw new BadRequestError('Invalid notification ID');
    }

    await notificationService.markAsRead(userId, notificationId);
    res.json({ success: true, message: 'Notification marked as read' });
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(req: Request, res: Response) {
      const userId = (req as any).userId;
      if (!userId) throw new UnauthorizedError();

      await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
  }
}

export const notificationController = new NotificationController();
