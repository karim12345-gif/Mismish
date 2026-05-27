import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as ordersService from "./orders.service";
import type { CreateOrderBody } from "./orders.types";
import { OrderStatus } from "@prisma/client";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res
        .status(error.statusCode)
        .json({ status: "error", message: error.message })
    : next(error);
};

export const createOrder = async (
  req: Request<{}, {}, CreateOrderBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await ordersService.createOrder(req.user!.id, req.body);
    res.status(201).json({ status: "success", data: order });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await ordersService.getMyOrders(req.user!.id);
    res.status(200).json({ status: "success", data: orders });
  } catch (e) {
    next(e);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await ordersService.getOrderById(
      req.user!.id,
      parseInt(req.params.id as string),
    );
    res.status(200).json({ status: "success", data: order });
  } catch (e) {
    handle(e, res, next);
  }
};

export const collectOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await ordersService.collectOrder(
      req.user!.id,
      parseInt(req.params.id as string),
    );
    res.status(200).json({ status: "success", data: order });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getUserImpactStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await ordersService.getUserImpactStats(req.user!.id);
    res.status(200).json({ status: "success", data: stats });
  } catch (e) {
    next(e);
  }
};

// DEV ONLY
export const devSetOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await ordersService.devSetOrderStatus(
      parseInt(req.params.id as string),
      req.body.status as OrderStatus,
    );
    res.status(200).json({ status: "success", data: order });
  } catch (e) {
    next(e);
  }
};
