import express from "express";
import {
  loginUser,
  registerUser,
  verifyOTP,
  resendOTP,
  refreshAccessToken,
  logout,
  changePassword,
  validate,
  authenticate,
  SignupSchema,
  LoginSchema,
  VerifyOTPSchema,
  ResendOTPSchema,
  RefreshTokenSchema,
  LogoutSchema,
  ChangePasswordSchema,
  SocialLoginSchema,
  socialLogin,
} from "../../api";

const router = express.Router();

// Public routes
router.post("/signup", validate(SignupSchema), registerUser);
router.post("/login", validate(LoginSchema), loginUser);
router.post("/verify-otp", validate(VerifyOTPSchema), verifyOTP);
router.post("/resend-otp", validate(ResendOTPSchema), resendOTP);
router.post("/social-login", validate(SocialLoginSchema), socialLogin);

// Token management routes
router.post("/refresh", validate(RefreshTokenSchema), refreshAccessToken);
router.post("/logout", validate(LogoutSchema), logout);

// Protected routes (require authentication)
router.post(
  "/change-password",
  authenticate,
  validate(ChangePasswordSchema),
  changePassword,
);

export default router;
