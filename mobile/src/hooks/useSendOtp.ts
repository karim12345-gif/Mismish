import { useMutation } from "@tanstack/react-query";
import { AuthServices, SendOtpRequest, SendOtpResponse } from "../services/auth/auth.service";

export const useSendOtp = () => {
  return useMutation<SendOtpResponse, Error, SendOtpRequest>({
    mutationFn: (payload) => AuthServices.sendOtp(payload),
  });
};
