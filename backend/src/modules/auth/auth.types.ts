// ─── Customer ────────────────────────────────────────────────────────────────

export interface SendOtpBody {
  phoneNumber: string;
}
export interface RegisterUserBody {
  phoneNumber: string;
  password: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}
export interface LoginUserBody {
  phoneNumber: string;
  password: string;
}
export interface VerifyOTPBody {
  phoneNumber: string;
  otp: string;
}
export interface ResendOTPBody {
  phoneNumber: string;
}
export interface SocialLoginBody {
  provider: "google" | "apple";
  idToken: string;
}
export interface RefreshTokenBody {
  refreshToken: string;
}
export interface LogoutBody {
  refreshToken: string;
}
export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: number;
  phoneNumber: string | null;
  name: string | null;
  email: string | null;
  isVerified: boolean;
  needsProfile: boolean;
}

export interface CustomerAuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface RegisterVendorBody {
  email: string;
  password: string;
  name: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}
export interface LoginVendorBody {
  email: string;
  password: string;
}

export interface VendorAuthResult {
  token: string;
  vendor: { id: number; email: string; name: string };
}
