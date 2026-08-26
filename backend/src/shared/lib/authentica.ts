import { AppError } from "./AppError";

const AUTHENTICA_BASE_URL = "https://api.authentica.sa/api/v2";
const REQUEST_TIMEOUT_MS = 8_000;

type AuthenticaResponse = {
  success?: boolean;
  status?: boolean;
  message?: string;
};

export type OtpLanguage = "en" | "ar";

const parseTemplateId = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getConfig = () => {
  const apiKey = process.env.AUTHENTICA_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      503,
      "SMS verification is not configured.",
      "otp_provider_not_configured",
    );
  }

  return { apiKey };
};

const getTemplateId = (language: OtpLanguage): number => {
  const englishTemplateId = parseTemplateId(
    process.env.AUTHENTICA_TEMPLATE_ID_EN ??
      process.env.AUTHENTICA_TEMPLATE_ID,
    7,
  );

  return language === "ar"
    ? parseTemplateId(process.env.AUTHENTICA_TEMPLATE_ID_AR, 8)
    : englishTemplateId;
};

const callAuthentica = async (
  path: "/send-otp" | "/verify-otp",
  body: Record<string, string | number>,
): Promise<AuthenticaResponse> => {
  const { apiKey } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${AUTHENTICA_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Authorization": apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as AuthenticaResponse;

    if (response.ok) return payload;

    if (response.status === 400 || response.status === 422) {
      if (path === "/verify-otp") {
        throw new AppError(400, payload.message ?? "Invalid OTP.", "invalid_otp");
      }

      throw new AppError(
        400,
        payload.message ?? "Unable to send a code to this phone number.",
        "invalid_otp_request",
      );
    }
    if (response.status === 429) {
      throw new AppError(
        429,
        "Too many verification attempts. Please wait and try again.",
        "otp_rate_limit_exceeded",
      );
    }
    if (response.status === 401 || response.status === 403) {
      console.error("[otp] Authentica rejected the configured API key");
      throw new AppError(
        503,
        "SMS verification is temporarily unavailable.",
        "otp_provider_configuration_error",
      );
    }

    console.error("[otp] Authentica request failed", {
      path,
      status: response.status,
    });
    throw new AppError(
      503,
      "SMS verification is temporarily unavailable.",
      "otp_provider_unavailable",
    );
  } catch (error) {
    if (error instanceof AppError) throw error;

    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError");
    console.error("[otp] Authentica request error", {
      path,
      reason: isTimeout ? "timeout" : "network_error",
    });
    throw new AppError(
      503,
      isTimeout
        ? "SMS verification timed out. Please try again."
        : "SMS verification is temporarily unavailable.",
      isTimeout ? "otp_provider_timeout" : "otp_provider_unavailable",
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const sendAuthenticaOtp = async (
  phoneNumber: string,
  language: OtpLanguage = "en",
): Promise<void> => {
  const templateId = getTemplateId(language);
  const response = await callAuthentica("/send-otp", {
    method: "sms",
    phone: phoneNumber,
    template_id: templateId,
  });

  if (response.success !== true) {
    throw new AppError(
      503,
      "SMS verification is temporarily unavailable.",
      "otp_provider_unavailable",
    );
  }
};

export const verifyAuthenticaOtp = async (
  phoneNumber: string,
  otp: string,
): Promise<void> => {
  const response = await callAuthentica("/verify-otp", {
    phone: phoneNumber,
    otp,
  });

  if (response.status !== true) {
    throw new AppError(400, response.message ?? "Invalid OTP.", "invalid_otp");
  }
};
