import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/AppError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: "error", message: err.message });
    return;
  }

  const error = err as any;
  console.error(error.stack);

  res.status(error.status || 500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};
