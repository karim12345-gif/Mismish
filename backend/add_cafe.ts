import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function run() {
  const tomorrow = new Date(Date.now() + 86400000);
  const password = await bcrypt.hash('password123', 10);
  
  try {
    const existing = await prisma.vendor.findUnique({ where: { email: 'coffeeaddress@mismish.app' } });
    if(existing) {
      console.log("Already exists!");
      return;
    }
    
    const vendor = await prisma.vendor.create({
      data: {
        email: 'coffeeaddress@mismish.app',
        password,
        name: 'Coffee Address | عنوان القهوة',
        description: 'Exceptional specialty coffee and pastries.',
        imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800',
        category: 'Café',
        latitude: 24.8197,
        longitude: 46.6083,
        address: 'Coffee Address | عنوان القهوة, King Fahd Rd, Al Malqa, Riyadh 13521',
        listings: {
          create: [
            {
              name: 'Barista Mystery Box',
              description: 'A surprise mix of leftover artisanal pastries and espresso batches.',
              imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800',
              price: 15,
              originalPrice: 45,
              quantity: 15,
              pickupStart: new Date(),
              pickupEnd: tomorrow
            }
          ]
        }
      }
    });
    console.log("Created successfully!");
  } catch(e) {
    console.error(e);
  }
}
run();
