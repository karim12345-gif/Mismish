import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { CreateOrderSchema } from "./orders.schemas";
import * as ordersController from "./orders.controller";

const router = Router();

// All order routes require a valid token
router.use(authenticate);

router.post(
  "/",
  authorize("user"),
  validate(CreateOrderSchema),
  ordersController.createOrder,
);
router.get("/", authorize("user"), ordersController.getMyOrders);
router.get("/stats", authorize("user"), ordersController.getUserImpactStats);
router.get("/:id", authorize("user"), ordersController.getOrderById);
router.patch("/:id/collect", authorize("user"), ordersController.collectOrder);

// DEV ONLY — remove before production
router.patch("/:id/dev-status", ordersController.devSetOrderStatus);

export default router;
