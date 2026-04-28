import express from "express";
import { authenticate } from "../../api";
import { getMyProfile, updateMyProfile, savePushToken } from "../../api";

const router = express.Router();

router.use(authenticate);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.post("/push-token", savePushToken);

export default router;
