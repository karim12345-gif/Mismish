import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  type: "user" | "vendor" | "admin";
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
    return;
  }

  try {
    req.user = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    next();
  } catch {
    res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};
