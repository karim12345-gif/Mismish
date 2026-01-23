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