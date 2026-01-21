# Design Decisions & Tradeoffs

## 1. Customer-First Development Strategy

**Decision:** Build Customer backend + mobile app before Vendor portal

**Rationale:**
- Faster time-to-market for user-facing features
- Early user feedback on core value proposition
- Vendors can be onboarded manually initially

**Tradeoffs:**
- ✅ Faster MVP validation
- ✅ Focus on user experience first
- ❌ Manual vendor onboarding overhead
- ❌ Delayed vendor self-service

---

## 2. Prisma Accelerate (Remote DB)

**Decision:** Use Prisma Accelerate instead of local PostgreSQL

**Rationale:**
- Global connection pooling
- Built-in caching layer
- Reduced latency for distributed users
- No local DB setup required

**Tradeoffs:**
- ✅ Production-ready from day 1
- ✅ Better performance for global users
- ✅ Simplified deployment
- ❌ Dependency on external service
- ❌ Potential cost at scale
- ❌ Requires internet for development

---

## 3. TypeScript for Backend

**Decision:** Use TypeScript instead of JavaScript

**Rationale:**
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Easier refactoring
- Industry standard for modern Node.js

**Tradeoffs:**
- ✅ Fewer bugs in production
- ✅ Better developer experience
- ✅ Self-documenting code
- ❌ Slightly slower development initially
- ❌ Build step required

---

## 4. Monorepo Structure

**Decision:** Keep backend and mobile in same project root

**Rationale:**
- Shared types and interfaces (future)
- Single repository to manage
- Easier for solo/small team development

**Tradeoffs:**
- ✅ Simplified project management
- ✅ Code sharing potential
- ❌ Larger repository size
- ❌ Potential deployment complexity

---

## 5. JWT Authentication

**Decision:** Use JWT tokens instead of session-based auth

**Rationale:**
- Stateless API design
- Mobile-friendly
- Easy to scale horizontally
- No server-side session storage

**Tradeoffs:**
- ✅ Scalable and stateless
- ✅ Works well with mobile apps
- ❌ Cannot revoke tokens easily
- ❌ Larger payload than session IDs

---

## 6. Separate User & Vendor Models

**Decision:** Two separate tables instead of single "User" with roles

**Rationale:**
- Different data requirements
- Clearer separation of concerns
- Easier to extend vendor-specific features
- Better security isolation

**Tradeoffs:**
- ✅ Clear data model
- ✅ Easier to add vendor-specific fields
- ❌ More complex auth logic
- ❌ Code duplication in controllers

---

## 7. Expo for Mobile Development

**Decision:** Use Expo instead of bare React Native (Planned)

**Rationale:**
- Faster development with managed workflow
- Built-in features (camera, location, etc.)
- Easy OTA updates
- Simpler build process

**Tradeoffs:**
- ✅ Rapid prototyping
- ✅ Cross-platform by default
- ❌ Limited native module access
- ❌ Larger app size

---

## 8. No Microservices (Yet)

**Decision:** Monolithic API instead of microservices

**Rationale:**
- Simpler to develop and deploy
- Sufficient for MVP scale
- Lower operational complexity
- Can refactor later if needed

**Tradeoffs:**
- ✅ Faster development
- ✅ Easier debugging
- ✅ Lower infrastructure cost
- ❌ Harder to scale specific features
- ❌ Tight coupling

---

## Future Considerations

### Payment Integration
- **Options:** Stripe, PayPal, local payment gateways
- **Decision:** TBD based on target market

### Real-time Features
- **Options:** WebSockets, Server-Sent Events, Polling
- **Decision:** TBD (likely polling for MVP)

### Image Storage
- **Options:** Cloudinary, AWS S3, local storage
- **Decision:** TBD (needed for vendor photos)

### Push Notifications
- **Options:** Firebase, OneSignal, native
- **Decision:** TBD (needed for order updates)
