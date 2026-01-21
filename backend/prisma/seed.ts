import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Vendor 1: Cairo Tower (30.0459, 31.2243)
  const vendor1 = await prisma.vendor.create({
    data: {
      email: 'vendor1@example.com',
      password,
      name: 'Cairo Kitchen',
      latitude: 30.0459,
      longitude: 31.2243,
      listings: {
        create: {
          name: 'Mystery Box',
          price: 50,
          quantity: 5,
          pickupStart: new Date(),
          pickupEnd: new Date(Date.now() + 86400000), // Tomorrow
        },
      },
    },
  });

  // Vendor 2: Alexandria Library (31.2089, 29.9092)
  const vendor2 = await prisma.vendor.create({
    data: {
      email: 'vendor2@example.com',
      password,
      name: 'Alex Seafood',
      latitude: 31.2089,
      longitude: 29.9092,
      listings: {
        create: {
          name: 'Seafood Box',
          price: 100,
          quantity: 3,
          pickupStart: new Date(),
          pickupEnd: new Date(Date.now() + 86400000),
        },
      },
    },
  });

  console.log({ vendor1, vendor2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
