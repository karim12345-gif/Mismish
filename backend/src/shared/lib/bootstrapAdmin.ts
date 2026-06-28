import bcrypt from "bcrypt";
import prisma from "./prisma";

export const bootstrapAdmin = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Mismish Admin";

  if (!email || !password) return;

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return;

  await prisma.admin.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 10),
      role: "OWNER",
    },
  });

  console.log(`✅ Bootstrapped admin account: ${email}`);
};
