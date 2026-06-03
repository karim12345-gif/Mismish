import api from "../api";
import AUTH_ENDPOINTS from "./auth.config";
import { AuthUser } from "../../context/types";

// ─── Request / Response types ────────────────────────────────────────────────

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  status: string;
  message: string;
  devOtp?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface SocialLoginRequest {
  provider: "google" | "apple" | "firebase_phone";
  idToken: string;
}

// ─── Service methods ──────────────────────────────────────────────────────────

const sendOtp = async (payload: SendOtpRequest): Promise<SendOtpResponse> => {
  const response = await api.post<SendOtpResponse>(
    AUTH_ENDPOINTS.SEND_OTP,
    payload,
  );
  return response.data;
};

const verifyOtp = async (payload: VerifyOtpRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    AUTH_ENDPOINTS.VERIFY_OTP,
    payload,
  );
  return response.data;
};

const resendOtp = async (phoneNumber: string): Promise<SendOtpResponse> => {
  const response = await api.post<SendOtpResponse>(AUTH_ENDPOINTS.RESEND_OTP, {
    phoneNumber,
  });
  return response.data;
};

const socialLogin = async (payload: SocialLoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    AUTH_ENDPOINTS.SOCIAL_LOGIN,
    payload,
  );
  return response.data;
};

const logout = async (refreshToken: string): Promise<void> => {
  await api.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
};

const deleteAccount = async (): Promise<void> => {
  await api.delete("/user/me");
};

const AuthServices = {
  sendOtp,
  verifyOtp,
  resendOtp,
  socialLogin,
  logout,
  deleteAccount,
};

export { AuthServices };
