import { Router } from 'express';
import { socialController } from '../controllers/social.controller';
import { authenticate } from '../middleware';

const router = Router();

// Apply auth middleware to all social routes
router.use(authenticate);

// Follow/Unfollow
router.post('/follow/:userId', socialController.followUser as any);
router.delete('/unfollow/:userId', socialController.unfollowUser as any);
router.get('/follow-status/:userId', socialController.getFollowStatus as any);

// Lists
router.get('/followers', socialController.getFollowers as any);
router.get('/following', socialController.getFollowing as any);

export const socialRoutes = router;
