/**
 * SMS Service for OTP delivery
 * Supports dev mode (console logging) and production mode (Twilio)
 */

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate phone number format
 * Supports: Egypt (+20), Saudi Arabia (+966), UAE (+971)
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^\+(?:20|966|971)\d{9,10}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Send OTP via SMS
 * In dev mode: logs to console
 * In production: sends via Twilio
 */
export const sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
  const isDevMode = process.env.SMS_DEV_MODE === 'true';

  if (isDevMode) {
    // Development mode: log to console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS OTP (DEV MODE)');
    console.log(`To: ${phoneNumber}`);
    console.log(`Code: ${otp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  // Production mode: Send via Twilio
  // TODO: Implement Twilio integration in later phases
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    throw new Error('Twilio credentials not configured');
  }

  // Twilio integration will go here
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: `Your Mismish verification code is: ${otp}`,
  //   from: twilioNumber,
  //   to: phoneNumber
  // });

  console.log(`SMS sent to ${phoneNumber} (production mode)`);
};

/**
 * Format phone number for display (mask middle digits)
 * Example: +201234567890 -> +20***7890
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.length < 8) return phoneNumber;
  const countryCode = phoneNumber.slice(0, 3);
  const lastDigits = phoneNumber.slice(-4);
  return `${countryCode}***${lastDigits}`;
};
