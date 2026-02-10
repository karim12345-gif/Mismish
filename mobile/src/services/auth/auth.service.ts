import api from "../api";
import AUTH_ENDPOINTS from "./auth.config";

export interface SocialLoginResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      name: string;
      email?: string;
      phoneNumber?: string;
      isVerified: boolean;
    };
  };
}

export interface SocialLoginRequest {
  provider: "google" | "apple";
  idToken: string;
}

const socialLogin = async (
  payload: SocialLoginRequest,
): Promise<SocialLoginResponse> => {
  const response = await api.post<SocialLoginResponse>(
    AUTH_ENDPOINTS.SOCIAL_LOGIN,
    payload,
  );
  return response.data;
};

const AuthServices = {
  socialLogin,
};

export { AuthServices };
