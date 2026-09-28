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
import { addStream, removeStream } from "../../shared/lib/orderStream";

const router = Router();

// ─── SSE stream (before global auth so ?token= can be rejected as 400) ────────
router.get("/stream", (req, res, next) => {
  // Reject legacy query-string JWT (never accept ?token=)
  if (typeof req.query.token === "string" && req.query.token.length > 0) {
    res.status(400).json({
      status: "error",
      error: {
        code: "auth_query_token_rejected",
        message:
          "Query-string tokens are not supported. Use Authorization: Bearer <token>.",
      },
    });
    return;
  }
  next();
}, authenticate, authorize("vendor"), (req, res) => {
  const vendorId = req.user!.id;

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  addStream(vendorId, res);

  // Heartbeat every 25 s keeps connection alive through proxies / load balancers
  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch { clearInterval(heartbeat); }
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeStream(vendorId, res);
  });
});

// All other vendor routes require a valid vendor token.
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
