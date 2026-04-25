import { useMutation } from "@tanstack/react-query";
import { AuthServices, VerifyOtpRequest, AuthResponse } from "../services/auth/auth.service";
import { useAuth } from "../context/AuthContext";

export const useVerifyOtp = () => {
  const { login } = useAuth();

  return useMutation<AuthResponse, Error, VerifyOtpRequest>({
    mutationFn: (payload) => AuthServices.verifyOtp(payload),
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;
      await login(accessToken, refreshToken, user);
    },
  });
};
