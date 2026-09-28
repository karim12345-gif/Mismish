import {
  escapeHtml,
  getDashboardUrl,
  getEmailFrom,
  getResend,
} from "./email.client";

const PRODUCTION_DASHBOARD_URL = "https://mismish-app.vercel.app";

export const sendVendorWelcomeEmail = async (
  to: string,
  vendorName: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = getDashboardUrl(PRODUCTION_DASHBOARD_URL);
  const loginUrl = `${dashboardUrl}/merchant/login`;
  const logoUrl = `${dashboardUrl}/logo.png`;
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
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(25,91,85,0.10);">
        <tr><td style="background:#195B55;padding:34px 36px;text-align:center;">
          <div style="display:inline-block;padding:12px 18px;background:#ffffff;border-radius:14px;">
            <img src="${logoUrl}" alt="Mismish" height="40" style="display:block;max-width:190px;" />
          </div>
          <p style="margin:22px 0 0;color:#FFD9C8;font-size:15px;font-weight:700;">&#127881; Welcome aboard!</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:30px;">Good food deserves another chance.</h1>
        </td></tr>
        <tr><td style="padding:40px 44px 28px;">
          <h2 style="margin:0 0 14px;font-size:24px;">Hi ${safeName}! &#128075;</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:16px;line-height:1.7;">
            Thank you for registering <strong>${safeName}</strong> with Mismish. You are now one step closer to turning surplus food into happy customers.
          </p>
          <div style="margin:26px 0;padding:22px 24px;background:#FFF1E9;border-left:5px solid #FF7F50;border-radius:14px;">
            <strong style="display:block;margin-bottom:7px;font-size:16px;">Your application is under review</strong>
            <span style="color:#526663;font-size:14px;line-height:1.6;">Our team is checking your store details. We will email you as soon as your merchant account is approved.</span>
          </div>
          <p style="margin:0 0 14px;font-size:16px;font-weight:700;">What happens next?</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">01</strong>&nbsp;&nbsp; We review your store</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">02</strong>&nbsp;&nbsp; You receive an approval email</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">03</strong>&nbsp;&nbsp; You create your first offer</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">04</strong>&nbsp;&nbsp; Together, we save good food</td></tr>
          </table>
          <p style="margin:0 0 24px;color:#526663;font-size:15px;line-height:1.7;">
            We are excited to have you with us. Keep an eye on your inbox for the good news!
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:12px;background:#FF7F50;">
            <a href="${loginUrl}" style="display:inline-block;padding:15px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Visit your merchant portal</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:22px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          Good food. Great deals. Less waste.<br /><strong>The Mismish Team</strong>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
};

export const sendVendorApprovalEmail = async (
  to: string,
  vendorName: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = getDashboardUrl(PRODUCTION_DASHBOARD_URL);
  const loginUrl = `${dashboardUrl}/merchant/login`;
  const logoUrl = `${dashboardUrl}/logo.png`;
  const safeName = escapeHtml(vendorName);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "You’re officially part of Mismish! 🎉",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#173B38;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(25,91,85,0.10);">
        <tr><td style="background:#195B55;padding:34px 36px;text-align:center;">
          <div style="display:inline-block;padding:12px 18px;background:#ffffff;border-radius:14px;"><img src="${logoUrl}" alt="Mismish" height="40" style="display:block;max-width:190px;" /></div>
          <p style="margin:22px 0 0;color:#FFD9C8;font-size:15px;font-weight:700;">&#127881; Great news!</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:30px;">Your store is approved!</h1>
          <p style="margin:10px 0 0;color:#D9F0E9;font-size:15px;">You’re officially part of Mismish.</p>
        </td></tr>
        <tr><td style="padding:40px 44px 28px;">
          <h2 style="margin:0 0 14px;font-size:24px;">Congratulations, ${safeName}! &#127881;</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:16px;line-height:1.7;">
            Your merchant account has been <strong>approved</strong>. We’re excited to help you turn great food into great opportunities while reducing food waste.
          </p>
          <div style="margin:26px 0;padding:22px 24px;background:#EAF7F1;border-left:5px solid #195B55;border-radius:14px;">
            <strong style="display:block;margin-bottom:7px;font-size:16px;">You’re ready to get started</strong>
            <span style="color:#526663;font-size:14px;line-height:1.6;">Sign in to your merchant dashboard and publish your first offer today.</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">&#128230;</strong>&nbsp;&nbsp; Create your first offer</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">&#127860;</strong>&nbsp;&nbsp; Add available food and deals</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">&#128176;</strong>&nbsp;&nbsp; Reach new customers and grow your store</td></tr>
            <tr><td style="padding:10px 0;color:#526663;font-size:14px;"><strong style="color:#FF7F50;">&#127793;</strong>&nbsp;&nbsp; Help save good food from going to waste</td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:12px;background:#FF7F50;">
            <a href="${loginUrl}" style="display:inline-block;padding:15px 34px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Sign in to Mismish</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:22px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          Welcome aboard. Good food. Great deals. Less waste.<br /><strong>The Mismish Team</strong>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
};

