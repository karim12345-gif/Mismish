import { AppError } from "../../../shared/lib/AppError";

export const OTP_REQUEST_COOLDOWN_MS = 60_000;

type OtpRequestState = {
  otpExpiresAt: Date | null;
  lastOtpSentAt: Date | null;
};

export const isOtpActive = (
  expiresAt: Date | null,
  now = new Date(),
): boolean => Boolean(expiresAt && expiresAt.getTime() > now.getTime());

export const otpCooldownRemainingMs = (
  lastSentAt: Date | null,
  now = new Date(),
): number =>
  lastSentAt
    ? Math.max(0, OTP_REQUEST_COOLDOWN_MS - (now.getTime() - lastSentAt.getTime()))
    : 0;

export const assertInitialOtpRequestAllowed = (
  state: OtpRequestState | null,
  now = new Date(),
): void => {
  if (!state) return;

  const remainingMs = otpCooldownRemainingMs(state.lastOtpSentAt, now);
  if (remainingMs > 0) {
    throw new AppError(
      429,
      `Please wait ${Math.ceil(remainingMs / 1000)} seconds before requesting another code.`,
      "otp_cooldown_active",
    );
  }

  if (isOtpActive(state.otpExpiresAt, now)) {
    throw new AppError(
      429,
      "A verification code is already active. Use resend if you need a replacement.",
      "otp_already_active",
    );
  }
};

export const assertOtpResendAllowed = (
  state: OtpRequestState,
  now = new Date(),
): void => {
  const remainingMs = otpCooldownRemainingMs(state.lastOtpSentAt, now);
  if (remainingMs > 0) {
    throw new AppError(
      429,
      `Please wait ${Math.ceil(remainingMs / 1000)} seconds before resending the code.`,
      "otp_cooldown_active",
    );
  }
};
