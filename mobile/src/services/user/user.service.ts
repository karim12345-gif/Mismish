import api from "../api";
import USER_ENDPOINTS from "./user.config";
import { AuthUser } from "../../context/types";

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UserResponse {
  status: string;
  data: { user: AuthUser };
}

const getMyProfile = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(USER_ENDPOINTS.ME);
  return response.data;
};

const updateMyProfile = async (
  payload: UpdateProfileRequest,
): Promise<UserResponse> => {
  const response = await api.patch<UserResponse>(USER_ENDPOINTS.ME, payload);
  return response.data;
};

const UserServices = { getMyProfile, updateMyProfile };

export { UserServices };
