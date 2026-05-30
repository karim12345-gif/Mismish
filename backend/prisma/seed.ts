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
  await prisma.review.deleteMany({});
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
          allergens: ["Gluten", "Dairy", "Eggs"],
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
          allergens: ["Gluten", "Sesame"],
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
          allergens: ["Dairy"],
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
          allergens: ["Fish", "Shellfish", "Soy", "Gluten"],
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
          allergens: ["Gluten", "Dairy"],
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
          allergens: ["Gluten", "Eggs", "Dairy"],
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
          allergens: ["Gluten", "Dairy", "Eggs", "Nuts"],
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
          allergens: ["Fish", "Shellfish", "Soy"],
        },
      ],
    },
    // --- Real Riyadh restaurants with precise GPS coordinates ---
    {
      email: "nandos.tahlia@mismish.app",
      name: "Nando's Tahlia",
      description:
        "Flame-grilled peri-peri chicken on Tahlia Street. End-of-day portions before close.",
      imageUrl:
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800",
      category: "Grill",
      latitude: 24.6912,
      longitude: 46.6831,
      address: "Tahlia St, Al Olaya, Riyadh",
      listings: [
        {
          name: "Peri-Peri Rescue Bag",
          description:
            "Half chicken, peri-peri rice, and coleslaw from the evening service.",
          imageUrl:
            "https://images.unsplash.com/photo-1598515213692-2e46e9e7bddd?w=800",
          price: 28,
          originalPrice: 78,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "salt.burger.aqiq@mismish.app",
      name: "SALT Al Aqiq",
      description:
        "Riyadh's cult smash-burger spot in Al Aqiq. Late-night leftover bags.",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
      category: "Burgers",
      latitude: 24.7684,
      longitude: 46.6308,
      address: "Al Aqiq, North Riyadh",
      listings: [
        {
          name: "Smash Burger Bag",
          description: "2 smash burgers and fries — end-of-service rescue.",
          imageUrl:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
          price: 30,
          originalPrice: 85,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now3.e,
          allergens: ["Gluten", "Dairy", "Eggs"],
        },
      ],
    },
    {
      email: "lusin.riyadh@mismish.app",
      name: "Lusin Restaurant",
      description:
        "Award-winning Armenian-French cuisine near the Diplomatic Quarter. Rescue tonight's fine-dining leftovers.",
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      category: "Restaurant",
      latitude: 24.6883,
      longitude: 46.6175,
      address: "Diplomatic Quarter, Riyadh",
      listings: [
        {
          name: "Fine Dining Surprise Box",
          description:
            "Chef's selection of leftover starters and mains from tonight's service.",
          imageUrl:
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800",
          price: 55,
          originalPrice: 160,
          quantity: 3,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "tweeq.cafe@mismish.app",
      name: "Tweeq Café",
      description:
        "Popular Riyadh specialty café on Prince Mohammed bin Salman Road. Rescue unsold pastries and drinks.",
      imageUrl:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
      category: "Café",
      latitude: 24.7021,
      longitude: 46.6786,
      address: "Prince Mohammed bin Salman Rd, Riyadh",
      listings: [
        {
          name: "Specialty Coffee + Pastry Bag",
          description:
            "Two specialty coffees and assorted croissants and cakes from today's batch.",
          imageUrl:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
          price: 22,
          originalPrice: 65,
          quantity: 8,
          pickupStart: now1.s,
          pickupEnd: now2.e,
          allergens: ["Gluten", "Dairy", "Eggs"],
        },
      ],
    },
    {
      email: "maestro.pizza.olaya@mismish.app",
      name: "Maestro Pizza Al Olaya",
      description:
        "Italian-style wood-fired pizza near Al Faisaliah Tower. Close-of-day slices and whole pies.",
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
      category: "Pizza",
      latitude: 24.6897,
      longitude: 46.6853,
      address: "Al Faisaliah area, Al Olaya, Riyadh",
      listings: [
        {
          name: "Wood-Fired Pizza Bag",
          description: "4–6 slices of assorted Italian pizzas from the oven.",
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
          price: 24,
          originalPrice: 68,
          quantity: 7,
          pickupStart: now1.s,
          pickupEnd: now3.e,
          allergens: ["Gluten", "Dairy"],
        },
      ],
    },
    {
      email: "karakhouse.malaz@mismish.app",
      name: "Karak House Al Malaz",
      description:
        "Classic street-style karak chai and snacks near Al Malaz park.",
      imageUrl:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800",
      category: "Café",
      latitude: 24.6795,
      longitude: 46.7112,
      address: "Al Malaz, Riyadh",
      listings: [
        {
          name: "Karak & Bites Bundle",
          description:
            "2 large karak chais and samboosa or egg sandwiches from the morning prep.",
          imageUrl:
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800",
          price: 10,
          originalPrice: 28,
          quantity: 12,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
      ],
    },
    {
      email: "noodle.house.faisaliah@mismish.app",
      name: "The Noodle House",
      description:
        "Pan-Asian noodles and rice dishes in Al Faisaliah Tower. End-of-day portions.",
      imageUrl:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
      category: "Asian",
      latitude: 24.6882,
      longitude: 46.6857,
      address: "Al Faisaliah Tower, Al Olaya, Riyadh",
      listings: [
        {
          name: "Pan-Asian Noodle Bag",
          description:
            "A generous portion of Pad Thai, Singapore noodles, or fried rice — chef's pick.",
          imageUrl:
            "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800",
          price: 26,
          originalPrice: 72,
          quantity: 5,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "panda.express.park@mismish.app",
      name: "Shawarma Park Al Wurud",
      description:
        "Legendary shawarma joint in Al Wurud, open since 1997. Daily surplus wraps.",
      imageUrl:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
      category: "Grill",
      latitude: 24.7059,
      longitude: 46.6714,
      address: "Al Wurud, Riyadh",
      listings: [
        {
          name: "Shawarma Variety Bag",
          description:
            "4 mixed shawarma wraps — chicken, meat, and mixed — with garlic sauce.",
          imageUrl:
            "https://images.unsplash.com/photo-1644503346768-1c9e1b0db39f?w=800",
          price: 18,
          originalPrice: 50,
          quantity: 10,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "cheesecake.factory.park@mismish.app",
      name: "The Cheesecake Factory Riyadh Park",
      description:
        "American-style dining at Riyadh Park Mall. End-of-day dessert and meal rescue.",
      imageUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
      category: "Restaurant",
      latitude: 24.7741,
      longitude: 46.6540,
      address: "Riyadh Park Mall, North Riyadh",
      listings: [
        {
          name: "Dessert Rescue Box",
          description:
            "Assorted slices of cheesecake and desserts from today's menu.",
          imageUrl:
            "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800",
          price: 35,
          originalPrice: 95,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "texas.roadhouse.granada@mismish.app",
      name: "Texas Roadhouse Granada",
      description:
        "Hand-cut steaks and legendary ribs near Granada Mall. Rescue tonight's unsold portions.",
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76538f80569?w=800",
      category: "Grill",
      latitude: 24.7519,
      longitude: 46.7714,
      address: "Granada Center, East Riyadh",
      listings: [
        {
          name: "Steak & Ribs Bag",
          description:
            "A generous plate of leftover ribs or steak with rolls and sides.",
          imageUrl:
            "https://images.unsplash.com/photo-1544025162-d76538f80569?w=800",
          price: 45,
          originalPrice: 125,
          quantity: 3,
          pickupStart: tmr.s,
          pickupEnd: tmr.e,
        },
      ],
    },
    // --- Additional vendors ---
    {
      email: "beirut.nights.olaya@mismish.app",
      name: "Beirut Nights",
      description:
        "Authentic Lebanese mezze and grills in Al Olaya. End-of-day portions of hummus, fattoush, and mixed platters.",
      imageUrl:
        "https://images.unsplash.com/photo-1544510806-49d4a0f8ab08?w=800",
      category: "Restaurant",
      latitude: 24.6933,
      longitude: 46.6842,
      address: "Al Olaya St, Riyadh",
      listings: [
        {
          name: "Lebanese Mezze Bag",
          description:
            "Hummus, mutabbal, tabbouleh, fattoush, and pita from today's service.",
          imageUrl:
            "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800",
          price: 28,
          originalPrice: 80,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
        {
          name: "Mixed Grill Platter Bag",
          description:
            "Leftover shish tawook, kafta, and lamb chops with garlic sauce and bread.",
          imageUrl:
            "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
          price: 35,
          originalPrice: 95,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "spice.route.sulimaniyah@mismish.app",
      name: "Spice Route",
      description:
        "Indian and Pakistani cuisine in As Sulimaniyah. Fragrant curries and biryanis rescued before closing.",
      imageUrl:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
      category: "Indian",
      latitude: 24.6988,
      longitude: 46.6753,
      address: "As Sulimaniyah, Riyadh",
      listings: [
        {
          name: "Biryani Rescue Box",
          description:
            "A full portion of chicken or mutton biryani with raita and salad.",
          imageUrl:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
          price: 22,
          originalPrice: 60,
          quantity: 7,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
        {
          name: "Curry & Naan Bundle",
          description:
            "2 curry portions — butter chicken or dal makhani — with garlic naan.",
          imageUrl:
            "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800",
          price: 25,
          originalPrice: 68,
          quantity: 5,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "green.bowl.kafd@mismish.app",
      name: "Green Bowl",
      description:
        "Health-first salads, grain bowls, and smoothies at KAFD. Rescue end-of-day prepared bowls and juices.",
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
      category: "Healthy",
      latitude: 24.7642,
      longitude: 46.6258,
      address: "King Abdullah Financial District (KAFD), Riyadh",
      listings: [
        {
          name: "Power Bowl Bag",
          description:
            "2 grain bowls with quinoa, roasted veg, greens, and tahini dressing.",
          imageUrl:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
          price: 28,
          originalPrice: 78,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
        {
          name: "Smoothie & Salad Bundle",
          description:
            "Two cold-press juices or smoothies and a fresh salad before closing.",
          imageUrl:
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
          price: 22,
          originalPrice: 60,
          quantity: 8,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
      ],
    },
    {
      email: "seoul.kitchen.wurud@mismish.app",
      name: "Seoul Kitchen",
      description:
        "Korean bibimbap, Korean fried chicken, and banchan in Al Wurud. Rescue today's unsold plates.",
      imageUrl:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800",
      category: "Asian",
      latitude: 24.7073,
      longitude: 46.6698,
      address: "Al Wurud, Riyadh",
      listings: [
        {
          name: "Korean Fried Chicken Box",
          description:
            "6 pieces of crispy Korean fried chicken with pickled radish and sauce.",
          imageUrl:
            "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800",
          price: 30,
          originalPrice: 82,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
    {
      email: "la.fiesta.nakheel@mismish.app",
      name: "La Fiesta",
      description:
        "Mexican tacos, burritos, and nachos in Al Nakheel. End-of-night rescue bags.",
      imageUrl:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
      category: "Mexican",
      latitude: 24.7298,
      longitude: 46.6241,
      address: "Al Nakheel, Riyadh",
      listings: [
        {
          name: "Taco & Burrito Bag",
          description:
            "3 tacos and a burrito with guac, salsa, and sour cream — end of night.",
          imageUrl:
            "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800",
          price: 26,
          originalPrice: 72,
          quantity: 6,
          pickupStart: tmr.s,
          pickupEnd: tmr.e,
        },
      ],
    },
    {
      email: "dragon.palace.malaz@mismish.app",
      name: "Dragon Palace",
      description:
        "Cantonese dim sum and Chinese stir-fries in Al Malaz. Daily surplus dim sum rescue.",
      imageUrl:
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
      category: "Asian",
      latitude: 24.6803,
      longitude: 46.7231,
      address: "Al Malaz, Riyadh",
      listings: [
        {
          name: "Dim Sum Rescue Box",
          description:
            "12 pieces of assorted steamed and fried dim sum — har gow, siu mai, and more.",
          imageUrl:
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
          price: 24,
          originalPrice: 65,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "mornings.cafe.aqiq@mismish.app",
      name: "Mornings Café",
      description:
        "Specialty third-wave coffee and all-day breakfast in Al Aqiq. Rescue unsold brunch and baked goods.",
      imageUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      category: "Café",
      latitude: 24.7691,
      longitude: 46.6315,
      address: "Al Aqiq, North Riyadh",
      listings: [
        {
          name: "Brunch Bag",
          description:
            "Eggs benedict, avocado toast, or shakshuka from today's brunch service.",
          imageUrl:
            "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800",
          price: 28,
          originalPrice: 75,
          quantity: 5,
          pickupStart: now1.s,
          pickupEnd: now1.e,
        },
        {
          name: "Baked Goods Bag",
          description:
            "Sourdough loaf, banana bread, and seasonal muffins from this morning's bake.",
          imageUrl:
            "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
          price: 18,
          originalPrice: 50,
          quantity: 7,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
      ],
    },
    {
      email: "pasta.bella.izdihar@mismish.app",
      name: "Pasta Bella",
      description:
        "Homemade Italian pasta and risotto in Al Izdihar. Rescue tonight's fresh-made portions.",
      imageUrl:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
      category: "Restaurant",
      latitude: 24.7326,
      longitude: 46.7381,
      address: "Al Izdihar, East Riyadh",
      listings: [
        {
          name: "Pasta Night Bag",
          description:
            "Two portions of fresh pasta — carbonara, arrabiata, or pesto — chef's surplus.",
          imageUrl:
            "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
          price: 32,
          originalPrice: 88,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
        },
      ],
    },
    {
      email: "waffle.house.tahlia@mismish.app",
      name: "Waffle House Riyadh",
      description:
        "Belgian waffles and crêpes on Tahlia Street. Daily rescue on unsold desserts and sweet wraps.",
      imageUrl:
        "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800",
      category: "Sweets",
      latitude: 24.6919,
      longitude: 46.6807,
      address: "Tahlia St, Al Olaya, Riyadh",
      listings: [
        {
          name: "Waffle & Crêpe Rescue Bag",
          description:
            "3 waffles and 2 crêpes with assorted toppings — Nutella, strawberry, or caramel.",
          imageUrl:
            "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800",
          price: 20,
          originalPrice: 58,
          quantity: 8,
          pickupStart: now1.s,
          pickupEnd: now3.e,
        },
      ],
    },
    {
      email: "sultan.mandi.batha@mismish.app",
      name: "Sultan Al Mandi",
      description:
        "Old-school mandi and jareesh restaurant in Al Batha. Generous leftover portions near the historic market.",
      imageUrl:
        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
      category: "Restaurant",
      latitude: 24.6411,
      longitude: 46.7153,
      address: "Al Batha, Central Riyadh",
      listings: [
        {
          name: "Mandi Feast Bag",
          description:
            "Half a chicken mandi or lamb mandi with rice and soup — a full meal.",
          imageUrl:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
          price: 30,
          originalPrice: 85,
          quantity: 6,
          pickupStart: now1.s,
          pickupEnd: now2.e,
        },
        {
          name: "Jareesh & Harees Bag",
          description:
            "Traditional jareesh and harees with ghee — comfort food in a bag.",
          imageUrl:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
          price: 18,
          originalPrice: 50,
          quantity: 4,
          pickupStart: later.s,
          pickupEnd: later.e,
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
