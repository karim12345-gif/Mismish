import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${process.env.DASHBOARD_URL ?? "http://localhost:3001"}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Mismish" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your Mismish password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #FF7F50;">Reset your password</h2>
        <p>You requested a password reset for your Mismish merchant account.</p>
        <p>Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:14px 28px;background:#FF7F50;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#bbb;font-size:12px;">Link: ${resetUrl}</p>
      </div>
    `,
  });
};
