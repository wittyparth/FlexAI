import { Router } from 'express';
import { coachController } from '../controllers/coach.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/message', (req, res) => coachController.sendMessage(req, res));
router.get('/conversations', (req, res) => coachController.getConversations(req, res));
router.get('/conversations/:id', (req, res) => coachController.getConversation(req, res));
router.delete('/conversations/:id', (req, res) => coachController.deleteConversation(req, res));

export default router;
