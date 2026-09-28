import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../../shared/lib/AppError";
import prisma from "../../../shared/lib/prisma";
import type { AdminAuthResult, LoginAdminBody } from "../auth.types";

const signAdminToken = (adminId: number): string =>
  jwt.sign({ id: adminId, type: "admin" }, process.env.JWT_SECRET as string, {
    expiresIn: "12h",
  });

export const loginAdmin = async (
  data: LoginAdminBody,
): Promise<AdminAuthResult> => {
  const admin = await prisma.admin.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (!admin || !admin.isActive) throw new AppError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(data.password, admin.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    token: signAdminToken(admin.id),
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  };
};
