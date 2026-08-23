import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as adminService from "./admin.service";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res
        .status(error.statusCode)
        .json({ status: "error", message: error.message })
    : next(error);
};

const adminIdFrom = (req: Request): number => req.user?.id ?? 0;

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getMe(adminIdFrom(req)) });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getSummary() });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getVendors = async (
  req: Request<{}, {}, {}, { q?: string; status?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getVendors(req.query) });
  } catch (e) {
    handle(e, res, next);
  }
};

export const updateVendorStatus = async (
  req: Request<
    { id: string },
    {},
    {
      status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
      reason?: string;
    }
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({
      status: "success",
      data: await adminService.updateVendorStatus(
        adminIdFrom(req),
        parseInt(req.params.id, 10),
        req.body.status,
        req.body.reason,
      ),
    });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getUsers = async (
  req: Request<{}, {}, {}, { q?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getUsers(req.query) });
  } catch (e) {
    handle(e, res, next);
  }
};

export const updateUserBlocked = async (
  req: Request<{ id: string }, {}, { isBlocked: boolean }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({
      status: "success",
      data: await adminService.updateUserBlocked(
        adminIdFrom(req),
        parseInt(req.params.id, 10),
        req.body.isBlocked,
      ),
    });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getOrders = async (
  req: Request<{}, {}, {}, { status?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getOrders(req.query) });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getListings = async (
  req: Request<{}, {}, {}, { q?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getListings(req.query) });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getAuditLogs = async (
  req: Request<{}, {}, {}, { limit?: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await adminService.getAuditLogs(req.query) });
  } catch (e) {
    handle(e, res, next);
  }
};
