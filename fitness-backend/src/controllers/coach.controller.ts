import { Request, Response } from 'express';
import { coachService } from '../services/ai/CoachService';
import { z } from 'zod';

const sendMessageSchema = z.object({
  message: z.string().min(1),
  conversationId: z.number().optional(),
});

export class CoachController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { message, conversationId } = sendMessageSchema.parse(req.body);

      const result = await coachService.sendMessage(userId, message, conversationId);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({ success: false, errors: error.errors });
        return;
      }
      console.error('Error sending message to coach:', error);
      res.status(500).json({ success: false, error: 'Failed to process message' });
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const conversations = await coachService.getConversations(userId);
      res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ success: false, error: 'Failed to get conversations' });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;
        const conversationId = parseInt(req.params.id);
        if (isNaN(conversationId)) { res.status(400).json({ success: false, error: 'Invalid ID' }); return; }

        // Fetch without userId first to check existence vs ownership
        const conversation = await coachService.getById(conversationId);
        if (!conversation) {
            res.status(404).json({ success: false, error: 'Conversation not found' });
            return;
        }

        if (conversation.userId !== userId) {
            res.status(403).json({ success: false, error: 'Forbidden' });
            return;
        }

        const result = await coachService.getConversation(userId, conversationId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get conversation' });
    }
  }

  async deleteConversation(req: Request, res: Response): Promise<void> {
      try {
          const userId = (req as any).userId;
          const conversationId = parseInt(req.params.id);
          if (isNaN(conversationId)) { res.status(400).json({ success: false, error: 'Invalid ID' }); return; }

          const conversation = await coachService.getById(conversationId);
          if (!conversation) {
              res.status(404).json({ success: false, error: 'Conversation not found' });
              return;
          }

          if (conversation.userId !== userId) {
              res.status(403).json({ success: false, error: 'Forbidden' });
              return;
          }

          await coachService.deleteConversation(userId, conversationId);
          res.status(200).json({ success: true, message: 'Conversation deleted' });
      } catch (error) {
          res.status(500).json({ success: false, error: 'Failed to delete conversation' });
      }
  }
}

export const coachController = new CoachController();
