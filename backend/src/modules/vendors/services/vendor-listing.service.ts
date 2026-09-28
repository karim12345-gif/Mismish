import { AppError } from "../../../shared/lib/AppError";
import { reschedulePickupRemindersForListing } from "../../../shared/lib/notificationScheduler";
import prisma from "../../../shared/lib/prisma";
import { notifyFavorites } from "./favorite-notification.service";
import {
  favoriteOfferCopy,
  favoritePriceDropCopy,
  localizedStoreName,
} from "../../../shared/notifications/notification-copy";

type CreateListingInput = {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  pickupStart: string;
  pickupEnd: string;
  allergens?: string[];
  ingredients?: string[];
};

type UpdateListingInput = Partial<CreateListingInput>;

export const getMyListings = async (vendorId: number) =>
  prisma.surpriseBox.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

export const createListing = async (
  vendorId: number,
  data: CreateListingInput,
) => {
  const start = new Date(data.pickupStart);
  const end = new Date(data.pickupEnd);
  if (end <= start) {
    throw new AppError(400, "pickupEnd must be after pickupStart");
  }

  const [listing, vendor] = await Promise.all([
    prisma.surpriseBox.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        originalPrice: data.originalPrice,
        quantity: data.quantity,
        allergens: data.allergens,
        ingredients: data.ingredients,
        pickupStart: start,
        pickupEnd: end,
        vendorId,
      },
    }),
    prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { name: true, nameArabic: true },
    }),
  ]);

  const store = vendor ?? { name: "A favorite store", nameArabic: "متجر مفضل" };
  const notificationResult = await notifyFavorites(vendorId, (language) => ({
    ...favoriteOfferCopy(
      language,
      localizedStoreName(language, store),
      listing.name,
      listing.price,
    ),
    data: {
      eventType: "favorite_offer",
      vendorId,
      listingId: listing.id,
      deepLink: `mismish://stores/${vendorId}/offers/${listing.id}`,
    },
  }));

  console.info("[push] favorite offer delivery", {
    vendorId,
    listingId: listing.id,
    ...notificationResult,
  });

  if (notificationResult.accepted > 0) {
    await prisma.surpriseBox.update({
      where: { id: listing.id },
      data: { notifiedFollowersAt: new Date() },
    });
  }

  return listing;
};

export const updateListing = async (
  vendorId: number,
  listingId: number,
  data: UpdateListingInput,
) => {
  const listing = await prisma.surpriseBox.findUnique({
    where: { id: listingId },
  });
  if (!listing) throw new AppError(404, "Listing not found");
  if (listing.vendorId !== vendorId) {
    throw new AppError(403, "Not your listing");
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.allergens !== undefined) updateData.allergens = data.allergens;
  if (data.ingredients !== undefined) updateData.ingredients = data.ingredients;
  if (data.pickupStart) updateData.pickupStart = new Date(data.pickupStart);
  if (data.pickupEnd) updateData.pickupEnd = new Date(data.pickupEnd);

  const updated = await prisma.surpriseBox.update({
    where: { id: listingId },
    data: updateData,
  });

  if (data.pickupStart || data.pickupEnd) {
    await reschedulePickupRemindersForListing(listingId);
  }

  if (data.price !== undefined && data.price < listing.price) {
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { name: true, nameArabic: true },
    });
    const store = vendor ?? {
      name: "a store you follow",
      nameArabic: "متجر تتابعه",
    };
    await notifyFavorites(vendorId, (language) => ({
      ...favoritePriceDropCopy(
        language,
        localizedStoreName(language, store),
        data.price!,
      ),
      data: {
        eventType: "favorite_price_drop",
        vendorId,
        listingId,
        deepLink: `mismish://stores/${vendorId}/offers/${listingId}`,
      },
    }));
  }

  return updated;
};

export const deleteListing = async (
  vendorId: number,
  listingId: number,
): Promise<void> => {
  const listing = await prisma.surpriseBox.findUnique({
    where: { id: listingId },
  });
  if (!listing) throw new AppError(404, "Listing not found");
  if (listing.vendorId !== vendorId) {
    throw new AppError(403, "Not your listing");
  }

  const orderCount = await prisma.order.count({
    where: { surpriseBoxId: listingId },
  });
  if (orderCount > 0) {
    throw new AppError(
      409,
      "Cannot delete listing while orders reference it. Cancel or complete related orders first.",
      "listing_has_orders",
    );
  }

  await prisma.surpriseBox.delete({ where: { id: listingId } });
};
