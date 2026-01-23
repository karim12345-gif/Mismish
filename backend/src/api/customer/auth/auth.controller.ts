import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import prisma from '../../../prismaClient';
import { 
  LoginUserBody, 
  RegisterUserBody, 
  ResendOTPBody, 
  VerifyOTPBody,
  RefreshTokenBody,
  LogoutBody,
  ChangePasswordBody
} from './types';
import { generateOTP, maskPhoneNumber, sendOTP } from '../../shared/utils';
import {
  generateAccessToken,
  generateRefreshToken,
  createRefreshTokenRecord,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../../shared/utils';


/**
 * Step 1: Register a new user
 * Creates account but does NOT return JWT token
 */
export const registerUser = async (req: Request<{}, {}, RegisterUserBody>, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password, name, latitude, longitude, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });

    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'Phone number already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        name,
        latitude,
        longitude,
        address,
        isVerified: false,
      },
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Account created successfully. Please login to verify your phone number.' 
    });
  } catch (error) {
    console.error('Register User Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Step 2: Login and send OTP
 * Verifies credentials and sends OTP to phone
 */
export const loginUser = async (req: Request<{}, {}, LoginUserBody>, res: Response): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await prisma.user.update({
      where: { phoneNumber },
      data: {
        otp,
        otpExpiresAt,
        otpResendCount: 0, // Reset resend count on new login
        lastOtpSentAt: new Date(),
      },
    });

    // Send OTP via SMS
    await sendOTP(phoneNumber, otp);

    res.status(200).json({ 
      status: 'success', 
      message: `OTP sent to ${maskPhoneNumber(phoneNumber)}. Valid for 5 minutes.` 
    });
  } catch (error) {
    console.error('Login User Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Step 3: Verify OTP and return JWT tokens
 */
export const verifyOTP = async (req: Request<{}, {}, VerifyOTPBody>, res: Response): Promise<void> => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (!user.otp || !user.otpExpiresAt) {
      res.status(400).json({ status: 'error', message: 'No OTP requested. Please login first.' });
      return;
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiresAt) {
      res.status(400).json({ status: 'error', message: 'OTP expired. Please request a new one.' });
      return;
    }

    // Verify OTP
    if (user.otp !== otp) {
      res.status(400).json({ status: 'error', message: 'Invalid OTP' });
      return;
    }

    // Mark user as verified and clear OTP
    await prisma.user.update({
      where: { phoneNumber },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
        otpResendCount: 0,
      },
    });

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id, 'user');
    const refreshToken = generateRefreshToken();

    // Get device info and IP from request
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;

    // Store refresh token in database
    await createRefreshTokenRecord(user.id, refreshToken, deviceInfo, ipAddress);

    res.status(200).json({ 
      status: 'success', 
      data: { 
        accessToken,
        refreshToken,
        user: { 
          id: user.id, 
          phoneNumber: user.phoneNumber, 
          name: user.name,
          isVerified: true,
        } 
      } 
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Resend OTP (max 2 times)
 */
export const resendOTP = async (req: Request<{}, {}, ResendOTPBody>, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Check resend limit
    if (user.otpResendCount >= 2) {
      res.status(429).json({ 
        status: 'error', 
        message: 'Maximum OTP resend attempts reached. Please login again.' 
      });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update OTP and increment resend count
    await prisma.user.update({
      where: { phoneNumber },
      data: {
        otp,
        otpExpiresAt,
        otpResendCount: user.otpResendCount + 1,
        lastOtpSentAt: new Date(),
      },
    });

    // Send OTP via SMS
    await sendOTP(phoneNumber, otp);

    res.status(200).json({ 
      status: 'success', 
      message: `OTP resent to ${maskPhoneNumber(phoneNumber)}. ${2 - user.otpResendCount} attempts remaining.` 
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (req: Request<{}, {}, RefreshTokenBody>, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ status: 'error', message: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(userId, 'user');

    res.status(200).json({ 
      status: 'success', 
      data: { accessToken } 
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Logout - revoke refresh token
 */
export const logout = async (req: Request<{}, {}, LogoutBody>, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ status: 'error', message: 'Refresh token is required' });
      return;
    }

    // Revoke the refresh token
    const revoked = await revokeRefreshToken(refreshToken);

    if (!revoked) {
      res.status(400).json({ status: 'error', message: 'Failed to logout' });
      return;
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Change password - invalidates all refresh tokens
 */
export const changePassword = async (req: Request<{}, {}, ChangePasswordBody>, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set passwordChangedAt timestamp
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Revoke all refresh tokens for this user
    await revokeAllUserTokens(userId);

    res.status(200).json({ 
      status: 'success', 
      message: 'Password changed successfully. Please login again with your new password.' 
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
