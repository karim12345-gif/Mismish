import type { OrderStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import type {
  PickupReminderKind,
  ReminderDeliveryResult,
  SendToToken,
} from "./notification.types";
import {
  localizedStoreName,
  notificationLanguage,
  pickupReminderCopy,
} from "./notification-copy";

const TERMINAL_ORDER_STATUSES = new Set([
  "CANCELLED",
  "COMPLETED",
  "DELIVERED",
  "REFUNDED",
  "REJECTED",
]);

const DATABASE_TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "DELIVERED",
];

const isPickupReminderTestMode = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.PICKUP_REMINDER_TEST_MODE === "true";

export const getPickupReminderDefinition = (kind: PickupReminderKind) => {
  const testMode = isPickupReminderTestMode();

  if (kind === "thirtyMinutes") {
    return {
      sentField: "pickupReminderSentAt" as const,
      offsetMs: (testMode ? 2 : 30) * 60 * 1000,
    };
  }

  return {
    sentField: "pickupFifteenMinuteReminderSentAt" as const,
    offsetMs: (testMode ? 1 : 15) * 60 * 1000,
  };
};

const isTerminalOrder = (status: string, pickupStatus: string) =>
  TERMINAL_ORDER_STATUSES.has(status) ||
  pickupStatus === "COLLECTED" ||
  pickupStatus === "NO_SHOW";

const resolvePickupWindowEnd = (order: {
  pickupWindowEnd: Date | null;
  surpriseBox: { pickupEnd: Date };
}): Date => order.pickupWindowEnd ?? order.surpriseBox.pickupEnd;

const claimPickupReminder = async (
  orderId: number,
  kind: PickupReminderKind,
  scheduledPickupEnd: Date,
  claimedAt: Date,
): Promise<boolean> => {
  // Match either persisted window or legacy listing pickupEnd when window is null.
  const sharedWhere = {
    id: orderId,
    deliveryMethod: "PICKUP" as const,
    status: { notIn: DATABASE_TERMINAL_ORDER_STATUSES },
    pickupStatus: "PENDING" as const,
    OR: [
      { pickupWindowEnd: scheduledPickupEnd },
      {
        pickupWindowEnd: null,
        surpriseBox: { pickupEnd: scheduledPickupEnd },
      },
    ],
  };

  const result =
    kind === "thirtyMinutes"
      ? await prisma.order.updateMany({
          where: {
            ...sharedWhere,
            pickupReminderSentAt: null,
          },
          data: { pickupReminderSentAt: claimedAt },
        })
      : await prisma.order.updateMany({
          where: {
            ...sharedWhere,
            pickupFifteenMinuteReminderSentAt: null,
          },
          data: { pickupFifteenMinuteReminderSentAt: claimedAt },
        });

  return result.count === 1;
};

const releasePickupReminderClaim = async (
  orderId: number,
  kind: PickupReminderKind,
  claimedAt: Date,
): Promise<void> => {
  if (kind === "thirtyMinutes") {
    await prisma.order.updateMany({
      where: { id: orderId, pickupReminderSentAt: claimedAt },
      data: { pickupReminderSentAt: null },
    });
    return;
  }

  await prisma.order.updateMany({
    where: { id: orderId, pickupFifteenMinuteReminderSentAt: claimedAt },
    data: { pickupFifteenMinuteReminderSentAt: null },
  });
};

const reminderOrderSelect = {
  status: true,
  pickupStatus: true,
  deliveryMethod: true,
  pickupWindowEnd: true,
  pickupReminderSentAt: true,
  pickupFifteenMinuteReminderSentAt: true,
  user: {
    select: {
      id: true,
      isBlocked: true,
      pushToken: true,
      preferredLanguage: true,
    },
  },
  surpriseBox: {
    select: {
      pickupEnd: true,
      vendor: { select: { name: true, nameArabic: true } },
    },
  },
} as const;

export const sendPickupReminder = async (
  orderId: number,
  kind: PickupReminderKind,
  scheduledPickupEndMs: number,
  sendToToken: SendToToken,
): Promise<ReminderDeliveryResult> => {
  const definition = getPickupReminderDefinition(kind);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: reminderOrderSelect,
  });

  if (!order) return { outcome: "skipped", reason: "order_not_found" };
  if (order.deliveryMethod !== "PICKUP") {
    return { outcome: "skipped", reason: "not_a_pickup_order" };
  }
  if (isTerminalOrder(order.status, order.pickupStatus)) {
    return { outcome: "skipped", reason: "order_is_terminal" };
  }
  if (order[definition.sentField]) {
    return { outcome: "skipped", reason: "already_sent" };
  }

  const windowEnd = resolvePickupWindowEnd(order);
  if (windowEnd.getTime() !== scheduledPickupEndMs) {
    return { outcome: "reschedule" };
  }
  if (order.user.isBlocked || !order.user.pushToken) {
    return { outcome: "skipped", reason: "no_eligible_device" };
  }

  const claimedAt = new Date();
  const claimed = await claimPickupReminder(
    orderId,
    kind,
    windowEnd,
    claimedAt,
  );

  if (!claimed) {
    return { outcome: "skipped", reason: "already_claimed_or_ineligible" };
  }

  const latest = await prisma.order.findUnique({
    where: { id: orderId },
    select: reminderOrderSelect,
  });

  if (
    !latest ||
    latest.deliveryMethod !== "PICKUP" ||
    isTerminalOrder(latest.status, latest.pickupStatus) ||
    latest.user.isBlocked ||
    !latest.user.pushToken
  ) {
    await releasePickupReminderClaim(orderId, kind, claimedAt);
    return { outcome: "skipped", reason: "order_became_ineligible" };
  }

  if (resolvePickupWindowEnd(latest).getTime() !== scheduledPickupEndMs) {
    await releasePickupReminderClaim(orderId, kind, claimedAt);
    return { outcome: "reschedule" };
  }

  const language = notificationLanguage(latest.user.preferredLanguage);
  const copy = pickupReminderCopy(
    language,
    kind,
    localizedStoreName(language, latest.surpriseBox.vendor),
    isPickupReminderTestMode(),
  );
  const accepted = await sendToToken(latest.user.pushToken, {
    ...copy,
    eventType:
      kind === "thirtyMinutes"
        ? "pickup_reminder_30m"
        : "pickup_reminder_15m",
    recipientType: "USER",
    recipientId: latest.user.id,
    entityType: "ORDER",
    entityId: orderId,
    data: {
      orderId,
      deepLink: `mismish://orders/${orderId}`,
    },
  });

  if (!accepted) {
    await releasePickupReminderClaim(orderId, kind, claimedAt);
    return { outcome: "failed", reason: "provider_rejected" };
  }

  return { outcome: "sent" };
};
