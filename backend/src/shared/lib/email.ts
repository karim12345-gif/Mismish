import { Resend } from "resend";

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const resend = new Resend(apiKey);
  const dashboardUrl = process.env.DASHBOARD_URL ?? "http://localhost:5173";
  const resetUrl = `${dashboardUrl}/merchant/reset-password?token=${resetToken}`;

  const logoUrl = `${dashboardUrl}/logo.png`;

  await resend.emails.send({
    from: "Mismish <onboarding@resend.dev>",
    to,
    subject: "Reset your Mismish password",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;box-shadow:0 4px 32px rgba(255,127,80,0.10);overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#FF7F50;padding:32px;text-align:center;">
            <img src="${logoUrl}" alt="Mismish" height="38" style="display:inline-block;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">Reset your password</h1>
            <p style="margin:0 0 8px;font-size:15px;color:#444;line-height:1.6;">
              You requested a password reset for your <strong>Mismish merchant account</strong>.
            </p>
            <p style="margin:0 0 32px;font-size:15px;color:#444;line-height:1.6;">
              Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td style="border-radius:10px;background:#FF7F50;">
                  <a href="${resetUrl}"
                     style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 16px;font-size:13px;color:#aaa;text-align:center;">
              Or copy this link into your browser:
            </p>
            <p style="margin:0;font-size:12px;color:#bbb;word-break:break-all;text-align:center;">
              ${resetUrl}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:13px;color:#bbb;text-align:center;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
};
