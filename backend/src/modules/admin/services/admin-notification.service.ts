import { Prisma } from "@prisma/client";
import { notificationService } from "../../../shared/lib/notificationService";
import prisma from "../../../shared/lib/prisma";
import { logAdminAction } from "./admin-audit.service";

type NotificationAudience = "all-users" | "active-users" | "past-orders";

type SendNotificationInput = {
  type: "marketing" | "order" | "announcement";
  audience: NotificationAudience;
  title: string;
  message: string;
  imageUrl?: string;
};

export const sendNotification = async (
  adminId: number,
  input: SendNotificationInput,
) => {
  const where: Prisma.UserWhereInput = {
    isBlocked: false,
    pushToken: { not: null },
  };

  if (input.audience === "past-orders") {
    where.orders = { some: {} };
  }

  if (input.audience === "active-users") {
    where.orders = {
      some: {
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true, pushToken: true },
  });

  const tokens = [
    ...new Set(
      users
        .map((user) => user.pushToken)
        .filter((token): token is string => Boolean(token)),
    ),
  ];

  const delivery = await notificationService.sendToTokens(tokens, {
    title: input.title,
    body: input.message,
    imageUrl: input.imageUrl || undefined,
    eventType: "admin_campaign",
    recipientType: "USER",
    entityType: "CAMPAIGN",
    data: {
      notificationType: input.type,
      deepLink: "mismish://home",
    },
  });

  const result = {
    audience: input.audience,
    eligibleUsers: users.length,
    devices: delivery.devices,
    sent: delivery.sent,
    failed: delivery.failed,
    skipped: users.length - tokens.length,
  };

  await logAdminAction(
    adminId,
    "notification.campaign_sent",
    "Notification",
    undefined,
    {
      type: input.type,
      title: input.title,
      ...result,
    },
  );

  console.info("[push] admin campaign delivery", result);

  return result;
};
