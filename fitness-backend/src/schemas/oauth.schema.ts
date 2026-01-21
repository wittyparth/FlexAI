import { z } from 'zod';

// =============================================================================
// GOOGLE AUTH
// =============================================================================

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
