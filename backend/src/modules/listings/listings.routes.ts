import { Router } from "express";
import { validate } from "../../shared/middleware/validate";
import { NearbyListingsSchema } from "./listings.schemas";
import * as listingsController from "./listings.controller";

const router = Router();

// Public — no auth required to browse listings
router.get(
  "/nearby",
  validate(NearbyListingsSchema),
  listingsController.getNearbyListings,
);
router.get("/:id", listingsController.getListingById);

export default router;
