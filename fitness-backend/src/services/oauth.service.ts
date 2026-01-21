import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { generateTokenPair } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET
);

export interface GoogleTokenPayload {
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string; // Google user ID
}

/**
 * OAuth Service - handles OAuth2 authentication flows
 */
export const oauthService = {
  /**
   * Verify Google ID token and authenticate/register user
   */
  async googleAuth(idToken: string) {
    let payload: GoogleTokenPayload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });
      
      const ticketPayload = ticket.getPayload();
      if (!ticketPayload) {
        throw new UnauthorizedError('Invalid Google token');
      }
      
      payload = ticketPayload as GoogleTokenPayload;
    } catch (error) {
      logger.error('Google token verification failed', { error });
      throw new UnauthorizedError('Invalid Google token');
    }

    if (!payload.email) {
      throw new BadRequestError('Email not provided by Google');
    }

    if (!payload.email_verified) {
      throw new BadRequestError('Google email not verified');
    }

    // Check if user exists with this Google ID
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: payload.sub },
          { email: payload.email.toLowerCase() },
        ],
      },
    });

    if (user) {
      // Update Google ID if not set (user registered with email, now linking Google)
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            emailVerified: true, // Google verified
            avatarUrl: user.avatarUrl || payload.picture,
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
      }
    } else {
      // Create new user from Google profile
      user = await prisma.user.create({
        data: {
          email: payload.email.toLowerCase(),
          googleId: payload.sub,
          firstName: payload.given_name || payload.name?.split(' ')[0],
          lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' '),
          avatarUrl: payload.picture,
          emailVerified: true, // Google verified
          settings: {
            create: {},
          },
        },
      });

      logger.info(`New user created via Google OAuth: ${user.email}`);
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      ...tokens,
    };
  },

  /**
   * Unlink Google account from user
   */
  async unlinkGoogle(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Can only unlink if user has a password set
    if (!user.passwordHash) {
      throw new BadRequestError(
        'Cannot unlink Google account. Please set a password first.'
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { googleId: null },
    });

    return { message: 'Google account unlinked successfully' };
  },
};
