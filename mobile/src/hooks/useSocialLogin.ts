import { useMutation } from "@tanstack/react-query";
import {
  AuthServices,
  SocialLoginRequest,
  SocialLoginResponse,
} from "../services/auth/auth.service";

/**
 * Hook to handle Social Login (Google / Apple)
 */
export const useSocialLogin = () => {
  return useMutation<SocialLoginResponse, Error, SocialLoginRequest>({
    mutationFn: (payload: SocialLoginRequest) =>
      AuthServices.socialLogin(payload),
    onSuccess: (data) => {
      console.log("Social Login Successful hook:", data);
    },
    onError: (error) => {
      console.error("Social Login Failed hook:", error);
    },
  });
};
