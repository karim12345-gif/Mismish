import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as storesService from "./stores.service";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res
        .status(error.statusCode)
        .json({ status: "error", message: error.message })
    : next(error);
};

export const getStores = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({ status: "success", data: await storesService.getStores() });
  } catch (e) {
    next(e);
  }
};

export const getStoreById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({
        status: "success",
        data: await storesService.getStoreById(parseInt(req.params.id, 10)),
      });
  } catch (e) {
    handle(e, res, next);
  }
};

export const getStoreInventory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res
      .status(200)
      .json({
        status: "success",
        data: await storesService.getStoreInventory(
          parseInt(req.params.id, 10),
        ),
      });
  } catch (e) {
    handle(e, res, next);
  }
};
