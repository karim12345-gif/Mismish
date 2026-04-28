# Mismish - Project Overview

**Food Waste Reduction Platform** inspired by "Too Good To Go"

## Project Vision
Connect customers with restaurants to purchase surprise food boxes at discounted prices, reducing food waste while providing value to both parties.

---

## Development Phases

### ✅ Phase 0: Foundation (COMPLETED)
- [x] Project structure setup
- [x] TypeScript + Node.js backend initialization
- [x] Prisma ORM + PostgreSQL integration
- [x] Database schema design
- [x] Environment configuration
- [x] Input validation middleware
- [x] Error handling middleware
- [x] Rate limiting
- [x] Security headers

---

### ✅ Phase 1: Core Customer Experience (COMPLETED)
- [x] Customer authentication (Signup / Login / OTP dev bypass)
- [x] Browse surprise boxes — Home feed + Map screen
- [x] View box details — SurpriseBag screen with inventory, pickup time, store info
- [x] Order creation with PICKUP delivery method
- [x] Order state machine (PENDING → CONFIRMED → COMPLETED / CANCELLED)
- [x] Pickup code generation — QR code shown on BookingConfirmed screen
- [x] Orders screen — Active / Past tabs, QR viewer, pickup time + day label
- [x] Checkout flow — store details, order items, summary, simulated payment (mock Apple Pay)
- [x] Seed data — 17 Riyadh vendors with realistic closing times via `todayAt()`

> **Payment:** Real payment integration (Stripe / Tap) is deferred to a later phase.
> For now the checkout simulates payment and goes straight to order creation.

---

### 🔄 Phase 2: Enhanced Discovery & Retention (IN PROGRESS)
- [x] Favorites system — heart toggle on home, store, and map; persisted via AsyncStorage; FavoritesScreen
- [x] Map search — filter stores by name/category in real time
- [x] Map filters — Available Now, My Favorites, cuisine sub-row
- [x] Map clustering — grid-based clustering for dense areas
- [ ] Rating & Review system
- [ ] Push notifications — see plan below
- [ ] Advanced filtering — dietary tags, allergens

---

### 🛡 Phase 3: Infrastructure & Reliability
- [x] Input validation
- [x] Error handling middleware
- [x] Rate limiting
- [x] Security headers
- [ ] Inventory race condition handling (Prisma `$transaction` + optimistic concurrency)
- [ ] Timezone handling — pickup windows should respect vendor's local timezone, not UTC
- [ ] Geolocation distance optimization (PostGIS or Haversine on DB level)

---

### 🏪 Phase 4: Vendor Backend (NOT STARTED)
- [ ] Vendor registration & approval flow
- [ ] Vendor adds store info, photos, categories
- [ ] Vendor creates/manages surprise bag listings (name, price, quantity, pickup window)
- [ ] Recurring schedule — vendor sets a daily template instead of manual daily entry
- [ ] Order scanner / redemption API — vendor scans customer QR to mark COLLECTED
- [ ] Vendor dashboard — sales, ratings, redemption stats

> **Current workaround:** vendors and listings are seeded manually via `prisma/seed.ts`.
> Once Phase 4 ships, merchants POST their own data and the mobile app picks it up
> automatically — same GET /stores endpoint, no mobile changes needed.

---

### 📱 Phase 5: Mobile App Polish
- [x] React Native (Expo) setup with NativeWind
- [x] Feature-based architecture (`src/features/`)
- [x] Auth flow — login, signup, OTP
- [x] Home feed — store cards, search, category filters
- [x] Map screen — live location, store pins, clustering, bottom card, filters
- [x] Store detail — SurpriseBag screen with inventory cards
- [x] Checkout — multi-step with confirm sheet and QR booking confirmed
- [x] Orders — active/past tabs, QR viewer, status badges
- [x] Favorites — global context, persisted, full favorites screen
- [ ] Push notification client — register device token, handle incoming notifications
- [ ] Rating & review UI
- [ ] User profile & edit

---

### 🚚 Phase 6: Delivery (DEFERRED)
Delivery requires a full driver layer — own fleet or integration with a KSA provider
(Jahez, Ninja, etc.). This is a separate system from pickup.

When added, the notification triggers extend to:
- Driver accepted order
- Driver en route
- Order delivered

**Decision: Keep MVP pickup-only. Bolt delivery on after the core product is stable.**

---

### 🔔 Push Notification Plan

**How it works:**
1. App registers for permission → gets Expo Push Token (unique per device)
2. Token is stored on the `User` record in the DB
3. Backend fires notifications via `POST https://exp.host/--/api/v2/push/send`
4. Expo handles APNs (iOS) + FCM (Android) delivery

**Confirmed use cases (in priority order):**
| Trigger | Message |
|---|---|
| Order placed | "We received your order, waiting for store confirmation" |
| Order confirmed by merchant | "Your bag is ready! Pick up before [time]" |
| 30 min before `pickupEnd` | "Reminder: collect your bag before [time]" |
| Order marked collected | "Enjoy your bag! Rate your experience" |
| Order cancelled | "Your order was cancelled. You won't be charged" |
| Favorited store adds a new bag | "[Store] just listed a Surprise Box — only [n] left!" |

**No websockets needed.** Pull-based data refresh (React Query) is sufficient for this use case. Websockets are for real-time systems like live stock prices or chat — a 5–10 min refresh window is perfectly acceptable here.

---

