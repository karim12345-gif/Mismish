import express from "express";
import { authenticate } from "../../api";
import { getMyProfile, updateMyProfile } from "../../api";

const router = express.Router();

router.use(authenticate);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
