import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./shared/middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import listingsRoutes from "./modules/listings/listings.routes";
import storesRoutes from "./modules/stores/stores.routes";
import usersRoutes from "./modules/users/users.routes";
import vendorsRoutes from "./modules/vendors/vendors.routes";
import placesRoutes from "./modules/places/places.routes";
import prisma from "./shared/lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" })); // TODO: restrict in production

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
  }),
);

// ─── Routes — /api/{module}/v1 ────────────────────────────────────────────────
app.use("/api/auth/v1", authRoutes);
app.use("/api/orders/v1", ordersRoutes);
app.use("/api/listings/v1", listingsRoutes);
app.use("/api/stores/v1", storesRoutes);
app.use("/api/users/v1", usersRoutes);
app.use("/api/vendors/v1", vendorsRoutes);
app.use("/api/places/v1", placesRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Connected to PostgreSQL");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

start();
