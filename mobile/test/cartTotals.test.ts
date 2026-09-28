import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCartLineTotal,
  calculateCartSubtotal,
} from "../src/utils/cartTotals";

test("calculates a cart line using its quantity", () => {
  assert.equal(calculateCartLineTotal({ price: 60, quantity: 2 }), 120);
});

test("adds every cart line into the subtotal", () => {
  assert.equal(
    calculateCartSubtotal([
      { price: 60, quantity: 2 },
      { price: 15, quantity: 1 },
    ]),
    135,
  );
});
