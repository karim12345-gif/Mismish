"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const AppError_1 = require("../src/shared/lib/AppError");
const sms_1 = require("../src/shared/lib/sms");
const otp_policy_1 = require("../src/modules/auth/services/otp-policy");
const now = new Date("2026-09-02T12:00:00.000Z");
(0, node_test_1.default)("accepts valid international E.164 phone numbers", () => {
    strict_1.default.equal(sms_1.phoneRegex.test("+966546725578"), true);
    strict_1.default.equal(sms_1.phoneRegex.test("+14155552671"), true);
    strict_1.default.equal(sms_1.phoneRegex.test("+442071838750"), true);
    strict_1.default.equal(sms_1.phoneRegex.test("0546725578"), false);
});
(0, node_test_1.default)("calculates the remaining OTP cooldown", () => {
    strict_1.default.equal((0, otp_policy_1.otpCooldownRemainingMs)(new Date(now.getTime() - 20000), now), 40000);
    strict_1.default.equal((0, otp_policy_1.otpCooldownRemainingMs)(new Date(now.getTime() - 61000), now), 0);
});
(0, node_test_1.default)("blocks duplicate initial requests while a code remains active", () => {
    strict_1.default.throws(() => (0, otp_policy_1.assertInitialOtpRequestAllowed)({
        lastOtpSentAt: new Date(now.getTime() - 61000),
        otpExpiresAt: new Date(now.getTime() + 60000),
    }, now), (error) => error instanceof AppError_1.AppError && error.code === "otp_already_active");
});
(0, node_test_1.default)("allows a resend only after the cooldown", () => {
    strict_1.default.throws(() => (0, otp_policy_1.assertOtpResendAllowed)({
        lastOtpSentAt: new Date(now.getTime() - 10000),
        otpExpiresAt: new Date(now.getTime() + 60000),
    }, now), (error) => error instanceof AppError_1.AppError && error.code === "otp_cooldown_active");
    strict_1.default.doesNotThrow(() => (0, otp_policy_1.assertOtpResendAllowed)({
        lastOtpSentAt: new Date(now.getTime() - 61000),
        otpExpiresAt: new Date(now.getTime() + 60000),
    }, now));
});
