import { Router } from "express";
import * as placesController from "./places.controller";

const router = Router();

// Public — no auth needed for place search
router.get("/search", placesController.searchPlaces);

export default router;
