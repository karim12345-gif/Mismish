import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import { SubmitReviewSchema } from "./reviews.schemas";
import * as reviewsController from "./reviews.controller";

const router = Router();

// POST /api/reviews/v1/orders/:orderId  — submit review after COMPLETED order (auth required)
router.post(
  "/orders/:orderId",
  authenticate,
  validate(SubmitReviewSchema),
  reviewsController.submitReview,
);

// GET /api/reviews/v1/stores/:vendorId  — public list of reviews for a store
router.get("/stores/:vendorId", reviewsController.getVendorReviews);

export default router;
