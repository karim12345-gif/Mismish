# Phase 1: Customer Backend - Detailed Tasks

**Goal:** Build complete backend API for customer mobile app

---

## 1. Authentication ✅ COMPLETED

### 1.1 User Registration
- [x] Create `userAuth.ts` controller
- [x] Hash password with bcrypt
- [x] Generate JWT token
- [x] Return user data (excluding password)

### 1.2 User Login
- [x] Validate credentials
- [x] Compare hashed password
- [x] Generate JWT token
- [x] Return user data

### 1.3 Routes
- [x] `POST /api/auth/user/signup`
- [x] `POST /api/auth/user/login`

---

## 2. Browse Nearby Surprise Boxes 🔄 IN PROGRESS

### 2.1 Listing Controller
- [ ] Create `listingController.ts`
- [ ] Implement geolocation query (Haversine formula)
- [ ] Filter by availability (quantity > 0)
- [ ] Filter by pickup time window
- [ ] Sort by distance

### 2.2 API Endpoint
- [ ] `GET /api/listings/nearby?lat={lat}&lng={lng}&radius={km}`
- [ ] Response: Array of surprise boxes with vendor info

### 2.3 Database Optimization
- [ ] Add indexes on `latitude`, `longitude`
- [ ] Consider PostGIS extension (future)

---

## 3. View Box Details

### 3.1 Single Listing Endpoint
- [ ] `GET /api/listings/:id`
- [ ] Include vendor information
- [ ] Include average rating
- [ ] Include available quantity

### 3.2 Rating Aggregation
- [ ] Calculate average vendor rating
- [ ] Count total ratings
- [ ] Cache results (future optimization)

---

## 4. Purchase Box & Order Confirmation

### 4.1 Order Creation
- [ ] Create `orderController.ts`
- [ ] Validate box availability
- [ ] Decrement box quantity (atomic transaction)
- [ ] Create order record
- [ ] Return order confirmation

### 4.2 API Endpoint
- [ ] `POST /api/orders`
- [ ] Body: `{ surpriseBoxId, deliveryMethod, deliveryAddress? }`

### 4.3 Transaction Safety
- [ ] Use Prisma transactions
- [ ] Handle race conditions (multiple users buying last box)
- [ ] Rollback on failure

---

## 5. Pickup Order Flow

### 5.1 Order Status Management
- [ ] `GET /api/orders/my` - List user's orders
- [ ] `GET /api/orders/:id` - Order details
- [ ] Status: PENDING → CONFIRMED → COMPLETED

### 5.2 QR Code Generation (Optional)
- [ ] Generate unique order code
- [ ] Vendor scans to confirm pickup

---

## 6. Rate Restaurant

### 6.1 Rating System
- [ ] Create `ratingController.ts`
- [ ] Validate user purchased from vendor
- [ ] Allow rating only after pickup
- [ ] Store rating (1-5 stars + comment)

### 6.2 API Endpoint
- [ ] `POST /api/ratings`
- [ ] Body: `{ orderId, vendorId, score, comment }`

### 6.3 Rating Constraints
- [ ] One rating per order
- [ ] Cannot rate before order completion

---

## Database Schema Updates Needed

### Add Rating Model
```prisma
model Rating {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  vendorId  Int
  vendor    Vendor   @relation(fields: [vendorId], references: [id])
  orderId   Int      @unique
  order     Order    @relation(fields: [orderId], references: [id])
  score     Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
}
```

---

## Testing Checklist

- [ ] Test user signup with valid data
- [ ] Test user signup with duplicate email
- [ ] Test user login with correct credentials
- [ ] Test user login with wrong password
- [ ] Test nearby listings with different locations
- [ ] Test purchasing last available box (race condition)
- [ ] Test rating without completing order
- [ ] Test duplicate rating on same order

---

## Estimated Timeline
- Authentication: ✅ 1 day (DONE)
- Browse Listings: 2 days
- Box Details: 1 day
- Purchase Flow: 2 days
- Order Management: 1 day
- Rating System: 1 day

**Total:** ~8 days