### 🌐 Phase 7: Vendor Web Portal (NOT STARTED)
- [ ] Vendor login
- [ ] Bag management UI
- [ ] Order management — see incoming orders, mark as confirmed/collected
- [ ] Sales analytics dashboard

---

## Current Status
**Phase:** 2 (Enhanced Discovery & Retention)
**Progress:** ~55% overall
**Completed:** Auth, full customer browse/order/checkout flow, favorites, map, orders history, QR pickup
**Next up:** Push notifications, ratings, vendor backend





# Memory Index

- [Mismish Project Overview](project_mismish.md) — Tech stack, completed flows, dev OTP setup, seed data, prisma db push
- [Karim — Developer Profile](user_karim.md) — Building Mismish, wants senior-level code, prefers discuss-before-implement
- [Code and Response Style](feedback_style.md) — No trailing summaries; SafeAreaView from safe-area-context; no unused imports
- [Competitive Intelligence](project_competitive_intel.md) — Competitor weaknesses (availability, freshness, CS, OTP bugs) and Mismish differentiation strategy



what should we do in this case Mismish fix: Real-time inventory, auto-deactivate merchants who don't fulfill consistently


our Mismish competitive advantages to build:


Verified freshness — timestamp when food was prepared
Price transparency — total cost shown before you tap checkout
Merchant rating system — users rate each pickup experience
Real-time availability — no showing up to empty shelves
Fast CS — target under 5 min first response




Real-time inventory + auto-deactivate
Merchant dashboard shows a toggle per item — "Available / Sold Out". When merchant marks sold out, item disappears from consumer app instantly. Auto-deactivate logic: if merchant has 3+ unfulfilled orders in 30 days, their listings get hidden and they get a warning. After 5, account suspended pending review. This protects your consumer trust score.


1. Verified freshness timestamp
Merchant must enter "prepared at" time when listing an item. Consumer sees "Prepared 2 hours ago" on the item card. You can also set an auto-expiry — if merchant lists something and it's not sold within X hours, it auto-removes. Simple but powerful trust signal.

2. Price transparency
Show subtotal + delivery fee + any service fee on the item detail screen before the user even taps checkout. No surprises at payment. This alone will kill a major Barakah complaint.

3. Merchant rating system
After every pickup, user gets a one-tap rating prompt — thumbs up/down or 1-5 stars. Merchant score is visible on their listing. Merchants below 3.5 stars get a "quality review" flag. This creates accountability without you having to manually monitor.

4. Real-time availability
Two approaches — merchant manually updates (simpler to build for MVP), or you integrate with their POS system (complex, post-MVP). For MVP just make the merchant toggle dead simple and fast — one tap in their dashboard. Add push notification reminders to merchants 1 hour before closing to update availability.

5. Fast CS
For MVP don't build a full CS system — use WhatsApp Business API with auto-replies for common issues (order not available, refund request). Route to a human only when needed. Target: auto-resolve 70% of issues without human. For refunds, make it automatic — if merchant marks "unavailable" after order placed, consumer gets instant refund, no need to contact support.









Great idea. Here's how to architect it:

---

**Mismish AI CS Agent**

**What it can handle automatically:**
- Order status ("where's my order", "is it ready for pickup")
- Refund requests (check if merchant marked unavailable → auto-refund + confirm to user)
- Freshness complaints (log complaint, issue refund if valid, flag merchant)
- "Item not as described" — compare user complaint to merchant listing, auto-refund if mismatch
- Order history questions
- Merchant hours / availability

**Stack:**
- Claude Sonnet API (you already know this from After app)
- Tool use / function calling to query your backend
- WhatsApp Business API or in-app chat UI

**How it works:**

```
User: "I arrived at the store and the item wasn't there"

AI Agent:
1. Looks up order ID from user context
2. Checks order status in DB
3. Checks if merchant marked available/unavailable
4. If merchant fault → auto-refund → notify user
5. If unclear → escalate to human with full context pre-loaded
```

**Tools you give the AI:**
```ts
- getOrderDetails(orderId)
- getOrderStatus(orderId)  
- checkMerchantAvailability(merchantId, itemId)
- processRefund(orderId, reason)
- flagMerchant(merchantId, issue)
- createSupportTicket(userId, issue) // escalate to human
- getOrderHistory(userId)
```

**System prompt structure:**
```
You are Mismish's customer support agent.
You have access to order data and can process refunds.

Rules:
- Always verify order belongs to the user before sharing details
- Auto-refund if merchant marked item unavailable
- Auto-refund if pickup was impossible (merchant closed)
- Flag merchant after 2+ complaints in 7 days
- Escalate to human if: payment dispute, safety concern, 
  user is angry after 2 attempts to resolve
- Always respond in the user's language (AR/EN)
- Keep responses short and clear
```

**Refund logic flow:**
```
complaint received
    ↓
is order within 24hrs? 
    ↓ yes
check merchant status
    ↓ unavailable/closed
auto refund + close ticket
    ↓ available
ask user for details + photo
    ↓
AI judges validity based on complaint type
    ↓ valid
refund + flag merchant
    ↓ unclear
escalate to human
```

**What makes this better than Barakah's CS:**
- Responds in seconds not hours
- Bilingual AR/EN natively
- Auto-refunds without user having to beg
- Every complaint is logged and used to auto-flag bad merchants
- Human only sees pre-summarized cases — no wasted time

---

**For MVP I'd scope it to:**
1. Order status queries
2. Auto-refund for unavailable items
3. Escalate everything else to WhatsApp human

Then expand from there once you see what the most common issues are.

Want me to help you design the backend API structure for this?