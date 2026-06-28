# Backend Engineering Notes

## Analytics — Frontend vs Backend Computation

### Current approach (fine for now)
`GET /vendors/v1/orders` returns **all orders** for the vendor.
The dashboard frontend filters and aggregates them in the browser (today vs yesterday, last 7 days, etc.).

This works well at small order volumes (< ~5,000 orders per vendor).

### When to migrate to a backend stats endpoint
Once a vendor accumulates thousands of orders, fetching all of them on every page load becomes slow.
At that point, add a pre-aggregated stats endpoint:

```
GET /vendors/v1/stats?range=7D   # 7D | 1M | 3M | 6M | 1Y
```

Response shape (example):
```json
{
  "revenue": 4500,
  "bags": 90,
  "avgBasket": 50,
  "co2Saved": 225,
  "trend": "+12%",
  "chartData": [
    { "label": "Mon", "sales": 200, "bags": 4 },
    ...
  ]
}
```

Implementation: use Prisma `groupBy` + `_sum` aggregations, filtered by `createdAt >= cutoff`.

### Redis caching (future)
Stats endpoints are perfect candidates for Redis caching since:
- They're read-heavy and expensive to recompute
- Slight staleness (e.g. 5 min TTL) is acceptable for analytics

Cache key pattern: `vendor:stats:{vendorId}:{range}`

Example with ioredis:
```ts
const cacheKey = `vendor:stats:${vendorId}:${range}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const stats = await computeStats(vendorId, range);
await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 min TTL
return stats;
```

Invalidate on: new order created, order status changed to CANCELLED.
