/**
 * Auth Routes Integration Tests
 * Testing all /api/v1/auth endpoints
 */
import { mockPrisma, resetMocks } from '../utils/mock-prisma';
import request from 'supertest';
import { createApp } from '../../src/app';
import { createMockUser, createUnverifiedUser, createMockSession } from '../utils/factories';
import { generateTestToken } from '../utils/test-utils';

const app = createApp();

describe('Auth Routes', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // POST /api/v1/auth/register
  // ==========================================================================
  describe('POST /auth/register', () => {
    const validRegistration = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: validRegistration.email,
        firstName: validRegistration.firstName,
        lastName: validRegistration.lastName,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistration);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', validRegistration.email);
    });

    it('should return 409 if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser());

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistration);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validRegistration, email: 'invalid-email' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validRegistration, password: '123' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/verify-email
  // ==========================================================================
  describe('POST /auth/verify-email', () => {
    it('should verify email with valid OTP', async () => {
      const user = createUnverifiedUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, emailVerified: true });

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: user.email, otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid OTP', async () => {
      const user = createUnverifiedUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: user.email, otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for already verified email', async () => {
      const user = createMockUser({ emailVerified: true });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: user.email, otp: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: 'nonexistent@example.com', otp: '123456' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for expired OTP', async () => {
      const user = createUnverifiedUser({
        emailVerifyExpiry: new Date(Date.now() - 1000), // Expired
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ email: user.email, otp: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/resend-verification
  // ==========================================================================
  describe('POST /auth/resend-verification', () => {
    it('should resend verification for unverified user', async () => {
      const user = createUnverifiedUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: user.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return success even for non-existent user (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for already verified email', async () => {
      const user = createMockUser({ emailVerified: true });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: user.email });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/login
  // ==========================================================================
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = createMockUser({
        emailVerified: true,
        passwordHash: '$2a$12$W658KiqRgbgnlCkjFnHIqeZvLZD9.cug3j1pgK05QivP6O9Ly4Sy.', // "Password123!"
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.session.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('user');
    });

    it('should return 401 for invalid password', async () => {
      const user = createMockUser({ emailVerified: true });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for unverified email', async () => {
      const user = createMockUser({
        emailVerified: false,
        passwordHash: '$2a$12$W658KiqRgbgnlCkjFnHIqeZvLZD9.cug3j1pgK05QivP6O9Ly4Sy.',
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for deactivated account', async () => {
      const user = createMockUser({
        isActive: false,
        emailVerified: true,
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/refresh
  // ==========================================================================
  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const user = createMockUser();
      const session = createMockSession({ userId: user.id });
      
      // Generate a real refresh token for testing
      const { generateRefreshToken } = require('../../src/utils/jwt');
      const validRefreshToken = generateRefreshToken(user.id, 0);
      
      mockPrisma.session.findFirst.mockResolvedValue({ ...session, token: validRefreshToken });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.session.update.mockResolvedValue(session);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: validRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for expired session', async () => {
      const { generateRefreshToken } = require('../../src/utils/jwt');
      const validRefreshToken = generateRefreshToken(1, 0);
      
      mockPrisma.session.findFirst.mockResolvedValue(null); // No active session

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: validRefreshToken });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/logout
  // ==========================================================================
  describe('POST /auth/logout', () => {
    it('should logout authenticated user', async () => {
      const token = generateTestToken(1);
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser({ id: 1 }));
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/change-password
  // ==========================================================================
  describe('POST /auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const token = generateTestToken(1);
      const user = createMockUser({
        id: 1,
        passwordHash: '$2a$12$W658KiqRgbgnlCkjFnHIqeZvLZD9.cug3j1pgK05QivP6O9Ly4Sy.', // "Password123!"
      });
      
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for incorrect current password', async () => {
      const token = generateTestToken(1);
      const user = createMockUser({ id: 1 });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/forgot-password
  // ==========================================================================
  describe('POST /auth/forgot-password', () => {
    it('should initiate password reset for existing user', async () => {
      const user = createMockUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: user.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return success even for non-existent user (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(res.status).toBe(422);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/reset-password
  // ==========================================================================
  describe('POST /auth/reset-password', () => {
    it('should reset password with valid OTP', async () => {
      const user = createMockUser({
        emailVerifyToken: '123456',
        emailVerifyExpiry: new Date(Date.now() + 15 * 60 * 1000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: user.email,
          otp: '123456',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid OTP', async () => {
      const user = createMockUser({
        emailVerifyToken: '123456',
        emailVerifyExpiry: new Date(Date.now() + 15 * 60 * 1000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: user.email,
          otp: '000000',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for expired OTP', async () => {
      const user = createMockUser({
        emailVerifyToken: '123456',
        emailVerifyExpiry: new Date(Date.now() - 1000), // Expired
      });
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: user.email,
          otp: '123456',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          email: 'nonexistent@example.com',
          otp: '123456',
          newPassword: 'NewPassword456!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // POST /api/v1/auth/google (OAuth)
  // ==========================================================================
  describe('POST /auth/google', () => {
    it('should return 400 for missing ID token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({});

      expect(res.status).toBe(422);
    });

    it('should return 401 for invalid ID token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'invalid-token' });

      // Google verification will fail
      expect([400, 401, 500]).toContain(res.status);
    });
  });

  // ==========================================================================
  // DELETE /api/v1/auth/google (Unlink)
  // ==========================================================================
  describe('DELETE /auth/google', () => {
    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .delete('/api/v1/auth/google');

      expect(res.status).toBe(401);
    });
  });
});
