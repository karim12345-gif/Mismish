import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../../../prismaClient';
import { generateOTP, sendOTP, maskPhoneNumber } from '../../shared/utils/sms';

interface RegisterUserBody {
  phoneNumber: string;
  password: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface LoginUserBody {
  phoneNumber: string;
  password: string;
}

interface VerifyOTPBody {
  phoneNumber: string;
  otp: string;
}

interface ResendOTPBody {
  phoneNumber: string;
}

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
 * Step 3: Verify OTP and return JWT token
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

    // Generate JWT token
    const token = jwt.sign({ id: user.id, type: 'user' }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.status(200).json({ 
      status: 'success', 
      data: { 
        token, 
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
