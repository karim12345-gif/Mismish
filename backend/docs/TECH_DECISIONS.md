# Technology Decisions - State Management & Validation

## State Management for Mobile App

### Recommendation: **React Query + Zustand** ✅

Here's why this combination is ideal for Mismish:

---

### React Query (TanStack Query)
**Use for: Server State**

**What it handles:**
- Fetching surprise boxes
- User orders
- Vendor details
- Ratings

**Why it's perfect for Mismish:**
```typescript
// Automatic caching and background refetch
const { data: nearbyBoxes, isLoading } = useQuery({
  queryKey: ['boxes', userLocation],
  queryFn: () => fetchNearbyBoxes(userLocation),
  staleTime: 30000, // Refetch every 30s (boxes sell out fast!)
});

// Optimistic updates for purchases
const purchaseMutation = useMutation({
  mutationFn: purchaseBox,
  onMutate: async (boxId) => {
    // Optimistically update UI before server responds
    await queryClient.cancelQueries(['boxes']);
    const previous = queryClient.getQueryData(['boxes']);
    queryClient.setQueryData(['boxes'], (old) => 
      old.map(box => box.id === boxId ? {...box, quantity: box.quantity - 1} : box)
    );
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['boxes'], context.previous);
  }
});
```

**Benefits:**
- ✅ Built-in caching (reduce API calls)
- ✅ Automatic background refetch (always fresh data)
- ✅ Optimistic updates (instant UI feedback)
- ✅ Loading/error states handled
- ✅ Offline support with persistence

---

### Zustand
**Use for: Client State**

**What it handles:**
- Auth token
- User location
- UI state (filters, modals)
- App preferences

**Why it's perfect:**
```typescript
// Simple, lightweight store
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' } // Persists to AsyncStorage
  )
);

// Usage in components
const { token, user, setAuth } = useAuthStore();
```

**Benefits:**
- ✅ Tiny bundle size (~1KB)
- ✅ No boilerplate (unlike Redux)
- ✅ Built-in persistence
- ✅ TypeScript-first

---

### Why NOT Redux?

**Redux is overkill for Mismish:**
- ❌ Too much boilerplate (actions, reducers, middleware)
- ❌ Larger bundle size
- ❌ Harder to learn for new devs
- ❌ React Query already handles most of what Redux does

**When to use Redux:**
- Large enterprise apps with complex state logic
- Time-travel debugging requirements
- You already have a Redux codebase

---

## Comparison Table

| Feature | React Query + Zustand | Redux Toolkit | Context API |
|---------|----------------------|---------------|-------------|
| Bundle Size | ~15KB | ~50KB | 0KB (built-in) |
| Learning Curve | Low | Medium | Low |
| Server State | ✅ Excellent | ⚠️ Manual | ❌ Poor |
| Client State | ✅ Simple | ✅ Good | ⚠️ Verbose |
| Caching | ✅ Built-in | ❌ Manual | ❌ None |
| Optimistic Updates | ✅ Easy | ⚠️ Complex | ❌ Manual |
| DevTools | ✅ Yes | ✅ Yes | ❌ No |
| TypeScript | ✅ Excellent | ✅ Good | ⚠️ Manual |

---

## Validation: Zod vs Express-Validator

### Recommendation: **Zod** ✅

**Why Zod is better for Mismish:**

### 1. **Type Safety**
```typescript
// Define schema once, use everywhere
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// TypeScript type automatically inferred!
type SignupData = z.infer<typeof SignupSchema>;
```

### 2. **Share Schemas Between Backend & Mobile**
```typescript
// shared/schemas/auth.ts (can be used in both projects)
export const SignupSchema = z.object({...});

// Backend
app.post('/signup', validate(SignupSchema), async (req, res) => {
  const data = SignupSchema.parse(req.body); // Throws if invalid
});

// Mobile
const { handleSubmit } = useForm({
  resolver: zodResolver(SignupSchema), // Same schema!
});
```

### 3. **Better Error Messages**
```typescript
const result = SignupSchema.safeParse(data);

if (!result.success) {
  console.log(result.error.flatten());
  // {
  //   email: ["Invalid email"],
  //   password: ["String must contain at least 8 character(s)"]
  // }
}
```

### 4. **Runtime + Compile-time Safety**
```typescript
// Express-validator: only runtime
body('email').isEmail(); // No TypeScript type

// Zod: both runtime AND compile-time
const email = SignupSchema.shape.email; // TypeScript knows it's a string
```

---

### Comparison: Zod vs Express-Validator

| Feature | Zod | Express-Validator |
|---------|-----|-------------------|
| Type Safety | ✅ Full | ❌ None |
| Code Sharing | ✅ Backend + Mobile | ❌ Backend only |
| Bundle Size | ~8KB | ~50KB |
| Error Messages | ✅ Structured | ⚠️ Array of strings |
| Learning Curve | Low | Low |
| Composability | ✅ Excellent | ⚠️ Limited |

---

## Implementation Plan

### Phase 1: Backend Validation with Zod

```bash
yarn add zod
```

```typescript
// src/middlewares/validate.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.flatten() 
        });
      }
      next(error);
    }
  };
};

// Usage
app.post('/api/auth/user/signup', validate(SignupSchema), registerUser);
```

### Phase 2: Mobile State Management

```bash
# In mobile project
yarn add @tanstack/react-query zustand
yarn add react-hook-form @hookform/resolvers
```

```typescript
// Setup React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      retry: 2,
    },
  },
});

// App.tsx
<QueryClientProvider client={queryClient}>
  <Navigation />
</QueryClientProvider>
```

---

## Summary

**For Mismish, use:**
1. **React Query** - Server state (API data)
2. **Zustand** - Client state (auth, UI)
3. **Zod** - Validation (backend + mobile)

This stack is:
- ✅ Modern and actively maintained
- ✅ Lightweight (small bundle)
- ✅ Type-safe
- ✅ Easy to learn
- ✅ Perfect for food delivery use case
