import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { RedeemRewardSchema } from "./rewards.schemas";
import * as rewardsController from "./rewards.controller";

const router = Router();

router.use(authenticate, authorize("user"));

router.get("/me", rewardsController.getMyRewards);
router.get("/history", rewardsController.getMyRewards);
router.post("/redeem", validate(RedeemRewardSchema), rewardsController.redeemReward);

export default router;
