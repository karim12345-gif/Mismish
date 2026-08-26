import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      error: { code: err.code, message: err.message },
    });
    return;
  }

  const error = err as any;
  console.error(error?.stack ?? error);

  res.status(error?.status || 500).json({
    status: "error",
    error: {
      code: "internal_server_error",
      message: "Something went wrong while processing the request.",
    },
  });
};
