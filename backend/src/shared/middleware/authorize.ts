import { Request, Response, NextFunction } from "express";

/**
 * Restricts a route to specific token types.
 * Must be used after `authenticate`.
 *
 * @example
 * router.post('/', authenticate, authorize('user'), createOrder);
 * router.patch('/:id/confirm', authenticate, authorize('vendor'), confirmOrder);
 */
export const authorize =
  (...roles: Array<"user" | "vendor" | "admin">) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.type)) {
      res
        .status(403)
        .json({
          status: "error",
          message: "Forbidden: insufficient permissions",
        });
      return;
    }
    next();
  };
