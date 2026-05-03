import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // All times relative to now — timezone-safe, always valid after re-seeding.
  const h = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);

  // "Available now" — 6-hour windows so you don't need to reseed constantly
  const now1  = { s: h(-0.5),  e: h(5.5)  };  // 30 min ago → +5h30
  const now2  = { s: h(-1),    e: h(5)    };  // 1h ago → +5h
  const now3  = { s: h(-0.25), e: h(5.75) };  // 15 min ago → +5h45

  // "Later today" — opens in ~2h, 4-hour window
  const later = { s: h(2),     e: h(6)    };

  // "Tomorrow" — 4-hour window starting in ~20h
  const tmr   = { s: h(20),    e: h(24)   };

  // Intentionally expired — for testing "Pickup time has ended" error
  const exp   = { s: h(-3),    e: h(-1)   };

  // Wipe listings first so re-running doesn't produce duplicates or stale dates
  await prisma.order.deleteMany({});
  await prisma.surpriseBox.deleteMany({});

  const vendorData = [
    {
      email: "alolayabakery@mismish.app",
      name: "Al Olaya Bakery",
      description:
        "Artisan Arabic breads and pastries baked fresh every morning in the heart of Al Olaya.",
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
      category: "Bakery",
      latitude: 24.6897,
      longitude: 46.6800,
      address: "Tahlia St, Al Olaya, Riyadh",
      listings: [
        {
          name: "Surprise Pastry Box",
          description:
            "A mix of our leftover Arabic pastries — ka'ak, baklava, and more. Every box is different!",
          imageUrl:
            "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800",
          price: 20,
          originalPrice: 60,
          quantity: 8,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
        {
          name: "Bread Mystery Bag",
          description: "Assorted breads and buns from today's morning bake.",
          imageUrl:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
          price: 15,
          originalPrice: 45,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "qahwahouse@mismish.app",
      name: "Qahwa House",
      description: "Specialty Arabic coffee and light bites in Al Malaz.",
      imageUrl:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
      category: "Café",
      latitude: 24.6791,
      longitude: 46.7244,
      address: "King Abdullah Rd, Al Malaz, Riyadh",
      listings: [
        {
          name: "Coffee & Dates Bundle",
          description:
            "Two specialty coffees and a selection of premium dates and sweets from today.",
          imageUrl:
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
          price: 25,
          originalPrice: 70,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
      ],
    },
    {
      email: "riyadhkitchen@mismish.app",
      name: "Riyadh Kitchen",
      description:
        "Home-style Saudi cooking. We waste nothing and give back to the community.",
      imageUrl:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
      category: "Restaurant",
      latitude: 24.7285,
      longitude: 46.6270,
      address: "Al Nakheel District, Riyadh",
      listings: [
        {
          name: "Chef's Kabsa Bag",
          description:
            "A full kabsa meal with sides — whatever the chef prepared today. Always delicious.",
          imageUrl:
            "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
          price: 30,
          originalPrice: 85,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "nakhilsushi@mismish.app",
      name: "Nakhil Sushi",
      description:
        "Fresh sushi and Japanese bites in the Diplomatic Quarter. End-of-day boxes at a fraction of the price.",
      imageUrl:
        "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=800",
      category: "Japanese",
      latitude: 24.6879,
      longitude: 46.6197,
      address: "Diplomatic Quarter, Riyadh",
      listings: [
        {
          name: "Sushi Surprise Box",
          description:
            "12 pieces of assorted sushi rolls and nigiri from today's prep.",
          imageUrl:
            "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
          price: 40,
          originalPrice: 110,
          quantity: 3,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
    {
      email: "granadarestaurant@mismish.app",
      name: "Granada Grill",
      description:
        "Wood-fired grills and shawarma. Rescue tonight's leftover portions before they go to waste.",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76538f80569?w=800",
      category: "Grill",
      latitude: 24.7521,
      longitude: 46.7725,
      address: "Granada Mall area, East Riyadh",
      listings: [
        {
          name: "Late Night Grill Bag",
          description:
            "Mixed grill platter — shawarma, kebab, and sides from the evening service.",
          imageUrl:
            "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
          price: 25,
          originalPrice: 75,
          quantity: 10,
          pickupStart: tmr.s,
          pickupEnd: tmr.e,
        },
      ],
    },
    {
      email: "tahliacafe@mismish.app",
      name: "Tahlia Café",
      description: "Trendy specialty café on Tahlia Street.",
      imageUrl:
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
      category: "Café",
      latitude: 24.6905,
      longitude: 46.6818,
      address: "Tahlia St, Riyadh",
      listings: [
        {
          name: "Morning Pastry Bag",
          description: "Assorted pastries and a drip coffee from the morning batch.",
          imageUrl:
            "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800",
          price: 18,
          originalPrice: 55,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "mursirestaurant@mismish.app",
      name: "Mursi Kitchen",
      description: "Traditional Najdi cuisine in Al Muraba.",
      imageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
      category: "Restaurant",
      latitude: 24.6978,
      longitude: 46.7094,
      address: "Al Muraba, Riyadh",
      listings: [
        {
          name: "Najdi Meal Box",
          description: "Traditional Najdi rice and slow-cooked lamb.",
          imageUrl:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
          price: 28,
          originalPrice: 80,
          quantity: 5,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "yasmeenicecream@mismish.app",
      name: "Yasmeen Sweets",
      description: "Arabic sweets and ice cream in Al Yasmeen.",
      imageUrl:
        "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800",
      category: "Sweets",
      latitude: 24.7631,
      longitude: 46.6399,
      address: "Al Yasmeen, North Riyadh",
      listings: [
        {
          name: "Sweet Surprise Box",
          description: "Assorted Arabic sweets, kunafa, and basbousa.",
          imageUrl:
            "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800",
          price: 22,
          originalPrice: 65,
          quantity: 7,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
      ],
    },
    {
      email: "shifapizza@mismish.app",
      name: "Al Shifa Pizza",
      description: "Wood-fired pizza in Al Shifa district.",
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      category: "Pizza",
      latitude: 24.6200,
      longitude: 46.7100,
      address: "Al Shifa, South Riyadh",
      listings: [
        {
          name: "Pizza Rescue Bag",
          description: "3-4 slices of assorted wood-fired pizzas.",
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
          price: 20,
          originalPrice: 60,
          quantity: 8,
          pickupStart: tmr.s,
          pickupEnd: tmr.e,
        },
      ],
    },
    {
      email: "wazaratburger@mismish.app",
      name: "Wazarat Burgers",
      description: "Gourmet burgers near the ministries district.",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      category: "Burgers",
      latitude: 24.6636,
      longitude: 46.6972,
      address: "Al Wazarat, Riyadh",
      listings: [
        {
          name: "Burger & Fries Bag",
          description: "Leftover gourmet burgers and fries from the day.",
          imageUrl:
            "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800",
          price: 22,
          originalPrice: 65,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
    {
      email: "kingfahdbakery@mismish.app",
      name: "King Fahd Bakery",
      description: "Fresh bread and pastries near King Fahd Road.",
      imageUrl:
        "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800",
      category: "Bakery",
      latitude: 24.7614,
      longitude: 46.6383,
      address: "King Fahd Rd, Al Malqa, Riyadh",
      listings: [
        {
          // EXPIRED — use this surpriseBoxId to test "Pickup time has ended" error
          name: "Bread Bag",
          description: "Assorted fresh breads from today.",
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
          price: 12,
          originalPrice: 35,
          quantity: 10,
          pickupStart: exp.s,
          pickupEnd: exp.e,
        },
      ],
    },
    {
      email: "sulaimanicecafe@mismish.app",
      name: "Sulaiman Ice Café",
      description: "Ice cream and cold desserts in Al Sulimaniyah.",
      imageUrl:
        "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
      category: "Café",
      latitude: 24.6975,
      longitude: 46.6760,
      address: "Musa Ibn Nusair St, As Sulimaniyah, Riyadh",
      listings: [
        {
          name: "Dessert Rescue Box",
          description: "Ice cream cups and cold desserts before closing.",
          imageUrl:
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800",
          price: 18,
          originalPrice: 50,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "rawdharestaurant@mismish.app",
      name: "Rawdha Mandi",
      description: "Authentic mandi and kabsa in Al Rawdah.",
      imageUrl:
        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
      category: "Restaurant",
      latitude: 24.7175,
      longitude: 46.7050,
      address: "Al Rawdah, Riyadh",
      listings: [
        {
          name: "Mandi Leftover Box",
          description: "Generous portions of mandi rice and slow-roasted meat.",
          imageUrl:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
          price: 32,
          originalPrice: 90,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "izdiharjapanesefood@mismish.app",
      name: "Izdihar Ramen",
      description: "Japanese ramen and bento in Al Izdihar.",
      imageUrl:
        "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800",
      category: "Japanese",
      latitude: 24.7311,
      longitude: 46.7367,
      address: "Al Izdihar, East Riyadh",
      listings: [
        {
          name: "Ramen Rescue Box",
          description: "Leftover ramen broth and toppings — hearty and warm.",
          imageUrl:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
          price: 28,
          originalPrice: 75,
          quantity: 3,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
    {
      email: "uroubahshawarma@mismish.app",
      name: "Urubah Shawarma",
      description: "Late-night shawarma on Prince Turki Road.",
      imageUrl:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
      category: "Grill",
      latitude: 24.7447,
      longitude: 46.6750,
      address: "Prince Turki Rd, Al Urubah, Riyadh",
      listings: [
        {
          name: "Shawarma Bag",
          description: "3 shawarma wraps with garlic sauce and pickles.",
          imageUrl:
            "https://images.unsplash.com/photo-1644503346768-1c9e1b0db39f?w=800",
          price: 20,
          originalPrice: 55,
          quantity: 8,
          pickupStart: tmr.s,
          pickupEnd: tmr.e,
        },
      ],
    },
    {
      email: "badeeahbakery@mismish.app",
      name: "Badeeah Patisserie",
      description: "French-Arabic fusion patisserie in Al Badeah.",
      imageUrl:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
      category: "Bakery",
      latitude: 24.6482,
      longitude: 46.6731,
      address: "Al Badeah, South Riyadh",
      listings: [
        {
          name: "Patisserie Mystery Bag",
          description: "Eclairs, croissants, and Arabic sweets.",
          imageUrl:
            "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=800",
          price: 25,
          originalPrice: 70,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
      ],
    },
    {
      email: "hitteensushi@mismish.app",
      name: "Hitteen Sushi",
      description: "Fresh sushi rolls in the Hitteen district.",
      imageUrl:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
      category: "Japanese",
      latitude: 24.7567,
      longitude: 46.6228,
      address: "Hitteen, North Riyadh",
      listings: [
        {
          name: "Sushi End-of-Day Box",
          description: "Fresh sushi rolls and nigiri from today.",
          imageUrl:
            "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
          price: 38,
          originalPrice: 100,
          quantity: 4,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
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
