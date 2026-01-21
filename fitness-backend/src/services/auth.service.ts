import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import {
  generateTokenPair,
  verifyRefreshToken,
  generateOTP,
  getOTPExpiry,
} from '../utils/jwt';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { logger } from '../utils/logger';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schema';

const SALT_ROUNDS = 12;

/**
 * Auth Service - handles all authentication business logic
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        emailVerifyToken: otp,
        emailVerifyExpiry: otpExpiry,
        settings: {
          create: {}, // Create with defaults
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // TODO: Send verification email with OTP
    logger.info(`📧 Verification OTP for ${user.email}: ${otp}`);

    return {
      user,
      message: 'Registration successful. Please verify your email.',
    };
  },

  /**
   * Verify email with OTP
   */
  async verifyEmail(input: VerifyEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    if (
      !user.emailVerifyToken ||
      !user.emailVerifyExpiry ||
      user.emailVerifyToken !== input.otp
    ) {
      throw new BadRequestError('Invalid OTP');
    }

    if (new Date() > user.emailVerifyExpiry) {
      throw new BadRequestError('OTP has expired. Please request a new one.');
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  },

  /**
   * Resend verification OTP
   */
  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a verification code has been sent.' };
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: otp,
        emailVerifyExpiry: otpExpiry,
      },
    });

    // TODO: Send verification email with OTP
    logger.info(`📧 New verification OTP for ${user.email}: ${otp}`);

    return { message: 'If the email exists, a verification code has been sent.' };
  },

  /**
   * Login user
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new BadRequestError('Please verify your email before logging in');
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        userId: payload.userId,
        token: refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Generate new tokens
    const tokens = generateTokenPair(user);

    // Update session with new refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  },

  /**
   * Logout user
   */
  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      // Invalidate specific session
      await prisma.session.updateMany({
        where: {
          userId,
          token: refreshToken,
        },
        data: { isActive: false },
      });
    } else {
      // Invalidate all sessions
      await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });
    }

    return { message: 'Logged out successfully' };
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: number, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all sessions (force re-login)
    await prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    return { message: 'Password changed successfully. Please log in again.' };
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists
    if (!user) {
      return { message: 'If the email exists, a password reset code has been sent.' };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: otp, // Reusing for password reset
        emailVerifyExpiry: otpExpiry,
      },
    });

    // TODO: Send password reset email with OTP
    logger.info(`📧 Password reset OTP for ${user.email}: ${otp}`);

    return { message: 'If the email exists, a password reset code has been sent.' };
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset code');
    }

    if (
      !user.emailVerifyToken ||
      !user.emailVerifyExpiry ||
      user.emailVerifyToken !== input.otp
    ) {
      throw new BadRequestError('Invalid or expired reset code');
    }

    if (new Date() > user.emailVerifyExpiry) {
      throw new BadRequestError('Reset code has expired. Please request a new one.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    // Invalidate all sessions
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    return { message: 'Password reset successful. Please log in with your new password.' };
  },
};
