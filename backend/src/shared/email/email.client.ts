import { Resend } from "resend";

export const getResend = (): Resend => {
  const standardKey = process.env.RESEND_API_KEY?.trim();
  const legacyKey = process.env["mismish-production-email"]?.trim();
  const configuredKey = standardKey || legacyKey;
  const keySource = standardKey ? "RESEND_API_KEY" : "mismish-production-email";
  const apiKey = configuredKey?.trim().replace(/^(["'])(.*)\1$/, "$2");

  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  console.info(`[email] Resend key loaded from ${keySource}`);
  return new Resend(apiKey);
};

export const getEmailFrom = (): string =>
  process.env.EMAIL_FROM ?? "Mismish <no-reply@mismish.net>";

export const getDashboardUrl = (fallback: string): string =>
  process.env.DASHBOARD_URL ?? fallback;

export const escapeHtml = (value: string): string =>
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
