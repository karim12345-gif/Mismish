import type { OrderStatus } from "@prisma/client";
import type { PickupReminderKind } from "./notification.types";

export type NotificationLanguage = "en" | "ar";

export const notificationLanguage = (
  value: string | null | undefined,
): NotificationLanguage => (value === "ar" ? "ar" : "en");

export const localizedStoreName = (
  language: NotificationLanguage,
  store: { name: string; nameArabic?: string | null },
): string =>
  language === "ar" && store.nameArabic?.trim()
    ? store.nameArabic.trim()
    : store.name;

export const favoriteOfferCopy = (
  language: NotificationLanguage,
  storeName: string,
  listingName: string,
  price: number,
) =>
  language === "ar"
    ? {
        title: "🥐 طعام جديد من أحد مطاعمك المفضلة!",
        body: `أضاف ${storeName} ${listingName} بسعر ${price.toFixed(2)} ر.س.`,
      }
    : {
        title: "🥐 New food from one of your favorites!",
        body: `${storeName} just added ${listingName} for ${price.toFixed(2)} SAR.`,
      };

export const favoritePriceDropCopy = (
  language: NotificationLanguage,
  storeName: string,
  price: number,
) =>
  language === "ar"
    ? {
        title: `🔥 تخفيض جديد لدى ${storeName}`,
        body: `خفض ${storeName} سعر الحقيبة إلى ${price.toFixed(2)} ر.س. الكمية محدودة!`,
      }
    : {
        title: `🔥 Price drop at ${storeName}`,
        body: `${storeName} just dropped their bag to SAR ${price.toFixed(2)}. Limited stock!`,
      };

export const orderReceivedCopy = (language: NotificationLanguage) =>
  language === "ar"
    ? {
        title: "تم استلام الطلب",
        body: "استلمنا طلبك، وننتظر تأكيد المتجر.",
      }
    : {
        title: "Order Received",
        body: "We received your order, waiting for store confirmation.",
      };

export const orderStatusCopy = (
  language: NotificationLanguage,
  status: OrderStatus,
  storeName: string,
): { title: string; body: string } | null => {
  if (language === "ar") {
    const arabic: Partial<Record<OrderStatus, { title: string; body: string }>> = {
      CONFIRMED: {
        title: "تم تأكيد الطلب ✅",
        body: `أكد ${storeName} طلبك. يمكنك التوجه للاستلام عندما تكون جاهزاً!`,
      },
      READY_FOR_PICKUP: {
        title: "حقيبتك جاهزة! 🎁",
        body: `حقيبتك المفاجئة من ${storeName} جاهزة للاستلام. لا تفوتها!`,
      },
      ON_THE_WAY: {
        title: "طلبك في الطريق 🛵",
        body: `طلبك من ${storeName} في طريقه إليك!`,
      },
      DELIVERED: {
        title: "تم التوصيل! 🎉",
        body: `تم توصيل طلبك من ${storeName}. بالعافية!`,
      },
      CANCELLED: {
        title: "تم إلغاء الطلب",
        body: `تم إلغاء طلبك من ${storeName}. تواصل مع الدعم إذا احتجت للمساعدة.`,
      },
    };
    return arabic[status] ?? null;
  }

  const english: Partial<Record<OrderStatus, { title: string; body: string }>> = {
    CONFIRMED: {
      title: "Order Confirmed ✅",
      body: `${storeName} confirmed your order. Head over when ready!`,
    },
    READY_FOR_PICKUP: {
      title: "Bag Ready! 🎁",
      body: `Your surprise bag at ${storeName} is ready for pickup. Don't miss it!`,
    },
    ON_THE_WAY: {
      title: "On the way 🛵",
      body: `Your order from ${storeName} is on its way to you!`,
    },
    DELIVERED: {
      title: "Delivered! 🎉",
      body: `Your order from ${storeName} has been delivered. Enjoy!`,
    },
    CANCELLED: {
      title: "Order Cancelled",
      body: `Your order from ${storeName} was cancelled. Contact support if needed.`,
    },
  };
  return english[status] ?? null;
};

export const pickupReminderCopy = (
  language: NotificationLanguage,
  kind: PickupReminderKind,
  storeName: string,
  testMode: boolean,
) => {
  const minutes = kind === "thirtyMinutes" ? (testMode ? 2 : 30) : testMode ? 1 : 15;

  if (language === "ar") {
    return kind === "thirtyMinutes"
      ? {
          title: `بقي ${minutes} دقيقة لاستلام طلبك`,
          body: `يجب استلام طلبك من ${storeName} خلال ${minutes} دقيقة.`,
        }
      : {
          title: "🛍️ اقترب موعد الاستلام!",
          body: `يجب استلام طلبك من ${storeName} خلال ${minutes} دقيقة.`,
        };
  }

  return kind === "thirtyMinutes"
    ? {
        title: `${minutes} minutes left to collect`,
        body: `Your order from ${storeName} must be collected in the next ${minutes} minutes.`,
      }
    : {
        title: "🛍️ Almost pickup time!",
        body: `Your order from ${storeName} must be collected in the next ${minutes} minutes.`,
      };
};

export const orderCompletedCopy = (
  language: NotificationLanguage,
  storeName: string,
) =>
  language === "ar"
    ? {
        title: "✅ تم استلام الطلب!",
        body: `اكتمل طلبك من ${storeName}. شكراً لمساهمتك في إنقاذ الطعام مع مشمش 💚`,
      }
    : {
        title: "✅ Order picked up!",
        body: `Your order from ${storeName} has been completed. Thanks for saving good food with Mismish 💚`,
      };
