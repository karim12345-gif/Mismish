"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const order_status_policy_1 = require("../src/modules/orders/services/order-status-policy");
(0, node_test_1.default)("allows the merchant pickup workflow", () => {
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("PENDING", "CONFIRMED"), true);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("CONFIRMED", "READY_FOR_PICKUP"), true);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("READY_FOR_PICKUP", "COMPLETED"), true);
});
(0, node_test_1.default)("allows cancellation before a terminal state", () => {
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("PENDING", "CANCELLED"), true);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("CONFIRMED", "CANCELLED"), true);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("READY_FOR_PICKUP", "CANCELLED"), true);
});
(0, node_test_1.default)("rejects backwards and terminal-state transitions", () => {
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("COMPLETED", "PENDING"), false);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("CANCELLED", "CONFIRMED"), false);
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("READY_FOR_PICKUP", "PENDING"), false);
});
(0, node_test_1.default)("treats repeated status updates as idempotent", () => {
    strict_1.default.equal((0, order_status_policy_1.isAllowedOrderTransition)("CONFIRMED", "CONFIRMED"), true);
});
