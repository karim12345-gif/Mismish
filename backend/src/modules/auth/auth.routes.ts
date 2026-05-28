import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import {
  SendOtpSchema,
  SignupSchema,
  LoginSchema,
  VerifyOTPSchema,
  ResendOTPSchema,
  SocialLoginSchema,
  RefreshTokenSchema,
  LogoutSchema,
  ChangePasswordSchema,
  VendorSignupSchema,
  VendorLoginSchema,
  VendorForgotPasswordSchema,
  VendorResetPasswordSchema,
} from "./auth.schemas";
import * as authController from "./auth.controller";

const router = Router();

// ─── Customer ────────────────────────────────────────────────────────────────
router.post("/send-otp", validate(SendOtpSchema), authController.sendOtp);
router.post("/signup", validate(SignupSchema), authController.registerUser);
router.post("/login", validate(LoginSchema), authController.loginUser);
router.post("/verify-otp", validate(VerifyOTPSchema), authController.verifyOTP);
router.post("/resend-otp", validate(ResendOTPSchema), authController.resendOTP);
router.post(
  "/social-login",
  validate(SocialLoginSchema),
  authController.socialLogin,
);
router.post(
  "/refresh",
  validate(RefreshTokenSchema),
  authController.refreshAccessToken,
);
router.post("/logout", validate(LogoutSchema), authController.logout);
router.post(
  "/change-password",
  authenticate,
  authorize("user"),
  validate(ChangePasswordSchema),
  authController.changePassword,
);

// ─── Vendor ──────────────────────────────────────────────────────────────────
router.post(
  "/vendor/signup",
  validate(VendorSignupSchema),
  authController.registerVendor,
);
router.post(
  "/vendor/login",
  validate(VendorLoginSchema),
  authController.loginVendor,
);
router.post(
  "/vendor/forgot-password",
  validate(VendorForgotPasswordSchema),
  authController.forgotVendorPassword,
);
router.post(
  "/vendor/reset-password",
  validate(VendorResetPasswordSchema),
  authController.resetVendorPassword,
);

export default router;
