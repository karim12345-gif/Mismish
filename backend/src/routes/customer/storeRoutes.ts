import express from "express";
import { getStores, getStoreById, getStoreInventory } from "../../api";

const router = express.Router();

router.get("/", getStores);
router.get("/:id", getStoreById);
router.get("/:id/inventory", getStoreInventory);

export default router;
