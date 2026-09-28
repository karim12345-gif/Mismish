import type { TFunction } from "i18next";

export const OTP_COUNTRY_CODE = "+966";
export const OTP_LENGTH = 4;

export type OtpLanguage = "en" | "ar";

export const createEmptyOtp = (): string[] => Array(OTP_LENGTH).fill("");

export const resolveOtpLanguage = (language?: string): OtpLanguage =>
  language === "ar" ? "ar" : "en";

export const getOtpErrorMessage = (error: any, t: TFunction): string => {
  const code =
    error?.response?.data?.error?.code ?? error?.code ?? error?.nativeErrorCode;

  if (code === "auth/invalid-verification-code" || code === "invalid_otp") {
    return t("auth.otp.errors.invalid_code");
  }
  if (code === "auth/session-expired" || code === "auth/code-expired") {
    return t("auth.otp.errors.expired_code");
  }
  if (code === "auth/too-many-requests") {
    return t("auth.otp.errors.too_many_attempts");
  }
  if (code === "auth/invalid-phone-number") {
    return t("auth.otp.errors.invalid_phone");
  }

  return (
    error?.response?.data?.error?.message ??
    error?.response?.data?.message ??
    t("auth.otp.errors.verification_failed")
  );
};
