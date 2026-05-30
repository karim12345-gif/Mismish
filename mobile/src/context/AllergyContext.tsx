import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AllergiesService } from "../services/user/allergies.service";
import { useAuth } from "./AuthContext";

const ALLERGY_PENDING_KEY = "@mismish_pending_allergies";

interface AllergyContextType {
  userAllergies: string[];
  setUserAllergies: (allergies: string[]) => void;
}

const AllergyContext = createContext<AllergyContextType>({
  userAllergies: [],
  setUserAllergies: () => {},
});

export const AllergyProvider = ({ children }: { children: React.ReactNode }) => {
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      AllergiesService.getAllergies()
        .then(setUserAllergies)
        .catch(() => {});
    } else {
      AsyncStorage.getItem(ALLERGY_PENDING_KEY).then((v) => {
        if (v) setUserAllergies(JSON.parse(v));
      });
    }
  }, [isAuthenticated]);

  return (
    <AllergyContext.Provider value={{ userAllergies, setUserAllergies }}>
      {children}
    </AllergyContext.Provider>
  );
};

export const useUserAllergies = () => useContext(AllergyContext);
