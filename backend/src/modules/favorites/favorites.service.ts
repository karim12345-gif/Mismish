import prisma from "../../shared/lib/prisma";

export const getFavorites = async (userId: number): Promise<number[]> => {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { vendorId: true },
  });
  return rows.map((r) => r.vendorId);
};

/**
 * Toggle a favorite.
 * Returns { favorited: true } when added, { favorited: false } when removed.
 */
export const toggleFavorite = async (
  userId: number,
  vendorId: number,
): Promise<{ favorited: boolean }> => {
  const deleted = await prisma.favorite.deleteMany({
    where: { userId, vendorId },
  });

  if (deleted.count > 0) {
    return { favorited: false };
  }

  try {
    await prisma.favorite.create({ data: { userId, vendorId } });
  } catch (error: any) {
    if (error?.code !== "P2002") {
      throw error;
    }
  }

  return { favorited: true };
};

/**
 * Bulk-sync: replaces the user's full favorites list.
 * Used once on login to migrate AsyncStorage favorites to the DB.
 */
export const syncFavorites = async (
  userId: number,
  vendorIds: number[],
): Promise<number[]> => {
  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId } }),
    prisma.favorite.createMany({
      data: vendorIds.map((vendorId) => ({ userId, vendorId })),
      skipDuplicates: true,
    }),
  ]);
  return vendorIds;
};
