import { useMutation } from "@tanstack/react-query";
import { AuthServices, SocialLoginRequest, AuthResponse } from "../services/auth/auth.service";
import { useAuth } from "../context/AuthContext";

export const useSocialLogin = () => {
  const { login } = useAuth();

  return useMutation<AuthResponse, Error, SocialLoginRequest>({
    mutationFn: (payload) => AuthServices.socialLogin(payload),
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;
      await login(accessToken, refreshToken, user);
    },
  });
};
