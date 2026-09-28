import assert from "node:assert/strict";
import test from "node:test";
import { AppError } from "../src/shared/lib/AppError";
import { phoneRegex } from "../src/shared/lib/sms";
import {
  assertInitialOtpRequestAllowed,
  assertOtpResendAllowed,
  otpCooldownRemainingMs,
} from "../src/modules/auth/services/otp-policy";

const now = new Date("2026-09-02T12:00:00.000Z");

test("accepts valid international E.164 phone numbers", () => {
  assert.equal(phoneRegex.test("+966546725578"), true);
  assert.equal(phoneRegex.test("+14155552671"), true);
  assert.equal(phoneRegex.test("+442071838750"), true);
  assert.equal(phoneRegex.test("0546725578"), false);
});

test("calculates the remaining OTP cooldown", () => {
  assert.equal(
    otpCooldownRemainingMs(new Date(now.getTime() - 20_000), now),
    40_000,
  );
  assert.equal(
    otpCooldownRemainingMs(new Date(now.getTime() - 61_000), now),
    0,
  );
});

test("blocks duplicate initial requests while a code remains active", () => {
  assert.throws(
    () =>
      assertInitialOtpRequestAllowed(
        {
          lastOtpSentAt: new Date(now.getTime() - 61_000),
          otpExpiresAt: new Date(now.getTime() + 60_000),
        },
        now,
      ),
    (error) => error instanceof AppError && error.code === "otp_already_active",
  );
});

test("allows a resend only after the cooldown", () => {
  assert.throws(
    () =>
      assertOtpResendAllowed(
        {
          lastOtpSentAt: new Date(now.getTime() - 10_000),
          otpExpiresAt: new Date(now.getTime() + 60_000),
        },
        now,
      ),
    (error) => error instanceof AppError && error.code === "otp_cooldown_active",
  );

  assert.doesNotThrow(() =>
    assertOtpResendAllowed(
      {
        lastOtpSentAt: new Date(now.getTime() - 61_000),
        otpExpiresAt: new Date(now.getTime() + 60_000),
      },
      now,
    ),
  );
});
