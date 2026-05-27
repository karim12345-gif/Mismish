import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as listingsService from "./listings.service";
import type { NearbyListingsQuery } from "./listings.types";

export const getNearbyListings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { lat, lng, radius } = req.query as unknown as NearbyListingsQuery;
    const listings = await listingsService.getNearbyListings(lat, lng, radius);
    res.status(200).json({ status: "success", data: listings });
  } catch (e) {
    next(e);
  }
};

export const getListingById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const listing = await listingsService.getListingById(
      parseInt(req.params.id, 10),
    );
    res.status(200).json({ status: "success", data: listing });
  } catch (e) {
    e instanceof AppError
      ? res.status(e.statusCode).json({ status: "error", message: e.message })
      : next(e);
  }
};
