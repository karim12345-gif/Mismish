import { notificationService } from "../../../shared/lib/notificationService";
import prisma from "../../../shared/lib/prisma";
import {
  notificationLanguage,
  type NotificationLanguage,
} from "../../../shared/notifications/notification-copy";

type FavoriteNotification = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type FavoriteNotificationResult = {
  favorites: number;
  tokens: number;
  accepted: number;
  failed: number;
};

export const notifyFavorites = async (
  vendorId: number,
  messageForLanguage: (
    language: NotificationLanguage,
  ) => FavoriteNotification,
): Promise<FavoriteNotificationResult> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        vendorId,
        user: {
          isBlocked: false,
          pushToken: { not: null },
        },
      },
      include: {
        user: { select: { pushToken: true, preferredLanguage: true } },
      },
    });

    const deliveries = await Promise.all(
      (["en", "ar"] as const).map(async (language) => {
        const message = messageForLanguage(language);
        const tokens = [
          ...new Set(
            favorites
              .filter(
                (favorite) =>
                  notificationLanguage(favorite.user.preferredLanguage) ===
                  language,
              )
              .map((favorite) => favorite.user.pushToken)
              .filter((token): token is string => Boolean(token)),
          ),
        ];
        const eventType =
          typeof message.data?.eventType === "string"
            ? message.data.eventType
            : "favorite_update";

        return notificationService.sendToTokens(
          tokens,
          {
            title: message.title,
            body: message.body,
            eventType,
            recipientType: "USER",
            entityType: "OFFER",
            entityId:
              typeof message.data?.listingId === "number"
                ? message.data.listingId
                : undefined,
            data: message.data,
          },
          100,
        );
      }),
    );

    const delivery = deliveries.reduce(
      (total, result) => ({
        devices: total.devices + result.devices,
        sent: total.sent + result.sent,
        failed: total.failed + result.failed,
      }),
      { devices: 0, sent: 0, failed: 0 },
    );

    return {
      favorites: favorites.length,
      tokens: delivery.devices,
      accepted: delivery.sent,
      failed: delivery.failed,
    };
  } catch (error) {
    console.error("Favorite notification failed:", error);
    return { favorites: 0, tokens: 0, accepted: 0, failed: 0 };
  }
};
