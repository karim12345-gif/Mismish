import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import {
  AuditQuerySchema,
  ListQuerySchema,
  SendNotificationSchema,
  UserBlockSchema,
  VendorStatusSchema,
} from "./admin.schemas";
import * as adminController from "./admin.controller";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/me", adminController.getMe);
router.get("/summary", adminController.getSummary);
router.get("/vendors", validate(ListQuerySchema), adminController.getVendors);
router.patch(
  "/vendors/:id/status",
  validate(VendorStatusSchema),
  adminController.updateVendorStatus,
);
router.get("/users", validate(ListQuerySchema), adminController.getUsers);
router.patch(
  "/users/:id/block",
  validate(UserBlockSchema),
  adminController.updateUserBlocked,
);
router.get("/orders", validate(ListQuerySchema), adminController.getOrders);
router.get("/listings", validate(ListQuerySchema), adminController.getListings);
router.post(
  "/notifications/send",
  validate(SendNotificationSchema),
  adminController.sendNotification,
);
router.get("/audit-logs", validate(AuditQuerySchema), adminController.getAuditLogs);

export default router;
