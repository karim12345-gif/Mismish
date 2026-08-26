import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as vendorsService from "./vendors.service";
import { OrderStatus } from "@prisma/client";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res.status(error.statusCode).json({
        status: "error",
        error: { code: error.code, message: error.message },
      })
    : next(error);
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.getMyProfile(req.user!.id) });
  } catch (e) { handle(e, res, next); }
};

export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.updateMyProfile(req.user!.id, req.body) });
  } catch (e) { handle(e, res, next); }
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export const getMyListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.getMyListings(req.user!.id) });
  } catch (e) { next(e); }
};

export const createListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(201).json({ status: "success", data: await vendorsService.createListing(req.user!.id, req.body) });
  } catch (e) { handle(e, res, next); }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.updateListing(req.user!.id, parseInt(req.params.id as string), req.body) });
  } catch (e) { handle(e, res, next); }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await vendorsService.deleteListing(req.user!.id, parseInt(req.params.id as string));
    res.json({ status: "success", message: "Listing deleted" });
  } catch (e) { handle(e, res, next); }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.getMyOrders(req.user!.id) });
  } catch (e) { next(e); }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ status: "success", data: await vendorsService.updateOrderStatus(req.user!.id, parseInt(req.params.id as string), req.body.status as OrderStatus) });
  } catch (e) { handle(e, res, next); }
};
