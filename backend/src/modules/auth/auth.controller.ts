import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/lib/AppError";
import * as authService from "./auth.service";
import type {
  SendOtpBody,
  RegisterUserBody,
  LoginUserBody,
  VerifyOTPBody,
  ResendOTPBody,
  SocialLoginBody,
  RefreshTokenBody,
  LogoutBody,
  ChangePasswordBody,
  RegisterVendorBody,
  LoginVendorBody,
  VendorForgotPasswordBody,
  VendorResetPasswordBody,
} from "./auth.types";

const handle = (error: unknown, res: Response, next: NextFunction): void => {
  error instanceof AppError
    ? res
        .status(error.statusCode)
        .json({ status: "error", message: error.message })
    : next(error);
};

// ─── Customer ────────────────────────────────────────────────────────────────

export const sendOtp = async (
  req: Request<{}, {}, SendOtpBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.sendOtp(req.body.phoneNumber);
    res.status(200).json({
      status: "success",
      message: `OTP sent to ${authService.maskPhoneNumber(req.body.phoneNumber)}. Valid for 5 minutes.`,
      ...result,
    });
  } catch (e) {
    handle(e, res, next);
  }
};

export const registerUser = async (
  req: Request<{}, {}, RegisterUserBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.registerUser(req.body);
    res
      .status(201)
      .json({
        status: "success",
        message: "Account created. Please login to verify your phone number.",
      });
  } catch (e) {
    handle(e, res, next);
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginUserBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { maskedPhone } = await authService.loginUser(req.body);
    res
      .status(200)
      .json({
        status: "success",
        message: `OTP sent to ${maskedPhone}. Valid for 5 minutes.`,
      });
  } catch (e) {
    handle(e, res, next);
  }
};

export const verifyOTP = async (
  req: Request<{}, {}, VerifyOTPBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const result = await authService.verifyOTP(req.body, deviceInfo, ipAddress);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    handle(e, res, next);
  }
};

export const resendOTP = async (
  req: Request<{}, {}, ResendOTPBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { attemptsRemaining } = await authService.resendOTP(
      req.body.phoneNumber,
    );
    res.status(200).json({
      status: "success",
      message: `OTP resent to ${authService.maskPhoneNumber(req.body.phoneNumber)}. ${attemptsRemaining} attempts remaining.`,
    });
  } catch (e) {
    handle(e, res, next);
  }
};

export const socialLogin = async (
  req: Request<{}, {}, SocialLoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deviceInfo = req.headers["user-agent"];
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const result = await authService.socialLogin(
      req.body,
      deviceInfo,
      ipAddress,
    );
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    e instanceof AppError
      ? res.status(e.statusCode).json({ status: "error", message: e.message })
      : res
          .status(401)
          .json({
            status: "error",
            message: "Authentication failed: " + (e as any).message,
          });
  }
};

export const refreshAccessToken = async (
  req: Request<{}, {}, RefreshTokenBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    handle(e, res, next);
  }
};

export const logout = async (
  req: Request<{}, {}, LogoutBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.logout(req.body.refreshToken);
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (e) {
    handle(e, res, next);
  }
};

export const changePassword = async (
  req: Request<{}, {}, ChangePasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    await authService.changePassword(
      userId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res
      .status(200)
      .json({
        status: "success",
        message: "Password changed successfully. Please login again.",
      });
  } catch (e) {
    handle(e, res, next);
  }
};

// ─── Vendor ──────────────────────────────────────────────────────────────────

export const registerVendor = async (
  req: Request<{}, {}, RegisterVendorBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.registerVendor(req.body);
    res.status(201).json({ status: "success", data: result });
  } catch (e) {
    handle(e, res, next);
  }
};

export const loginVendor = async (
  req: Request<{}, {}, LoginVendorBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.loginVendor(req.body);
    res.status(200).json({ status: "success", data: result });
  } catch (e) {
    handle(e, res, next);
  }
};

export const forgotVendorPassword = async (
  req: Request<{}, {}, VendorForgotPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.forgotVendorPassword(req.body.email);
    // Always return success so we don't leak whether the email exists
    res.status(200).json({
      status: "success",
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (e) {
    handle(e, res, next);
  }
};

export const resetVendorPassword = async (
  req: Request<{}, {}, VendorResetPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authService.resetVendorPassword(req.body.token, req.body.newPassword);
    res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now log in.",
    });
  } catch (e) {
    handle(e, res, next);
  }
};
