import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as usersService from "./users.service";
import type { UpdateProfileBody } from "./users.types";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res
        .status(error.statusCode)
        .json({ status: "error", message: error.message })
    : next(error);
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.getMyProfile(req.user!.id);
    res.status(200).json({ status: "success", data: { user } });
  } catch (e) {
    handle(e, res, next);
  }
};

export const updateMyProfile = async (
  req: Request<{}, {}, UpdateProfileBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await usersService.updateMyProfile(req.user!.id, req.body);
    res.status(200).json({ status: "success", data: { user } });
  } catch (e) {
    handle(e, res, next);
  }
};

export const savePushToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await usersService.savePushToken(req.user!.id, req.body.pushToken);
    res.status(200).json({ status: "success" });
  } catch (e) {
    handle(e, res, next);
  }
};
