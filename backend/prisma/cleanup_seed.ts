import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  const seededVendors = await prisma.vendor.findMany({
    where: { email: { endsWith: "@mismish.app" } },
    select: { id: true, name: true },
  });

  if (seededVendors.length === 0) {
    console.log("No seeded vendors found — nothing to delete.");
    return;
  }

  const vendorIds = seededVendors.map((v) => v.id);
  console.log(`Found ${seededVendors.length} seeded vendors:`, seededVendors.map((v) => v.name));

  // Delete in FK order: reviews → orders → listings → vendors
  const deletedReviews = await prisma.review.deleteMany({ where: { vendorId: { in: vendorIds } } });
  console.log(`Deleted ${deletedReviews.count} reviews`);

  const boxes = await prisma.surpriseBox.findMany({
    where: { vendorId: { in: vendorIds } },
    select: { id: true },
  });
  const boxIds = boxes.map((b) => b.id);

  const deletedOrders = await prisma.order.deleteMany({ where: { surpriseBoxId: { in: boxIds } } });
  console.log(`Deleted ${deletedOrders.count} orders`);

  const deletedListings = await prisma.surpriseBox.deleteMany({ where: { vendorId: { in: vendorIds } } });
  console.log(`Deleted ${deletedListings.count} listings`);

  const deletedVendors = await prisma.vendor.deleteMany({ where: { id: { in: vendorIds } } });
  console.log(`Deleted ${deletedVendors.count} vendors`);

  console.log("✅ Done — seed data removed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
