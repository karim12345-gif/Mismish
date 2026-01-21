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
- [x] Database schema design (Initial)
- [x] Environment configuration

### 🔄 Phase 1: Core Customer Experience (IN PROGRESS)
**Priority: The absolute minimum to buy a box**
- [x] Customer Authentication (Signup/Login)
- [ ] Browse Nearby Surprise Boxes
- [ ] View Box Details
- [ ] **[CRITICAL]** Payment Integration (Stripe/Mock) --> lets keep this for later 
- [ ] Order Creation & State Machine (Pending -> Paid -> Collected)
- [ ] Pickup Code Generation

### ✨ Phase 2: Enhanced Discovery & Retention (Customer)
**Priority: Making it "Too Good To Go" quality**
- [ ] **[NEW]** Favorites System (Save favorite vendors)
- [ ] **[NEW]** Rating & Review System
- [ ] **[NEW]** Advanced Filtering (Dietary prefs, Pickup time)
- [ ] **[NEW]** Push Notifications (New boxes, Pickup reminders)
- [ ] User Profile & Order History

### 🛡 Phase 3: Infrastructure & Reliability
**Priority: Robustness before scaling**
- [x] Input Validation
- [x] Error Handling Middleware
- [x] Rate Limiting
- [x] Security Headers
- [ ] Inventory Race Condition Handling (Atomic Transactions)
- [ ] Geolocation Distance Optimization (PostGIS?)
- [ ] timezone handling for pickup windows

### 🏪 Phase 4: Vendor Backend
- [ ] Vendor Registration & Approval
- [ ] Box Management (Recurring schedules)
- [ ] Order Scanner/Redemption API
- [ ] Vendor Dashboard (Sales, Ratings)

### 📱 Phase 5: Mobile App (Customer)
- [ ] React Native Setup
- [ ] Core Flows (Auth, Feed, Map, Profile)
- [ ] Payment Sheet Integration
- [ ] Push Notification Client

### 🌐 Phase 6: Vendor Web Portal
- [ ] Vendor Unified Dashboard

---

## Gap Analysis (vs Too Good To Go)

### Missing Product Features
1.  **Favorites/Saving**: Users return to check specific stores. *Requires `Favorite` model.*
2.  **Reviews/Ratings**: Social proof is essential. *Requires `Review` model.*
3.  **Dietary Tags**: "Vegan", "Vegetarian", "Meals". *Requires `Category` or `Tag` model.*
4.  **Sold Out View**: Users need to see what they missed to create FOMO.
5.  **Recurring/Auto-Replenish**: Vendors don't manually add boxes every day; they set a schedule.

### Critical Technical Considerations
1.  **Concurrency**: If 2 users buy the last box at the exact same millisecond. Need `Prisma $transaction` and optimistic concurrency control.
2.  **Timezones**: Pickup windows need to respect the Vendor's local time, not just UTC.
3.  **Payments**: We need a `Payment` model and integration with a provider (e.g., Stripe) to handle webhooks and refunds (if a vendor cancels).

---

## Development Timeline

### Phase 1: Core Customer Experience
**Est. Remaining:** 5-7 days
- Browse/Details: 2 days
- Payments/Orders: 3-4 days
- Pickup Logic: 1 day

### Phase 2: Enhanced Discovery
**Est. Duration:** 5-6 days
- Favorites: 1 day
- Ratings: 2 days
- Filters/Tags: 1 day
- Notifications: 2 days

### Phase 3 & 4: Reliability & Vendor
**Est. Duration:** 7-10 days

## Current Status
**Phase:** 1 (Core Customer Experience)
**Progress:** 20%
**Next Up:** Order Logic & Payments
