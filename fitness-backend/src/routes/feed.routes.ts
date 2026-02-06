import { Router } from 'express';
import { feedController } from '../controllers/feed.controller';
import { authenticate, validate } from '../middleware';
import { createPostSchema, addCommentSchema } from '../schemas/feed.schema';

const router = Router();

// Auth required
router.use(authenticate);

// Reads
router.get('/', feedController.getGlobalFeed as any);
router.get('/following', feedController.getMyFeed as any);
router.get('/posts/:id/comments', feedController.getComments as any);

// Writes
router.post('/posts', validate(createPostSchema), feedController.createPost as any);
router.post('/posts/:id/like', feedController.toggleLike as any);
router.post('/posts/:id/comments', validate(addCommentSchema), feedController.addComment as any);
router.delete('/comments/:id', feedController.deleteComment as any);

export const feedRoutes = router;
