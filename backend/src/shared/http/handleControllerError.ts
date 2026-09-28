import type { NextFunction, Response } from "express";
import { AppError } from "../lib/AppError";

export const handleControllerError = (
  error: unknown,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json({ status: "error", message: error.message });
    return;
  }

  next(error);
};
