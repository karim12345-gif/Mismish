import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../prismaClient';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

export interface AccessTokenPayload {
  id: number;
  type: 'user' | 'vendor';
  iat?: number;
  exp?: number;
}

/**
 * Generate a short-lived JWT access token
 */
export const generateAccessToken = (userId: number, type: 'user' | 'vendor' = 'user'): string => {
  const payload: AccessTokenPayload = {
    id: userId,
    type,
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate a cryptographically secure refresh token
 */
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Store refresh token in database
 */
export const createRefreshTokenRecord = async (
  userId: number,
  token: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
    },
  });
};

/**
 * Verify and decode JWT access token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AccessTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token from database
 * Returns userId if valid, null otherwise
 */
export const verifyRefreshToken = async (token: string): Promise<number | null> => {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    // Check if token is revoked
    if (refreshToken.isRevoked) {
      return null;
    }

    // Check if token is expired
    if (new Date() > refreshToken.expiresAt) {
      return null;
    }

    // Update last used timestamp
    await prisma.refreshToken.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });

    return refreshToken.userId;
  } catch (error) {
    console.error('Verify Refresh Token Error:', error);
    return null;
  }
};

/**
 * Check if token was issued before password change
 * Returns true if token is still valid, false if invalidated
 */
export const isTokenValidAfterPasswordChange = async (
  userId: number,
  tokenIssuedAt: number
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordChangedAt: true },
    });

    if (!user || !user.passwordChangedAt) {
      return true; // No password change, token is valid
    }

    const passwordChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
    
    // If token was issued before password change, it's invalid
    return tokenIssuedAt >= passwordChangedTimestamp;
  } catch (error) {
    console.error('Token Validation Error:', error);
    return false;
  }
};

/**
 * Revoke a specific refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
    return true;
  } catch (error) {
    console.error('Revoke Token Error:', error);
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user
 * Used when password is changed
 */
export const revokeAllUserTokens = async (userId: number): Promise<boolean> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return true;
  } catch (error) {
    console.error('Revoke All Tokens Error:', error);
    return false;
  }
};

/**
 * Clean up expired tokens (can be run as a cron job)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Cleanup Expired Tokens Error:', error);
    return 0;
  }
};

/**
 * Get all active sessions for a user
 */
export const getUserActiveSessions = async (userId: number) => {
  try {
    return await prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        createdAt: true,
        lastUsedAt: true,
        deviceInfo: true,
        ipAddress: true,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Get Active Sessions Error:', error);
    return [];
  }
};
