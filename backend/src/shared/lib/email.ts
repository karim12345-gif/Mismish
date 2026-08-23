import { Resend } from "resend";

const getResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
};

const getEmailFrom = (): string =>
  process.env.EMAIL_FROM ?? "Mismish <no-reply@mismish.net>";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = process.env.DASHBOARD_URL ?? "http://localhost:5173";
  const resetUrl = `${dashboardUrl}/merchant/reset-password?token=${resetToken}`;

  const logoUrl = `${dashboardUrl}/logo.png`;

  await resend.emails.send({
    from: getEmailFrom(),
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

export const sendPasswordChangedEmail = async (to: string): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = process.env.DASHBOARD_URL ?? "https://mismish-app.vercel.app";
  const loginUrl = `${dashboardUrl}/merchant/login`;
  const logoUrl = `${dashboardUrl}/logo.png`;

  await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "Your Mismish password was changed",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#173B38;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#195B55;padding:30px 36px;text-align:center;">
          <div style="display:inline-block;padding:12px 18px;background:#ffffff;border-radius:14px;">
            <img src="${logoUrl}" alt="Mismish" height="38" style="display:block;max-width:180px;" />
          </div>
          <p style="margin:22px 0 0;color:#FFD9C8;font-size:15px;font-weight:700;">&#10024; Congratulations! &#10024;</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;">Password updated</h1>
          <p style="margin:10px 0 0;color:#D9F0E9;font-size:15px;">Your Mismish account is secure.</p>
        </td></tr>
        <tr><td style="padding:38px 36px 28px;">
          <h2 style="margin:0 0 14px;font-size:22px;">Your new password is ready &#127881;</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:15px;line-height:1.7;">
            Your Mismish merchant account password was successfully changed.
          </p>
          <p style="margin:0 0 24px;color:#526663;font-size:15px;line-height:1.7;">
            You can now sign in with your new password using the button below.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:10px;background:#FF7F50;">
            <a href="${loginUrl}" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Sign in to Mismish</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:20px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          If you did not make this change, contact the Mismish team immediately.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
};

export const sendVendorWelcomeEmail = async (
  to: string,
  vendorName: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = process.env.DASHBOARD_URL ?? "http://localhost:5173";
  const safeName = escapeHtml(vendorName);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "Welcome to Mismish - your store application is received",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#173B38;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#195B55;padding:34px 36px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;">Welcome to Mismish</h1>
          <p style="margin:10px 0 0;color:#D9F0E9;font-size:15px;">Good food deserves another chance.</p>
        </td></tr>
        <tr><td style="padding:38px 36px 28px;">
          <h2 style="margin:0 0 14px;font-size:22px;">Hi ${safeName},</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:15px;line-height:1.7;">
            Thank you for registering <strong>${safeName}</strong> with Mismish. We are excited to have you join us in reducing food waste and reaching new customers.
          </p>
          <div style="margin:24px 0;padding:18px 20px;background:#FFF1E9;border-radius:12px;">
            <strong style="display:block;margin-bottom:6px;">Your application is under review</strong>
            <span style="color:#526663;font-size:14px;line-height:1.6;">Our team will review your store details and email you when your merchant account is approved.</span>
          </div>
          <p style="margin:0 0 24px;color:#526663;font-size:15px;line-height:1.7;">
            You can use your email and password to sign in once your account is approved.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:10px;background:#FF7F50;">
            <a href="${dashboardUrl}/merchant/login" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Visit your merchant portal</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:20px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          Thank you for helping us keep good food in the hands of people, not bins.<br />The Mismish team
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
};
