import assert from "node:assert/strict";
import test from "node:test";
import {
  assertDatabaseEnvironmentSafety,
  isLocalDatabaseUrl,
} from "../src/config/environment";

const localDatabaseUrl =
  "postgresql://mismish:mismish_local@127.0.0.1:5433/mismish_local?schema=public";

test("recognizes the dedicated local database", () => {
  assert.equal(isLocalDatabaseUrl(localDatabaseUrl), true);
});

test("allows local mode to use only the dedicated local database", () => {
  assert.doesNotThrow(() =>
    assertDatabaseEnvironmentSafety("local", localDatabaseUrl),
  );
  assert.throws(
    () =>
      assertDatabaseEnvironmentSafety(
        "local",
        "prisma+postgres://accelerate.prisma-data.net/?api_key=secret",
      ),
    /Refusing to connect/,
  );
  assert.throws(
    () =>
      assertDatabaseEnvironmentSafety(
        "local",
        "postgresql://user:password@example.com:5432/production",
      ),
    /Refusing to connect/,
  );
});

test("does not prevent staging or production from using managed databases", () => {
  assert.doesNotThrow(() =>
    assertDatabaseEnvironmentSafety(
      "staging",
      "postgresql://user:password@staging.example.com:5432/mismish_staging",
    ),
  );
  assert.doesNotThrow(() =>
    assertDatabaseEnvironmentSafety(
      "production",
      "prisma+postgres://accelerate.prisma-data.net/?api_key=secret",
    ),
  );
});

