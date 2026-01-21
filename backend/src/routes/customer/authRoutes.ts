import express from 'express';
import { registerUser, loginUser, verifyOTP, resendOTP } from '../../api/customer/auth/auth.controller';
import { validate } from '../../api/shared/middlewares/validate';
import { SignupSchema, LoginSchema, VerifyOTPSchema, ResendOTPSchema } from '../../api/shared/schemas/authSchemas';

const router = express.Router();

router.post('/signup', validate(SignupSchema), registerUser);
router.post('/login', validate(LoginSchema), loginUser);
router.post('/verify-otp', validate(VerifyOTPSchema), verifyOTP);
router.post('/resend-otp', validate(ResendOTPSchema), resendOTP);

export default router;
