import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { VENDOR_PRIVATE_FIELDS_OMIT } from "../src/modules/vendors/services/vendor-private-fields";

const SECRET_FIELD = /password|token|secret|otp|iban|payout/i;

test("vendor omit list covers credentials and reset state", () => {
  assert.deepEqual(
    { ...VENDOR_PRIVATE_FIELDS_OMIT },
    { password: true, passwordResetToken: true, passwordResetExpiresAt: true },
  );
});

test("every secret-looking Vendor column is omitted", () => {
  const vendorFields = Object.values(Prisma.VendorScalarFieldEnum) as string[];
  const secretFields = vendorFields.filter((field) => SECRET_FIELD.test(field));
  assert.ok(secretFields.includes("password"));
  for (const field of secretFields) {
    assert.equal(
      (VENDOR_PRIVATE_FIELDS_OMIT as Record<string, boolean>)[field],
      true,
      `Vendor.${field} must be in VENDOR_PRIVATE_FIELDS_OMIT`,
    );
  }
});

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });

test("no query includes a full Vendor, User or Admin record", () => {
  const offenders = sourceFiles(join(__dirname, "../src")).flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /\b(vendor|user|admin)\s*:\s*true\b/.test(line))
      .map(({ index }) => `${file}:${index + 1}`),
  );
  assert.deepEqual(offenders, []);
});

test("customer order responses and the admin vendor list apply the omit", () => {
  const files = [
    "../src/modules/orders/services/order-query.service.ts",
    "../src/modules/orders/services/order-command.service.ts",
    "../src/modules/orders/services/order-dev.service.ts",
    "../src/modules/admin/services/admin-query.service.ts",
  ];
  for (const file of files) {
    assert.match(readFileSync(join(__dirname, file), "utf8"), /omit: VENDOR_PRIVATE_FIELDS_OMIT/, file);
  }
});
