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

export const renderResetPasswordPage = (
  req: Request,
  res: Response,
): void => {
  const token = String(req.query.token ?? "");
  const logoUrl = `${process.env.DASHBOARD_URL ?? ""}/logo.png`;
  const apiBase = process.env.DASHBOARD_URL ?? "";

  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password — Mismish</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #FFF8F5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 32px rgba(255,127,80,0.12);
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
    }
    .logo { display: block; height: 40px; margin: 0 auto 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 8px; }
    p.sub { font-size: 14px; color: #888; text-align: center; margin-bottom: 32px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
    input[type=password] {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e5e5e5;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color .15s;
      margin-bottom: 20px;
    }
    input[type=password]:focus { border-color: #FF7F50; }
    button {
      width: 100%;
      padding: 14px;
      background: #FF7F50;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .15s;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .msg {
      margin-top: 20px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      text-align: center;
      display: none;
    }
    .msg.error { background: #FFF0ED; color: #c0392b; display: block; }
    .msg.success { background: #F0FFF4; color: #27ae60; display: block; }
    .msg.invalid { background: #FFF0ED; color: #c0392b; display: block; }
  </style>
</head>
<body>
  <div class="card">
    <img src="${logoUrl}" alt="Mismish" class="logo" onerror="this.style.display='none'" />
    ${
      !token
        ? `<h1>Invalid Link</h1>
           <p class="sub">This reset link is missing a token. Please request a new one.</p>`
        : `<h1>Set new password</h1>
           <p class="sub">Choose a strong password for your merchant account.</p>
           <form id="form">
             <label for="pw">New password</label>
             <input type="password" id="pw" placeholder="At least 8 characters" required minlength="8" />
             <label for="pw2">Confirm password</label>
             <input type="password" id="pw2" placeholder="Repeat password" required minlength="8" />
             <button type="submit" id="btn">Reset Password</button>
           </form>
           <div id="msg" class="msg"></div>
           <script>
             document.getElementById('form').addEventListener('submit', async function(e) {
               e.preventDefault();
               var pw = document.getElementById('pw').value;
               var pw2 = document.getElementById('pw2').value;
               var msg = document.getElementById('msg');
               var btn = document.getElementById('btn');
               msg.className = 'msg'; msg.textContent = '';
               if (pw !== pw2) {
                 msg.className = 'msg error'; msg.textContent = 'Passwords do not match.'; return;
               }
               btn.disabled = true; btn.textContent = 'Resetting…';
               try {
                 var res = await fetch('${apiBase}/api/auth/v1/vendor/reset-password', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ token: '${token}', newPassword: pw })
                 });
                 var data = await res.json();
                 if (res.ok) {
                   document.getElementById('form').style.display = 'none';
                   msg.className = 'msg success';
                   msg.textContent = 'Password reset! You can now log in to the Mismish merchant app.';
                 } else {
                   msg.className = 'msg error';
                   msg.textContent = data.message || 'Something went wrong. Please try again.';
                   btn.disabled = false; btn.textContent = 'Reset Password';
                 }
               } catch(_) {
                 msg.className = 'msg error'; msg.textContent = 'Network error. Please try again.';
                 btn.disabled = false; btn.textContent = 'Reset Password';
               }
             });
           </script>`
    }
  </div>
</body>
</html>`);
};
