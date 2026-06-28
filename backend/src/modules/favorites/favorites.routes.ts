import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import * as favoritesController from "./favorites.controller";

const router = Router();

router.use(authenticate, authorize("user"));

router.get("/", favoritesController.getFavorites);
router.post("/sync", favoritesController.syncFavorites);
router.post("/:vendorId", favoritesController.toggleFavorite);

export default router;
