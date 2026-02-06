import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  workoutId: z.number().int().positive().optional(),
  visibility: z.enum(['public', 'friends', 'private']).optional(),
}).refine(data => data.content || data.workoutId, {
  message: 'Content or workout is required',
  path: ['content'],
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});
