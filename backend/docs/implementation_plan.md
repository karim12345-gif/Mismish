# Implementation Plan - Updated

# Mismish - Food Waste Reduction Platform

Complete implementation plan including infrastructure and security requirements.

---

## Phase 1: Customer Backend (Core Features)

### Authentication ✅
- [x] User signup/login with JWT
- [x] Password hashing (bcrypt)
- [x] Separate User/Vendor models

### Listings & Orders
- [ ] Browse nearby surprise boxes (geolocation)
- [ ] View box details with ratings
- [ ] Purchase flow with inventory management
- [ ] Order status tracking
- [ ] Rating system

---

## Phase 1.5: Infrastructure & Security (CRITICAL)

> [!IMPORTANT]
> These features must be implemented before moving to Phase 2 or production.

### Input Validation
**Package:** `express-validator`

```typescript
// Example validation
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }),
body('latitude').isFloat({ min: -90, max: 90 }),
body('longitude').isFloat({ min: -180, max: 180 })
```

**Endpoints to validate:**
- All auth endpoints
- Order creation
- Box creation
- Rating submission

---

### Error Handling Middleware

Create `src/middlewares/errorHandler.ts`:

```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(status).json({ error: message });
};
```

Apply globally in `index.ts`:
```typescript
app.use(errorHandler); // Last middleware
```

---

### Rate Limiting

**Package:** `express-rate-limit`

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

app.use('/api/auth/user/login', authLimiter);
app.use('/api/auth/vendor/login', authLimiter);
```

---

### Request Logging

**Package:** `morgan`

```typescript
import morgan from 'morgan';

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
```

---

### Security Headers

**Package:** `helmet`

```typescript
import helmet from 'helmet';

app.use(helmet());
```

---

### CORS Configuration

Update from wildcard to specific origins:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
```

Add to `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

---

### Race Condition Protection

**Problem:** Multiple users buying the last box simultaneously.

**Solution:** Prisma transactions with optimistic locking:

```typescript
// In orderController.ts
await prisma.$transaction(async (tx) => {
  const box = await tx.surpriseBox.findUnique({ 
    where: { id: surpriseBoxId } 
  });
  
  if (!box || box.quantity < 1) {
    throw new Error('Box is sold out');
  }
  
  // Atomic decrement - only succeeds if quantity > 0
  const updated = await tx.surpriseBox.updateMany({
    where: { 
      id: surpriseBoxId, 
      quantity: { gt: 0 } 
    },
    data: { quantity: { decrement: 1 } }
  });
  
  if (updated.count === 0) {
    throw new Error('Box was just sold out');
  }
  
  const order = await tx.order.create({
    data: { userId, surpriseBoxId, ... }
  });
  
  return order;
});
```

---

### Geolocation Distance Calculation

**Haversine Formula Implementation:**

```typescript
// src/utils/distance.ts
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

**Usage in listing controller:**

```typescript
// GET /api/listings/nearby?lat=X&lng=Y&radius=5
const { lat, lng, radius = 5 } = req.query;

const allBoxes = await prisma.surpriseBox.findMany({
  include: { vendor: true }
});

const nearbyBoxes = allBoxes
  .map(box => ({
    ...box,
    distance: calculateDistance(lat, lng, box.vendor.latitude, box.vendor.longitude)
  }))
  .filter(box => box.distance <= radius)
  .sort((a, b) => a.distance - b.distance);
```

---

## Phase 2: Vendor Backend

- Vendor registration with approval workflow
- Box management (CRUD)
- Order management
- Analytics dashboard

---

## Phase 3: Mobile App

- React Native (Expo) setup
- Customer UI implementation
- Integration with backend APIs

---

## Future Enhancements (Post-MVP)

### Payment Integration
- Stripe or local payment gateway
- Add `paymentStatus` to Order model
- Webhook handling for payment confirmation

### Push Notifications
- Firebase Cloud Messaging (FCM)
- Notify on order confirmation
- Remind before pickup window closes

### Image Uploads
- Cloudinary integration
- Vendor can upload food photos
- Add `imageUrl` to SurpriseBox model

### Admin Panel
- Approve vendor registrations
- Handle disputes
- Platform analytics

---

## Dependencies to Install

```bash
# Phase 1.5 packages
yarn add express-validator express-rate-limit morgan helmet

# Type definitions
yarn add -D @types/morgan
```

---

## Environment Variables

Update `.env`:

```env
DATABASE_URL="prisma+postgres://..."
PORT=3000
JWT_SECRET="your-secret-key"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19006"
NODE_ENV="development"
```

---

## Verification Checklist

- [ ] All endpoints have input validation
- [ ] Error responses are consistent
- [ ] Auth endpoints are rate-limited
- [ ] Security headers are present
- [ ] CORS is restricted to known origins
- [ ] Race condition test passes (concurrent purchases)
- [ ] Geolocation returns correct nearby boxes
- [ ] Logs are structured and readable
