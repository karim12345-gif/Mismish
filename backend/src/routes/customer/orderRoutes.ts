import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  collectOrder,
  devSetOrderStatus,
  getUserImpactStats,
  validate,
  CreateOrderSchema,
  authenticate,
} from "../../api";

const router = express.Router();

router.use(authenticate);

router.post("/", validate(CreateOrderSchema), createOrder);
router.get("/", getMyOrders);
router.get("/stats", getUserImpactStats);
router.get("/:id", getOrderById);
router.patch("/:id/collect", collectOrder);
router.patch("/:id/dev-status", devSetOrderStatus);

export default router;
