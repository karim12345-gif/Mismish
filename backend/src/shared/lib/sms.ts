// Supported: Egypt (+20), Saudi Arabia (+966), UAE (+971)
export const phoneRegex = /^\+(?:20|966|971)\d{9,10}$/;

export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const validatePhoneNumber = (phone: string): boolean =>
  phoneRegex.test(phone);

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
};

export const sendOTP = async (
  phoneNumber: string,
  otp: string,
): Promise<void> => {
  if (process.env.SMS_DEV_MODE === "true") {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 SMS OTP (DEV MODE)");
    console.log(`To:   ${phoneNumber}`);
    console.log(`Code: ${otp}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    throw new Error("Twilio credentials not configured");
  }

  // TODO: Twilio integration
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({ body: `Your Mismish code: ${otp}`, from: twilioNumber, to: phoneNumber });
};
