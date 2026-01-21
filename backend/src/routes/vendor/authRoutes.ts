import express from 'express';
import { registerVendor, loginVendor } from '../../api/vendor/auth/auth.controller';
import { validate } from '../../api/shared/middlewares/validate';
import { SignupSchema, LoginSchema } from '../../api/shared/schemas/authSchemas';

const router = express.Router();

router.post('/signup', validate(SignupSchema), registerVendor);
router.post('/login', validate(LoginSchema), loginVendor);

export default router;
