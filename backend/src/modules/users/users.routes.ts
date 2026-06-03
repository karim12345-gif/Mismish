import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import * as usersController from "./users.controller";

const router = Router();

router.use(authenticate, authorize("user"));

router.get("/me", usersController.getMyProfile);
router.patch("/me", usersController.updateMyProfile);
router.delete("/me", usersController.deleteMyAccount);
router.post("/push-token", usersController.savePushToken);
router.get("/allergies", usersController.getAllergies);
router.patch("/allergies", usersController.updateAllergies);

export default router;
