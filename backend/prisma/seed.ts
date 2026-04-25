import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Always relative to NOW so re-running the seed keeps listings active
  const inTwoHours   = new Date(Date.now() + 2  * 60 * 60 * 1000);
  const inFourHours  = new Date(Date.now() + 4  * 60 * 60 * 1000);
  const inSixHours   = new Date(Date.now() + 6  * 60 * 60 * 1000);
  const tomorrow     = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Wipe listings first so re-running doesn't produce duplicates or stale dates
  await prisma.surpriseBox.deleteMany({});

  const vendorData = [
    {
      email: 'alolayabakery@mismish.app',
      name: 'Al Olaya Bakery',
      description: 'Artisan Arabic breads and pastries baked fresh every morning in the heart of Al Olaya.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
      category: 'Bakery',
      latitude: 24.6916,
      longitude: 46.6831,
      address: 'Tahlia St, Al Olaya, Riyadh',
      listings: [
        { name: 'Surprise Pastry Box', description: 'A mix of our leftover Arabic pastries — ka\'ak, baklava, and more. Every box is different!', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', price: 20, originalPrice: 60, quantity: 8, pickupStart: new Date(), pickupEnd: inFourHours },
        { name: 'Bread Mystery Bag', description: 'Assorted breads and buns from today\'s morning bake.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', price: 15, originalPrice: 45, quantity: 5, pickupStart: new Date(), pickupEnd: inSixHours },
      ],
    },
    {
      email: 'qahwahouse@mismish.app',
      name: 'Qahwa House',
      description: 'Specialty Arabic coffee and light bites in Al Malaz.',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      category: 'Café',
      latitude: 24.6763,
      longitude: 46.7291,
      address: 'King Abdullah Rd, Al Malaz, Riyadh',
      listings: [
        { name: 'Coffee & Dates Bundle', description: 'Two specialty coffees and a selection of premium dates and sweets from today.', imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800', price: 25, originalPrice: 70, quantity: 6, pickupStart: new Date(), pickupEnd: inFourHours },
      ],
    },
    {
      email: 'riyadhkitchen@mismish.app',
      name: 'Riyadh Kitchen',
      description: 'Home-style Saudi cooking. We waste nothing and give back to the community.',
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      category: 'Restaurant',
      latitude: 24.7278,
      longitude: 46.6349,
      address: 'Al Nakheel District, Riyadh',
      listings: [
        { name: "Chef's Kabsa Bag", description: 'A full kabsa meal with sides — whatever the chef prepared today. Always delicious.', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', price: 30, originalPrice: 85, quantity: 4, pickupStart: new Date(), pickupEnd: inTwoHours },
      ],
    },
    {
      email: 'nakhilsushi@mismish.app',
      name: 'Nakhil Sushi',
      description: 'Fresh sushi and Japanese bites in the Diplomatic Quarter. End-of-day boxes at a fraction of the price.',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      category: 'Japanese',
      latitude: 24.6866,
      longitude: 46.6330,
      address: 'Diplomatic Quarter, Riyadh',
      listings: [
        { name: 'Sushi Surprise Box', description: '12 pieces of assorted sushi rolls and nigiri from today\'s prep.', imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800', price: 40, originalPrice: 110, quantity: 3, pickupStart: new Date(), pickupEnd: inSixHours },
      ],
    },
    {
      email: 'granadarestaurant@mismish.app',
      name: 'Granada Grill',
      description: "Wood-fired grills and shawarma. Rescue tonight's leftover portions before they go to waste.",
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
      category: 'Grill',
      latitude: 24.7520,
      longitude: 46.7714,
      address: 'Granada Mall area, East Riyadh',
      listings: [
        { name: 'Late Night Grill Bag', description: 'Mixed grill platter — shawarma, kebab, and sides from the evening service.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', price: 25, originalPrice: 75, quantity: 10, pickupStart: new Date(), pickupEnd: tomorrow },
      ],
    },
    // Additional Riyadh vendors for realistic map density
    { email: 'tahliacafe@mismish.app', name: 'Tahlia Café', description: 'Trendy café on Tahlia Street.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', category: 'Café', latitude: 24.6928, longitude: 46.6815, address: 'Tahlia St, Riyadh', listings: [{ name: 'Morning Pastry Bag', description: 'Assorted pastries from the morning batch.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', price: 18, originalPrice: 55, quantity: 6, pickupStart: new Date(), pickupEnd: inFourHours }] },
    { email: 'mursirestaurant@mismish.app', name: 'Mursi Kitchen', description: 'Traditional Najdi cuisine in Al Muraba.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'Restaurant', latitude: 24.6971, longitude: 46.7058, address: 'Al Muraba, Riyadh', listings: [{ name: 'Najdi Meal Box', description: 'Traditional Najdi rice and lamb.', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', price: 28, originalPrice: 80, quantity: 5, pickupStart: new Date(), pickupEnd: inSixHours }] },
    { email: 'yasmeenicecream@mismish.app', name: 'Yasmeen Sweets', description: 'Arabic sweets and ice cream in Al Yasmeen.', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', category: 'Sweets', latitude: 24.7631, longitude: 46.6558, address: 'Al Yasmeen, North Riyadh', listings: [{ name: 'Sweet Surprise Box', description: 'Assorted Arabic sweets and kunafa.', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', price: 22, originalPrice: 65, quantity: 7, pickupStart: new Date(), pickupEnd: inSixHours }] },
    { email: 'shifapizza@mismish.app', name: 'Al Shifa Pizza', description: 'Wood-fired pizza in Al Shifa district.', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', category: 'Pizza', latitude: 24.6268, longitude: 46.7171, address: 'Al Shifa, South Riyadh', listings: [{ name: 'Pizza Rescue Bag', description: '3-4 slices of assorted pizzas.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', price: 20, originalPrice: 60, quantity: 8, pickupStart: new Date(), pickupEnd: tomorrow }] },
    { email: 'wazaratburger@mismish.app', name: 'Wazarat Burgers', description: 'Gourmet burgers near the ministries district.', imageUrl: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800', category: 'Burgers', latitude: 24.6641, longitude: 46.6919, address: 'Al Wazarat, Riyadh', listings: [{ name: 'Burger & Fries Bag', description: 'Leftover gourmet burgers and fries from the day.', imageUrl: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800', price: 22, originalPrice: 65, quantity: 5, pickupStart: new Date(), pickupEnd: inFourHours }] },
    { email: 'kingfahdbakery@mismish.app', name: 'King Fahd Bakery', description: 'Fresh bread and pastries near King Fahd Road.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', category: 'Bakery', latitude: 24.7091, longitude: 46.6739, address: 'King Fahd Rd, Riyadh', listings: [{ name: 'Bread Bag', description: 'Assorted fresh breads from today.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', price: 12, originalPrice: 35, quantity: 10, pickupStart: new Date(), pickupEnd: inTwoHours }] },
    { email: 'sulaimanicecafe@mismish.app', name: 'Sulaiman Ice Café', description: 'Ice cream and cold desserts in Al Sulimaniyah.', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', category: 'Café', latitude: 24.7003, longitude: 46.6613, address: 'Al Sulimaniyah, Riyadh', listings: [{ name: 'Dessert Rescue Box', description: 'Ice cream cups and cold desserts before closing.', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', price: 18, originalPrice: 50, quantity: 6, pickupStart: new Date(), pickupEnd: inSixHours }] },
    { email: 'rawdharestaurant@mismish.app', name: 'Rawdha Mandi', description: 'Authentic mandi and kabsa in Al Rawdah.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'Restaurant', latitude: 24.7181, longitude: 46.7042, address: 'Al Rawdah, Riyadh', listings: [{ name: 'Mandi Leftover Box', description: 'Generous portions of mandi rice and meat.', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', price: 32, originalPrice: 90, quantity: 4, pickupStart: new Date(), pickupEnd: inFourHours }] },
    { email: 'izdiharjapanesefood@mismish.app', name: 'Izdihar Ramen', description: 'Japanese ramen and bento in Al Izdihar.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', category: 'Japanese', latitude: 24.7345, longitude: 46.7389, address: 'Al Izdihar, East Riyadh', listings: [{ name: 'Ramen Rescue Box', description: 'Leftover ramen broth and toppings — hearty and warm.', imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800', price: 28, originalPrice: 75, quantity: 3, pickupStart: new Date(), pickupEnd: inSixHours }] },
    { email: 'uroubahshawarma@mismish.app', name: "Urubah Shawarma", description: 'Late-night shawarma on Prince Turki Road.', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', category: 'Grill', latitude: 24.7447, longitude: 46.6812, address: 'Prince Turki Rd, North Riyadh', listings: [{ name: 'Shawarma Bag', description: '3 shawarma wraps with garlic sauce.', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', price: 20, originalPrice: 55, quantity: 8, pickupStart: new Date(), pickupEnd: tomorrow }] },
    { email: 'badeeahbakery@mismish.app', name: 'Badeeah Patisserie', description: 'French-Arabic fusion patisserie in Al Badeah.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', category: 'Bakery', latitude: 24.6522, longitude: 46.6734, address: 'Al Badeah, South Riyadh', listings: [{ name: 'Patisserie Mystery Bag', description: 'Eclairs, croissants, and Arabic sweets.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800', price: 25, originalPrice: 70, quantity: 5, pickupStart: new Date(), pickupEnd: inFourHours }] },
    { email: 'hitteensushi@mismish.app', name: 'Hitteen Sushi', description: 'Fresh sushi rolls in the Hitteen district.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', category: 'Japanese', latitude: 24.7588, longitude: 46.6221, address: 'Hitteen, North Riyadh', listings: [{ name: 'Sushi End-of-Day Box', description: 'Fresh sushi rolls and nigiri from today.', imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800', price: 38, originalPrice: 100, quantity: 4, pickupStart: new Date(), pickupEnd: inSixHours }] },
  ];

  for (const { listings, ...vendor } of vendorData) {
    const upserted = await prisma.vendor.upsert({
      where: { email: vendor.email },
      update: { ...vendor },
      create: { ...vendor, password },
    });

    await prisma.surpriseBox.createMany({
      data: listings.map((l) => ({ ...l, vendorId: upserted.id })),
    });

    console.log(`✅ ${upserted.name} — ${listings.length} listing(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
