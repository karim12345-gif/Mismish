import { Router } from "express";
import jwt from "jsonwebtoken";
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
import type { JwtPayload } from "../../shared/middleware/authenticate";

const router = Router();

// ─── SSE stream ───────────────────────────────────────────────────────────────
// EventSource can't send Authorization headers, so we accept token as ?token=
// This route is intentionally placed BEFORE the global authenticate middleware.
router.get("/stream", (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) { res.status(401).json({ message: "Unauthorized" }); return; }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    res.status(401).json({ message: "Invalid token" }); return;
  }
  if (payload.type !== "vendor") { res.status(403).json({ message: "Forbidden" }); return; }

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();

  addStream(payload.id, res);

  // Heartbeat every 25 s keeps connection alive through proxies / load balancers
  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch { clearInterval(heartbeat); }
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeStream(payload.id, res);
  });
});

// All other vendor routes require a valid vendor token
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
