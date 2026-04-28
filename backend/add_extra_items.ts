import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient({ accelerateUrl: process.env.DATABASE_URL });

async function run() {
  const tomorrow = new Date(Date.now() + 86400000);

  try {
    const coffee = await prisma.vendor.findUnique({
      where: { email: "coffeeaddress@mismish.app" },
    });
    if (coffee) {
      const existing = await prisma.surpriseBox.findMany({
        where: { vendorId: coffee.id },
      });
      if (existing.length < 3) {
        await prisma.surpriseBox.createMany({
          data: [
            {
              vendorId: coffee.id,
              name: "V60 Drip Coffee Rescue",
              description:
                "Freshly brewed single-origin drip coffee leftovers.",
              imageUrl:
                "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800",
              price: 12,
              originalPrice: 25,
              quantity: 8,
              pickupStart: new Date(),
              pickupEnd: tomorrow,
            },
            {
              vendorId: coffee.id,
              name: "Signature Flat White",
              description: "End-of-day flat white bundles.",
              imageUrl:
                "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800",
              price: 14,
              originalPrice: 28,
              quantity: 6,
              pickupStart: new Date(),
              pickupEnd: tomorrow,
            },
            {
              vendorId: coffee.id,
              name: "Almond Croissant Batch",
              description: "Freshly baked croissants from this morning.",
              imageUrl:
                "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
              price: 18,
              originalPrice: 40,
              quantity: 4,
              pickupStart: new Date(),
              pickupEnd: tomorrow,
            },
          ],
        });
        console.log("Added coffee items");
      }
    }

    const shawarma = await prisma.vendor.findUnique({
      where: { email: "shawarmahouse@mismish.app" },
    });
    if (shawarma) {
      const existing = await prisma.surpriseBox.findMany({
        where: { vendorId: shawarma.id },
      });
      if (existing.length < 2) {
        await prisma.surpriseBox.createMany({
          data: [
            {
              vendorId: shawarma.id,
              name: "Mixed Appetizers Box",
              description: "Hummus, mutabbal, and fresh bread.",
              imageUrl:
                "https://images.unsplash.com/photo-1529144415895-6aaf8be872fb?w=800",
              price: 15,
              originalPrice: 45,
              quantity: 5,
              pickupStart: new Date(),
              pickupEnd: tomorrow,
            },
            {
              vendorId: shawarma.id,
              name: "Spicy Fries Bucket",
              description: "Leftover spicy fries portions.",
              imageUrl:
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
              price: 10,
              originalPrice: 25,
              quantity: 10,
              pickupStart: new Date(),
              pickupEnd: tomorrow,
            },
          ],
        });
        console.log("Added shawarma items");
      }
    }
  } catch (e) {
    console.error(e);
  }
}
run();
