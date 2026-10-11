import { OrderStatus } from "@prisma/client";
import { cancelPickupReminders } from "../../../shared/lib/notificationScheduler";
import { notificationService } from "../../../shared/lib/notificationService";
import prisma from "../../../shared/lib/prisma";
import { VENDOR_PRIVATE_FIELDS_OMIT } from "../../vendors/services/vendor-private-fields";
import { awardOrderPoints } from "../../rewards/rewards.service";

export const devSetOrderStatus = async (
  orderId: number,
  status: OrderStatus,
) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "COMPLETED" ? { pickupStatus: "COLLECTED" } : {}),
    },
    include: {
      surpriseBox: { include: { vendor: { omit: VENDOR_PRIVATE_FIELDS_OMIT } } },
    },
  });

  if (["COMPLETED", "CANCELLED", "DELIVERED"].includes(status)) {
    cancelPickupReminders(orderId);
  }

  if (status === "COMPLETED") {
    await notificationService.sendOrderCompleted(orderId);
    await awardOrderPoints(order.id);
  }

  return order;
};
