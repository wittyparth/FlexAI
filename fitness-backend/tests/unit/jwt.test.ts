import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  getOTPExpiry,
} from '../../src/utils/jwt';

describe('JWT Utils', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser.id);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(mockUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      const payload = verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
      expect(payload?.type).toBe('access');
    });

    it('should return null for an invalid token', () => {
      const payload = verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for a refresh token', () => {
      const refreshToken = generateRefreshToken(mockUser.id);
      const payload = verifyAccessToken(refreshToken);
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockUser.id, 0);
      const payload = verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.type).toBe('refresh');
    });

    it('should return null for an access token', () => {
      const accessToken = generateAccessToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      const payload = verifyRefreshToken(accessToken);
      expect(payload).toBeNull();
    });
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();

      expect(otp).toBeDefined();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on each call', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();

      // Very unlikely to be the same
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('getOTPExpiry', () => {
    it('should return a date 15 minutes in the future', () => {
      const now = Date.now();
      const expiry = getOTPExpiry();

      const expectedExpiry = now + 15 * 60 * 1000;
      const actualExpiry = expiry.getTime();

      // Allow 1 second tolerance
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });
});