export const sendVendorRejectionEmail = async (
  to: string,
  vendorName: string,
  reason: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = getDashboardUrl(PRODUCTION_DASHBOARD_URL);
  const applicationUrl = `${dashboardUrl}/auth/registration`;
  const logoUrl = `${dashboardUrl}/logo.png`;
  const safeName = escapeHtml(vendorName);
  const safeReason = escapeHtml(reason).replace(/\r?\n/g, "<br />");

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "Action needed: update your Mismish application",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#173B38;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(25,91,85,0.10);">
        <tr><td style="background:#195B55;padding:34px 36px;text-align:center;">
          <div style="display:inline-block;padding:12px 18px;background:#ffffff;border-radius:14px;"><img src="${logoUrl}" alt="Mismish" height="40" style="display:block;max-width:190px;" /></div>
          <p style="margin:22px 0 0;color:#FFD9C8;font-size:15px;font-weight:700;">Application review</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;">Your application needs a quick update</h1>
        </td></tr>
        <tr><td style="padding:40px 44px 28px;">
          <h2 style="margin:0 0 14px;font-size:24px;">Hi ${safeName},</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:16px;line-height:1.7;">
            Thank you for applying to join <strong>Mismish</strong>. We reviewed your store application, but we need a few changes before we can approve your merchant account.
          </p>
          <div style="margin:26px 0;padding:22px 24px;background:#FFF1E9;border-left:5px solid #FF7F50;border-radius:14px;">
            <strong style="display:block;margin-bottom:9px;font-size:16px;">What needs to be updated</strong>
            <span style="color:#526663;font-size:15px;line-height:1.7;">${safeReason}</span>
          </div>
          <p style="margin:0 0 24px;color:#526663;font-size:15px;line-height:1.7;">Don’t worry — you can update your information and submit your application again for review.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:12px;background:#FF7F50;">
            <a href="${applicationUrl}" style="display:inline-block;padding:15px 34px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Update &amp; Resubmit Application</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#526663;font-size:14px;line-height:1.7;text-align:center;">Once you resubmit, our team will review your application again and email you when it’s ready. Need help? The Mismish team is here to support you.</p>
        </td></tr>
        <tr><td style="padding:22px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          Good food. Great deals. Less waste.<br /><strong>The Mismish Team</strong>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
};

export const sendVendorSuspensionEmail = async (
  to: string,
  vendorName: string,
  reason: string,
): Promise<void> => {
  const resend = getResend();
  const dashboardUrl = getDashboardUrl(PRODUCTION_DASHBOARD_URL);
  const loginUrl = `${dashboardUrl}/merchant/login`;
  const logoUrl = `${dashboardUrl}/logo.png`;
  const safeName = escapeHtml(vendorName);
  const safeReason = escapeHtml(reason).replace(/\r?\n/g, "<br />");

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: "Your Mismish merchant account has been temporarily suspended",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#FFF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#173B38;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(25,91,85,0.10);">
        <tr><td style="background:#195B55;padding:34px 36px;text-align:center;">
          <div style="display:inline-block;padding:12px 18px;background:#ffffff;border-radius:14px;"><img src="${logoUrl}" alt="Mismish" height="40" style="display:block;max-width:190px;" /></div>
          <p style="margin:22px 0 0;color:#FFD9C8;font-size:15px;font-weight:700;">Account notice</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;">Your account is temporarily suspended</h1>
        </td></tr>
        <tr><td style="padding:40px 44px 28px;">
          <h2 style="margin:0 0 14px;font-size:24px;">Hi ${safeName},</h2>
          <p style="margin:0 0 18px;color:#526663;font-size:16px;line-height:1.7;">
            Your <strong>Mismish merchant account has been temporarily suspended</strong> and your store is currently unavailable to customers.
          </p>
          <div style="margin:26px 0;padding:22px 24px;background:#FFF1E9;border-left:5px solid #FF7F50;border-radius:14px;">
            <strong style="display:block;margin-bottom:9px;font-size:16px;">What happened</strong>
            <span style="color:#526663;font-size:15px;line-height:1.7;">${safeReason}</span>
          </div>
          <p style="margin:0 0 24px;color:#526663;font-size:15px;line-height:1.7;">To restore your account, please review the issue and provide the required information or make the necessary changes.</p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr><td style="border-radius:12px;background:#FF7F50;">
            <a href="${loginUrl}" style="display:inline-block;padding:15px 34px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Resolve Issue</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#526663;font-size:14px;line-height:1.7;text-align:center;">Once submitted, our team will review your account again and email you as soon as there’s an update. If you believe this was a mistake, please contact the Mismish team.</p>
        </td></tr>
        <tr><td style="padding:22px 36px 30px;border-top:1px solid #f0f0f0;color:#8B9996;font-size:13px;text-align:center;">
          Good food. Great deals. Less waste.<br /><strong>The Mismish Team</strong>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
};
