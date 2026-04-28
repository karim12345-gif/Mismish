import { Request, Response, NextFunction } from "express";
import prisma from "../../../prismaClient";

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

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

    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { user: { ...user, needsProfile: !user.name || !user.email } },
    });
  } catch (error) {
    next(error);
  }
};

export const savePushToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const { pushToken } = req.body as { pushToken: string };
    if (!pushToken) {
      res.status(400).json({ status: "error", message: "pushToken is required" });
      return;
    }

    await prisma.user.update({ where: { id: userId }, data: { pushToken } });
    res.status(200).json({ status: "success" });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const { name, email } = req.body as { name?: string; email?: string };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim().toLowerCase() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isVerified: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: { user: { ...user, needsProfile: !user.name || !user.email } },
    });
  } catch (error) {
    next(error);
  }
};
