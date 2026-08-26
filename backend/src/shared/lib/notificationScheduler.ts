import prisma from "./prisma";
import {
  getPickupReminderDefinition,
  notificationService,
  type PickupReminderKind,
} from "./notificationService";

type SchedulableOrder = {
  id: number;
  deliveryMethod: "PICKUP" | "DELIVERY";
  pickupOneHourReminderSentAt: Date | null;
  pickupFifteenMinuteReminderSentAt: Date | null;
  surpriseBox: { pickupStart: Date };
};

const reminderTimers = new Map<string, NodeJS.Timeout>();
const reminderKinds: PickupReminderKind[] = ["oneHour", "fifteenMinutes"];

const timerKey = (orderId: number, kind: PickupReminderKind) =>
  `${orderId}:${kind}`;

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

  for (const kind of reminderKinds) {
    const definition = getPickupReminderDefinition(kind);
    if (order[definition.sentField]) continue;

    const scheduledPickupStartMs = order.surpriseBox.pickupStart.getTime();
    const delay = scheduledPickupStartMs - definition.offsetMs - Date.now();
    if (delay <= 0) continue;

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
          scheduledPickupStartMs,
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
    select: {
      id: true,
      deliveryMethod: true,
      pickupOneHourReminderSentAt: true,
      pickupFifteenMinuteReminderSentAt: true,
      surpriseBox: { select: { pickupStart: true } },
    },
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
    select: {
      id: true,
      deliveryMethod: true,
      pickupOneHourReminderSentAt: true,
      pickupFifteenMinuteReminderSentAt: true,
      surpriseBox: { select: { pickupStart: true } },
    },
  });

  orders.forEach(schedulePickupReminders);
}

export async function reSchedulePendingNotifications(): Promise<void> {
  const pendingOrders = await prisma.order.findMany({
    where: {
      deliveryMethod: "PICKUP",
      status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      pickupStatus: "PENDING",
      surpriseBox: { pickupStart: { gt: new Date() } },
      OR: [
        { pickupOneHourReminderSentAt: null },
        { pickupFifteenMinuteReminderSentAt: null },
      ],
    },
    select: {
      id: true,
      deliveryMethod: true,
      pickupOneHourReminderSentAt: true,
      pickupFifteenMinuteReminderSentAt: true,
      surpriseBox: { select: { pickupStart: true } },
    },
  });

  console.info(
    `[Scheduler] Startup: re-scheduling ${pendingOrders.length} order(s)`,
  );

  pendingOrders.forEach(schedulePickupReminders);
}
