import { Router } from "express";
import { appEnvironment } from "../../config/environment";
import prisma from "../../shared/lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      environment: appEnvironment,
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "error",
      environment: appEnvironment,
      database: "unavailable",
    });
  }
});

export default router;

