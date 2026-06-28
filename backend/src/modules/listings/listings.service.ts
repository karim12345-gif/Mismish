import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

export const getNearbyListings = async (
  lat: number,
  lng: number,
  radius: number,
) =>
  prisma.$queryRaw`
    SELECT
      sb.id,
      sb.name,
      sb.description,
      sb.price,
      sb."originalPrice",
      sb."imageUrl",
      sb."pickupStart",
      sb."pickupEnd",
      sb.quantity,
      v.id   AS "vendorId",
      v.name AS "vendorName",
      v.latitude,
      v.longitude,
      (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(v.latitude))
        )
      ) AS distance
    FROM "SurpriseBox" sb
    JOIN "Vendor" v ON sb."vendorId" = v.id
    WHERE
      sb.quantity > 0
      AND sb."pickupEnd" > NOW()
      AND v.status = 'APPROVED'::"VendorStatus"
      AND (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(v.latitude))
        )
      ) < ${radius}
    ORDER BY distance ASC;
  `;

export const getListingById = async (id: number) => {
  if (isNaN(id)) throw new AppError(400, "Invalid listing ID");

  const listing = await prisma.surpriseBox.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          address: true,
          status: true,
        },
      },
    },
  });

  if (!listing || listing.vendor.status !== "APPROVED")
    throw new AppError(404, "Listing not found");
  return listing;
};
