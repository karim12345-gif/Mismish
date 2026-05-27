import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import {
  UpdateProfileSchema,
  CreateListingSchema,
  UpdateListingSchema,
  UpdateOrderStatusSchema,
} from "./vendors.schemas";
import * as vendorsController from "./vendors.controller";

const router = Router();

// All vendor routes require a valid vendor token
router.use(authenticate, authorize("vendor"));

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile",    vendorsController.getMyProfile);
router.patch("/profile",  validate(UpdateProfileSchema), vendorsController.updateMyProfile);

// ─── Listings ─────────────────────────────────────────────────────────────────
router.get("/listings",        vendorsController.getMyListings);
router.post("/listings",       validate(CreateListingSchema), vendorsController.createListing);
router.patch("/listings/:id",  validate(UpdateListingSchema), vendorsController.updateListing);
router.delete("/listings/:id", vendorsController.deleteListing);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get("/orders",              vendorsController.getMyOrders);
router.patch("/orders/:id/status", validate(UpdateOrderStatusSchema), vendorsController.updateOrderStatus);

export default router;
