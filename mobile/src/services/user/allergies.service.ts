import api from "../api";

const getAllergies = async (): Promise<string[]> => {
  const res = await api.get("/users/v1/allergies");
  return res.data.data.allergies;
};

const updateAllergies = async (allergies: string[]): Promise<string[]> => {
  const res = await api.patch("/users/v1/allergies", { allergies });
  return res.data.data.allergies;
};

export const AllergiesService = { getAllergies, updateAllergies };
