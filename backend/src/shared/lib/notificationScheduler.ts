/**
 * Event-driven notification scheduler.
 *
 * Instead of polling every N minutes, each event (listing created, order placed)
 * schedules its own setTimeout for the exact right moment. Flags in the DB
 * prevent duplicates and allow re-scheduling on server restart.
 */

import prisma from "./prisma";
import { sendPushNotification } from "./notifications";

// ─── Listing: notify followers when pickup window opens ───────────────────────

export function scheduleListingNotification(listing: {
  id: number;
  pickupStart: Date;
  pickupEnd: Date;
  price: number;
  vendorId: number;
  notifiedFollowersAt: Date | null;
}): void {
  // Already sent
  if (listing.notifiedFollowersAt) return;

  const now = Date.now();
  const fireAt = listing.pickupStart.getTime();
  const delay = fireAt - now;

  // pickupStart already passed — don't notify
  if (delay <= 0) return;

  // pickupEnd already passed — window is over, skip
  if (listing.pickupEnd.getTime() <= now) return;

  console.log(
    `[Scheduler] Listing #${listing.id}: follower push in ${Math.round(delay / 60000)} min`,
  );

  setTimeout(async () => {
    try {
      // Re-check: already sent or listing expired
      const fresh = await prisma.surpriseBox.findUnique({
        where: { id: listing.id },
        select: {
          notifiedFollowersAt: true,
          pickupEnd: true,
          quantity: true,
          price: true,
          vendor: { select: { name: true } },
        },
      });

      if (
        !fresh ||
        fresh.notifiedFollowersAt ||
        fresh.quantity === 0 ||
        fresh.pickupEnd < new Date()
      ) {
        return;
      }

      const storeName = fresh.vendor.name;

      // Get all followers with push tokens
      const favorites = await prisma.favorite.findMany({
        where: { vendorId: listing.vendorId },
        include: { user: { select: { pushToken: true } } },
      });

      const tokens = favorites
        .map((f) => f.user.pushToken)
        .filter((t): t is string => !!t && t.startsWith("ExponentPushToken"));

      // Send in batches of 100
      for (let i = 0; i < tokens.length; i += 100) {
        await Promise.all(
          tokens.slice(i, i + 100).map((to) =>
            sendPushNotification({
              to,
              title: `🎁 ${storeName} bag is available now!`,
              body: `Grab your surprise bag for SAR ${fresh.price.toFixed(2)} before it's gone!`,
              data: { vendorId: listing.vendorId },
            }),
          ),
        );
      }

      // Mark as sent
      await prisma.surpriseBox.update({
        where: { id: listing.id },
        data: { notifiedFollowersAt: new Date() },
      });

      console.log(
        `[Scheduler] Listing #${listing.id}: sent follower push to ${tokens.length} users`,
      );
    } catch (err) {
      console.error(`[Scheduler] Listing #${listing.id} push failed:`, err);
    }
  }, delay);
}

// ─── Order: remind customer 30 min before pickup closes ──────────────────────

export function schedulePickupReminder(order: {
  id: number;
  pickupReminderSentAt: Date | null;
  surpriseBox: {
    pickupEnd: Date;
    vendor: { name: string };
  };
  user: { pushToken: string | null };
}): void {
  if (order.pickupReminderSentAt) return;
  if (!order.user.pushToken) return;

  const now = Date.now();
  const reminderAt = order.surpriseBox.pickupEnd.getTime() - 30 * 60 * 1000;
  const delay = reminderAt - now;

  // Less than 5 min away or already passed — not worth reminding
  if (delay < 5 * 60 * 1000) return;

  console.log(
    `[Scheduler] Order #${order.id}: pickup reminder in ${Math.round(delay / 60000)} min`,
  );

  setTimeout(async () => {
    try {
      const fresh = await prisma.order.findUnique({
        where: { id: order.id },
        select: {
          pickupReminderSentAt: true,
          status: true,
          user: { select: { pushToken: true } },
          surpriseBox: { include: { vendor: { select: { name: true } } } },
        },
      });

      // Already sent, or order is done/cancelled
      if (
        !fresh ||
        fresh.pickupReminderSentAt ||
        ["COMPLETED", "CANCELLED", "DELIVERED"].includes(fresh.status)
      ) {
        return;
      }

      const token = fresh.user.pushToken;
      if (!token) return;

      await sendPushNotification({
        to: token,
        title: "⏰ Pickup closing soon!",
        body: `Your ${fresh.surpriseBox.vendor.name} bag expires in 30 minutes. Don't miss it!`,
        data: { orderId: order.id },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { pickupReminderSentAt: new Date() },
      });

      console.log(`[Scheduler] Order #${order.id}: pickup reminder sent`);
    } catch (err) {
      console.error(`[Scheduler] Order #${order.id} reminder failed:`, err);
    }
  }, delay);
}

// ─── On server startup: re-schedule anything still pending ───────────────────

export async function reSchedulePendingNotifications(): Promise<void> {
  const now = new Date();

  // Listings whose pickup window hasn't opened yet and haven't been notified
  const pendingListings = await prisma.surpriseBox.findMany({
    where: {
      notifiedFollowersAt: null,
      pickupStart: { gt: now },
      pickupEnd: { gt: now },
      quantity: { gt: 0 },
    },
    select: {
      id: true,
      pickupStart: true,
      pickupEnd: true,
      price: true,
      vendorId: true,
      notifiedFollowersAt: true,
    },
  });

  // Active orders whose reminder hasn't been sent and pickup ends in the future
  const pendingOrders = await prisma.order.findMany({
    where: {
      pickupReminderSentAt: null,
      status: { notIn: ["COMPLETED", "CANCELLED", "DELIVERED"] },
      surpriseBox: { pickupEnd: { gt: now } },
    },
    select: {
      id: true,
      pickupReminderSentAt: true,
      user: { select: { pushToken: true } },
      surpriseBox: {
        select: {
          pickupEnd: true,
          vendor: { select: { name: true } },
        },
      },
    },
  });

  console.log(
    `[Scheduler] Startup: re-scheduling ${pendingListings.length} listing(s) and ${pendingOrders.length} order reminder(s)`,
  );

  pendingListings.forEach((l) => scheduleListingNotification(l));
  pendingOrders.forEach((o) => schedulePickupReminder(o));
}
