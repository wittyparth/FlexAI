import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from '../../src/schemas/auth.schema';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should pass with valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with weak password (no uppercase)', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PasswordNo',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should pass with valid credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail without password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('verifyEmailSchema', () => {
    it('should pass with valid OTP', () => {
      const validData = {
        email: 'test@example.com',
        otp: '123456',
      };

      const result = verifyEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with short OTP', () => {
      const invalidData = {
        email: 'test@example.com',
        otp: '12345',
      };

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with long OTP', () => {
      const invalidData = {
        email: 'test@example.com',
        otp: '1234567',
      };

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should pass with valid passwords', () => {
      const validData = {
        currentPassword: 'oldpass',
        newPassword: 'NewPass123',
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if new password is weak', () => {
      const invalidData = {
        currentPassword: 'oldpass',
        newPassword: 'weak',
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should pass with valid data', () => {
      const validData = {
        email: 'test@example.com',
        otp: '123456',
        newPassword: 'NewPassword123',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
