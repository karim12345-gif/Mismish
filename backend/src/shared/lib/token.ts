import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "./prisma";

const ACCESS_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface AccessTokenPayload {
  id: number;
  type: "user" | "vendor";
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (
  userId: number,
  type: "user" | "vendor" = "user",
): string => {
  return jwt.sign({ id: userId, type }, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (): string =>
  crypto.randomBytes(64).toString("hex");

export const createRefreshTokenRecord = async (
  userId: number,
  token: string,
  deviceInfo?: string,
  ipAddress?: string,
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt, deviceInfo, ipAddress },
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = async (
  token: string,
): Promise<number | null> => {
  try {
    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.isRevoked || new Date() > record.expiresAt)
      return null;
    await prisma.refreshToken.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });
    return record.userId;
  } catch {
    return null;
  }
};

export const isTokenValidAfterPasswordChange = async (
  userId: number,
  tokenIssuedAt: number,
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordChangedAt: true },
    });
    if (!user?.passwordChangedAt) return true;
    return tokenIssuedAt >= Math.floor(user.passwordChangedAt.getTime() / 1000);
  } catch {
    return false;
  }
};

export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
    return true;
  } catch {
    return false;
  }
};

export const revokeAllUserTokens = async (userId: number): Promise<boolean> => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return true;
  } catch {
    return false;
  }
};

export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  } catch {
    return 0;
  }
};

export const getUserActiveSessions = async (userId: number) => {
  try {
    return await prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        createdAt: true,
        lastUsedAt: true,
        deviceInfo: true,
        ipAddress: true,
      },
      orderBy: { lastUsedAt: "desc" },
    });
  } catch {
    return [];
  }
};
