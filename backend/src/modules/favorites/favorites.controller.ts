import { Request, Response, NextFunction } from "express";
import * as favoritesService from "./favorites.service";

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorIds = await favoritesService.getFavorites(req.user!.id);
    res.json({ status: "success", data: { vendorIds } });
  } catch (e) {
    next(e);
  }
};

export const toggleFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const vendorId = Number(req.params.vendorId);
    const result = await favoritesService.toggleFavorite(req.user!.id, vendorId);
    res.json({ status: "success", data: result });
  } catch (e) {
    next(e);
  }
};

export const syncFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { vendorIds } = req.body as { vendorIds: number[] };
    const result = await favoritesService.syncFavorites(req.user!.id, vendorIds ?? []);
    res.json({ status: "success", data: { vendorIds: result } });
  } catch (e) {
    next(e);
  }
};
