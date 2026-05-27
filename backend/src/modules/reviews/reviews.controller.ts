import { Request, Response, NextFunction } from "express";
import * as reviewsService from "./reviews.service";

export const submitReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId  = (req as any).user.id as number;
    const orderId = parseInt(req.params.orderId as string);
    const { rating, comment } = req.body as { rating: number; comment?: string };

    const review = await reviewsService.submitReview(userId, orderId, rating, comment);
    res.status(201).json({ status: "success", data: review });
  } catch (err) {
    next(err);
  }
};

export const getVendorReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vendorId = parseInt(req.params.vendorId as string);
    const reviews  = await reviewsService.getVendorReviews(vendorId);
    res.json({ status: "success", data: reviews });
  } catch (err) {
    next(err);
  }
};
