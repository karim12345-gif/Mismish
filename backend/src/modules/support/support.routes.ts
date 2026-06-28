import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import { ChatRequestSchema } from "./support.schemas";
import * as supportController from "./support.controller";

const router = Router();

// Requires a valid user token — same pattern as orders
router.use(authenticate);

router.post("/chat", validate(ChatRequestSchema), supportController.chatWithSupport);

export default router;
