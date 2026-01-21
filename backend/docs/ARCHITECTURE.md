# System Architecture

## High-Level Overview

![System Architecture Diagram](./system_architecture.png)

---

## Database Architecture

![Database Entity Relationship Diagram](./database_erd.png)

---

## API Structure

### Authentication Endpoints
- `POST /api/auth/user/signup` - Customer registration
- `POST /api/auth/user/login` - Customer login
- `POST /api/auth/vendor/signup` - Vendor registration
- `POST /api/auth/vendor/login` - Vendor login

### Customer Endpoints (Planned)
- `GET /api/listings/nearby` - Browse nearby boxes
- `GET /api/listings/:id` - View box details
- `POST /api/orders` - Purchase box (initiate payment)
- `GET /api/orders` - View order history
- `POST /api/vendors/:id/favorite` - Toggle favorite
- `GET /api/vendors/:id/reviews` - View vendor reviews
- `POST /api/orders/:id/review` - Rate completed order

### Vendor Endpoints (Planned)
- `POST /api/vendor/boxes` - Create surprise box
- `GET /api/vendor/boxes` - List vendor's boxes
- `PATCH /api/vendor/boxes/:id` - Update box
- `GET /api/vendor/orders` - View orders
- `PATCH /api/vendor/orders/:id/collect` - Mark collected

---

## Technology Stack

### Backend
- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Prisma Accelerate)
- **Auth:** JWT + bcrypt
- **Validation:** Zod (type-safe schemas)
- **Package Manager:** Yarn

### Mobile (Planned)
- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **HTTP Client:** Axios
- **State Management:** React Query + Zustand
  - **React Query:** Server state (API data, caching, sync)
  - **Zustand:** Client state (UI, auth token, user preferences)
- **Validation:** Zod (shared schemas with backend)
- **UI Library:** TBD (pending design review)

### Vendor Portal (Future)
- **Framework:** Next.js / React
- **UI Library:** TBD

---

## Security Considerations

1. **Password Hashing:** bcrypt with salt rounds = 10
2. **JWT Tokens:** 7-day expiry for users, 1-day for vendors
3. **Environment Variables:** Sensitive data in `.env` (gitignored)
4. **HTTPS Only:** Production deployment
5. **Input Validation:** TBD (express-validator)

---

## Scalability Strategy

1. **Database:** Prisma Accelerate for connection pooling + global cache
2. **API:** Stateless design for horizontal scaling
3. **Geolocation:** Indexed lat/long for fast nearby queries
4. **Caching:** Redis for frequently accessed data (future)
