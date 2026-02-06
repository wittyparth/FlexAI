import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/register-device', (req, res, next) => notificationController.registerDevice(req, res).catch(next));
router.get('/', (req, res, next) => notificationController.getNotifications(req, res).catch(next));
router.patch('/:id/read', (req, res, next) => notificationController.markRead(req, res).catch(next));
router.patch('/read-all', (req, res, next) => notificationController.markAllRead(req, res).catch(next));

export default router;
