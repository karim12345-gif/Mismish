import prisma from "./prisma";
import {
  getPickupReminderDefinition,
  notificationService,
  type PickupReminderKind,
} from "./notificationService";

type SchedulableOrder = {
  id: number;
  deliveryMethod: "PICKUP" | "DELIVERY";
  pickupReminderSentAt: Date | null;
  pickupFifteenMinuteReminderSentAt: Date | null;
  pickupWindowEnd?: Date | null;
  surpriseBox: { pickupEnd: Date };
};

const reminderTimers = new Map<string, NodeJS.Timeout>();
const reminderKinds: PickupReminderKind[] = [
  "thirtyMinutes",
  "fifteenMinutes",
];

const timerKey = (orderId: number, kind: PickupReminderKind) =>
  `${orderId}:${kind}`;

/** Effective pickup end: persisted window (today/tomorrow offset) or listing pickupEnd. */
export function resolvePickupWindowEnd(order: SchedulableOrder): Date {
  return order.pickupWindowEnd ?? order.surpriseBox.pickupEnd;
}

export function cancelPickupReminders(orderId: number): void {
  for (const kind of reminderKinds) {
    const key = timerKey(orderId, kind);
    const timer = reminderTimers.get(key);
    if (timer) clearTimeout(timer);
    reminderTimers.delete(key);
  }
}

export function schedulePickupReminders(order: SchedulableOrder): void {
  cancelPickupReminders(order.id);
  if (order.deliveryMethod !== "PICKUP") return;

  const now = Date.now();
  const scheduledPickupEndMs = resolvePickupWindowEnd(order).getTime();
  const remainingMs = scheduledPickupEndMs - now;
  if (remainingMs <= 0) return;

  const fifteenMinuteOffsetMs = getPickupReminderDefinition(
    "fifteenMinutes",
  ).offsetMs;

  for (const kind of reminderKinds) {
    const definition = getPickupReminderDefinition(kind);
    if (order[definition.sentField]) continue;

    // Inside the final 15-minute window, send only the urgent reminder.
    if (kind === "thirtyMinutes" && remainingMs <= fifteenMinuteOffsetMs) {
      continue;
    }

    const delay = Math.max(0, remainingMs - definition.offsetMs);

    const key = timerKey(order.id, kind);
    console.info(
      `[Scheduler] Order #${order.id}: ${kind} reminder in ${Math.ceil(delay / 60000)} min`,
    );

    const timer = setTimeout(async () => {
      reminderTimers.delete(key);

      try {
        const result = await notificationService.sendPickupReminder(
          order.id,
          kind,
          scheduledPickupEndMs,
        );

        if (result.outcome === "reschedule") {
          await reschedulePickupRemindersForOrder(order.id);
          return;
        }

        console.info(`[Scheduler] Order #${order.id}: ${kind}`, result);
      } catch (error) {
        console.error(
          `[Scheduler] Order #${order.id} ${kind} reminder failed:`,
          error,
        );
      }
    }, delay);

    reminderTimers.set(key, timer);
  }
}

const orderReminderSelect = {
  id: true,
  deliveryMethod: true,
  pickupReminderSentAt: true,
  pickupFifteenMinuteReminderSentAt: true,
  pickupWindowEnd: true,
  surpriseBox: { select: { pickupEnd: true } },
} as const;

export async function reschedulePickupRemindersForOrder(
  orderId: number,
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deliveryMethod: "PICKUP",
      status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      pickupStatus: "PENDING",
    },
    select: orderReminderSelect,
  });

  if (!order) {
    cancelPickupReminders(orderId);
    return;
  }

  schedulePickupReminders(order);
}

export async function reschedulePickupRemindersForListing(
  listingId: number,
): Promise<void> {
  const orders = await prisma.order.findMany({
    where: {
      surpriseBoxId: listingId,
      deliveryMethod: "PICKUP",
      status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      pickupStatus: "PENDING",
    },
    select: orderReminderSelect,
  });

  orders.forEach(schedulePickupReminders);
}

export async function reSchedulePendingNotifications(): Promise<void> {
  const now = new Date();
  const pendingOrders = await prisma.order.findMany({
    where: {
      deliveryMethod: "PICKUP",
      status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      pickupStatus: "PENDING",
      OR: [
        { pickupWindowEnd: { gt: now } },
        {
          pickupWindowEnd: null,
          surpriseBox: { pickupEnd: { gt: now } },
        },
      ],
      AND: [
        {
          OR: [
            { pickupReminderSentAt: null },
            { pickupFifteenMinuteReminderSentAt: null },
          ],
        },
      ],
    },
    select: orderReminderSelect,
  });

  console.info(
    `[Scheduler] Startup: re-scheduling ${pendingOrders.length} order(s)`,
  );

  pendingOrders.forEach(schedulePickupReminders);
}
