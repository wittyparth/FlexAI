import { Router } from 'express';
import { gamificationController } from '../controllers/gamification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', (req, res, next) => gamificationController.getStats(req, res).catch(next));
router.get('/achievements', (req, res, next) => gamificationController.getAchievements(req, res).catch(next));

export default router;
