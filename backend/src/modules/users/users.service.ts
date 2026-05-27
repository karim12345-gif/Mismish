import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import type { UpdateProfileBody, UserProfile } from "./users.types";

const toProfile = (u: Omit<UserProfile, "needsProfile">): UserProfile => ({
  ...u,
  needsProfile: !u.name || !u.email,
});

export const getMyProfile = async (userId: number): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return toProfile(user);
};

export const updateMyProfile = async (
  userId: number,
  data: UpdateProfileBody,
): Promise<UserProfile> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.email !== undefined && {
        email: data.email.trim().toLowerCase(),
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
    },
  });
  return toProfile(user);
};

export const savePushToken = async (
  userId: number,
  pushToken: string,
): Promise<void> => {
  if (!pushToken) throw new AppError(400, "pushToken is required");
  await prisma.user.update({ where: { id: userId }, data: { pushToken } });
};
