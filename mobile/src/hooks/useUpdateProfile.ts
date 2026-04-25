import { useMutation } from "@tanstack/react-query";
import {
  UserServices,
  UpdateProfileRequest,
  UserResponse,
} from "../services/user/user.service";
import { useAuth } from "../context/AuthContext";

export const useUpdateProfile = () => {
  const { updateUser } = useAuth();

  return useMutation<UserResponse, Error, UpdateProfileRequest>({
    mutationFn: (payload) => UserServices.updateMyProfile(payload),
    onSuccess: (response) => {
      updateUser(response.data.user);
    },
  });
};
