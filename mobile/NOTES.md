# Mobile Engineering Notes

## Analytics data fetching

Currently the mobile app does not have an analytics screen.
The vendor dashboard (mismish-Website) fetches all orders via `GET /vendors/v1/orders`
and computes stats on the frontend.

If an analytics screen is added to mobile in the future, follow the same pattern —
or wait until the backend `/vendors/v1/stats?range=7D` endpoint exists (see backend/NOTES.md).

## Push Notifications

Push notifications work on **physical devices only** — not on iOS Simulator.
The app guards registration with `Device.isDevice` to avoid errors on simulator.

To test push notifications:
1. Use a physical iPhone
2. Make sure `EXPO_PUBLIC_API_URL` points to the backend being tested
3. Sign in so the device FCM token is registered against the test user
4. Favorite a merchant, then publish a new offer from that merchant account
5. Place an order and update its status from the merchant dashboard

Notification-driven cache invalidation is wired in `usePushNotifications.ts`:
- Foreground: `addNotificationReceivedListener` → invalidates `["orders"]` query key
- Background tap: `addNotificationResponseReceivedListener` → same invalidation
- Favorite-offer tap: opens the merchant and matching offer
- Pickup/completion tap: fetches and opens the matching order details

The backend schedules pickup reminders at 1 hour and 15 minutes before
`pickupStart`. For local manual testing only, start the backend with
`PICKUP_REMINDER_TEST_MODE=true`; the reminders then run 2 minutes and 1 minute
before pickup. The override is ignored when `NODE_ENV=production`.

## Cart Persistence

Cart items are persisted to AsyncStorage under key `@mismish_cart`.
The `CartContext` loads on mount and saves on every change.
Cart is NOT synced to the backend — it lives on-device only.

If server-side cart is needed in future (e.g. for cross-device sync), the cart
should be migrated to a `POST /cart` API similar to how FavoritesContext was migrated.
