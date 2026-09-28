import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedOrderTransition } from "../src/modules/orders/services/order-status-policy";

test("allows the merchant pickup workflow", () => {
  assert.equal(isAllowedOrderTransition("PENDING", "CONFIRMED"), true);
  assert.equal(
    isAllowedOrderTransition("CONFIRMED", "READY_FOR_PICKUP"),
    true,
  );
  assert.equal(
    isAllowedOrderTransition("READY_FOR_PICKUP", "COMPLETED"),
    true,
  );
});

test("allows cancellation before a terminal state", () => {
  assert.equal(isAllowedOrderTransition("PENDING", "CANCELLED"), true);
  assert.equal(isAllowedOrderTransition("CONFIRMED", "CANCELLED"), true);
  assert.equal(
    isAllowedOrderTransition("READY_FOR_PICKUP", "CANCELLED"),
    true,
  );
});

test("rejects backwards and terminal-state transitions", () => {
  assert.equal(isAllowedOrderTransition("COMPLETED", "PENDING"), false);
  assert.equal(isAllowedOrderTransition("CANCELLED", "CONFIRMED"), false);
  assert.equal(isAllowedOrderTransition("READY_FOR_PICKUP", "PENDING"), false);
});

test("treats repeated status updates as idempotent", () => {
  assert.equal(isAllowedOrderTransition("CONFIRMED", "CONFIRMED"), true);
});
