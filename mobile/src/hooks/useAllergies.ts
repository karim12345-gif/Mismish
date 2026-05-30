import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AllergiesService } from "../services/user/allergies.service";
import { ALLERGY_PENDING_KEY } from "../components/AllergyOnboarding/AllergyOnboardingSheet";
import { useAuth } from "../context/AuthContext";

export const ALLERGIES_QUERY_KEY = ["user", "allergies"];

export const useAllergies = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<string[]>({
    queryKey: ALLERGIES_QUERY_KEY,
    queryFn: async () => {
      if (isAuthenticated) {
        return AllergiesService.getAllergies();
      }
      // Pre-login: read from local storage (set by AllergyOnboardingSheet)
      const pending = await AsyncStorage.getItem(ALLERGY_PENDING_KEY);
      return pending ? JSON.parse(pending) : [];
    },
    initialData: [],
  });
};

export const useUpdateAllergies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AllergiesService.updateAllergies,
    onSuccess: (data) => {
      queryClient.setQueryData(ALLERGIES_QUERY_KEY, data);
    },
  });
};
