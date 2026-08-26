import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { errorHandler } from "./shared/middleware/errorHandler";
import { renderResetPasswordPage } from "./modules/auth/auth.controller";
import authRoutes from "./modules/auth/auth.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import listingsRoutes from "./modules/listings/listings.routes";
import storesRoutes from "./modules/stores/stores.routes";
import usersRoutes from "./modules/users/users.routes";
import vendorsRoutes from "./modules/vendors/vendors.routes";
import placesRoutes from "./modules/places/places.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";
import supportRoutes from "./modules/support/support.routes";
import favoritesRoutes from "./modules/favorites/favorites.routes";
import prisma from "./shared/lib/prisma";
import { reSchedulePendingNotifications } from "./shared/lib/notificationScheduler";
import { bootstrapAdmin } from "./shared/lib/bootstrapAdmin";
import adminRoutes from "./modules/admin/admin.routes";
import rewardsRoutes from "./modules/rewards/rewards.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cors({ origin: "*" })); // TODO: restrict in production

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
  }),
);

// ─── Merchant web pages ───────────────────────────────────────────────────────
// CSP override: allow inline scripts for the reset-password form
app.get(
  "/merchant/reset-password",
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  }),
  renderResetPasswordPage,
);

// ─── Routes — /api/{module}/v1 ────────────────────────────────────────────────
app.use("/api/auth/v1", authRoutes);
app.use("/api/orders/v1", ordersRoutes);
app.use("/api/listings/v1", listingsRoutes);
app.use("/api/stores/v1", storesRoutes);
app.use("/api/users/v1", usersRoutes);
app.use("/api/vendors/v1", vendorsRoutes);
app.use("/api/places/v1", placesRoutes);
app.use("/api/reviews/v1", reviewsRoutes);
app.use("/api/support/v1", supportRoutes);
app.use("/api/favorites/v1", favoritesRoutes);
app.use("/api/admin/v1", adminRoutes);
app.use("/api/rewards/v1", rewardsRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    error: {
      code: "route_not_found",
      message: "The requested route was not found.",
    },
  });
});
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Connected to PostgreSQL");
    await bootstrapAdmin();

    // Re-schedule any pending notification timers from before the last restart
    reSchedulePendingNotifications().catch((err) =>
      console.error("⚠️  Failed to re-schedule notifications:", err),
    );

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

start();
