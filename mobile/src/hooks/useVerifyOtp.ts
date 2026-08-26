import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthServices, VerifyOtpRequest, AuthResponse } from "../services/auth/auth.service";
import { AllergiesService } from "../services/user/allergies.service";
import { ALLERGY_PENDING_KEY } from "../constants/storage";
import { useAuth } from "../context/AuthContext";
import { useUserAllergies } from "../context/AllergyContext";

export const useVerifyOtp = () => {
  const { login } = useAuth();
  const { setUserAllergies } = useUserAllergies();

  return useMutation<AuthResponse, Error, VerifyOtpRequest>({
    mutationFn: (payload) => AuthServices.verifyOtp(payload),
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;
      await login(accessToken, refreshToken, user);

      // Sync any allergies the user selected before logging in
      const pending = await AsyncStorage.getItem(ALLERGY_PENDING_KEY);
      if (pending) {
        try {
          const allergies: string[] = JSON.parse(pending);
          if (allergies.length > 0) {
            await AllergiesService.updateAllergies(allergies);
            setUserAllergies(allergies);
          }
        } catch {
          // Non-critical
        } finally {
          await AsyncStorage.removeItem(ALLERGY_PENDING_KEY);
        }
      } else {
        // Fetch existing allergies from account
        try {
          const existing = await AllergiesService.getAllergies();
          if (existing.length > 0) setUserAllergies(existing);
        } catch {}
      }
    },
  });
};
