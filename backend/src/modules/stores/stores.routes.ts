import { Router } from "express";
import * as storesController from "./stores.controller";

const router = Router();

// Public — no auth required to browse stores
router.get("/", storesController.getStores);
router.get("/:id", storesController.getStoreById);
router.get("/:id/inventory", storesController.getStoreInventory);

export default router;
