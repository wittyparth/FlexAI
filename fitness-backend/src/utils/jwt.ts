import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

// Token payload types
export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: number;
  type: 'refresh';
  tokenVersion?: number;
}

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

// Token generation options
const accessTokenOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRY as `${number}d` | `${number}h` | `${number}m`,
  issuer: 'fitness-api',
  audience: 'fitness-app',
};

const refreshTokenOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRY as `${number}d` | `${number}h` | `${number}m`,
  issuer: 'fitness-api',
  audience: 'fitness-app',
};

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const tokenPayload: AccessTokenPayload = { ...payload, type: 'access' };
  return jwt.sign(tokenPayload, env.JWT_SECRET, accessTokenOptions);
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: number, tokenVersion = 0): string {
  const payload: RefreshTokenPayload = {
    userId,
    type: 'refresh',
    tokenVersion,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
}

/**
 * Generate both tokens
 */
export function generateTokenPair(
  user: { id: number; email: string; role: string },
  tokenVersion = 0
): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    }),
    refreshToken: generateRefreshToken(user.id, tokenVersion),
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'fitness-api',
      audience: 'fitness-app',
    }) as JwtPayload & AccessTokenPayload;
    
    if (decoded.type !== 'access') {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'fitness-api',
      audience: 'fitness-app',
    }) as JwtPayload & RefreshTokenPayload;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiry (15 minutes from now)
 */
export function getOTPExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000);
}
