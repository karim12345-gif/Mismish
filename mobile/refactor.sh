#!/bin/bash
cd /Users/karim/Desktop/Mismish/Mismish/mobile/src

# Move Auth Unauthenticated
mv screens/unauthenticated/*.tsx features/auth/screens/
mv screens/unauthenticated/onboarding/* features/auth/onboarding/

# Move Home
mv screens/authenticated/HomeScreen.tsx features/home/Home.screen.tsx
mv screens/authenticated/home/components/* features/home/components/

# Move Map
mv screens/authenticated/MapScreen.tsx features/map/MapScreen.tsx
mv screens/authenticated/map/* features/map/ 2>/dev/null || true

# Move Store (Surprise Bag, Time Selection)
mv screens/authenticated/SurpriseBagScreen.tsx features/store/SurpriseBag.screen.tsx
mv screens/authenticated/components/AvailabilityTimeBottomSheet.tsx features/store/
mv screens/authenticated/components/StoreItemCard.tsx features/store/
mv screens/authenticated/components/SurpriseBagBottomSheet.tsx features/store/

# Move Shared Global Components
mv screens/authenticated/components/AIAssistantBottomSheet.tsx components/
mv screens/authenticated/components/GuestAuthModal.tsx components/
mv screens/authenticated/components/HowMismishWorksModal.tsx components/

# Move Checkout
mv screens/authenticated/checkout/CheckoutScreen.tsx features/checkout/Checkout.screen.tsx
mv screens/authenticated/checkout/components/* features/checkout/components/

# Move Cart
mv screens/authenticated/cart/CartScreen.tsx features/cart/Cart.screen.tsx
mv screens/authenticated/cart/components/* features/cart/components/

# Move Orders
mv screens/authenticated/OrdersScreen.tsx features/orders/Orders.screen.tsx

# Move Profile / Account
mkdir -p features/profile/screens
mv screens/authenticated/ProfileScreen.tsx features/profile/screens/ProfileScreen.tsx
mv screens/authenticated/CompleteProfileScreen.tsx features/profile/screens/CompleteProfileScreen.tsx
mv screens/authenticated/SettingsScreen.tsx features/profile/screens/SettingsScreen.tsx
mv screens/authenticated/AddNewCardScreen.tsx features/profile/screens/AddNewCardScreen.tsx 2>/dev/null || true

# Move Wallet
mv screens/authenticated/WalletScreen.tsx features/wallet/Wallet.screen.tsx

# Move Location
mv screens/authenticated/SelectLocationScreen.tsx features/location/SelectLocationScreen.tsx

# Placeholder fallback
mv screens/authenticated/PlaceholderScreen.tsx features/profile/screens/PlaceholderScreen.tsx 2>/dev/null || true

# Clean up empty directories
rm -rf screens/unauthenticated/onboarding
rm -rf screens/unauthenticated
rm -rf screens/authenticated/home/components
rm -rf screens/authenticated/home
rm -rf screens/authenticated/map
rm -rf screens/authenticated/checkout/components
rm -rf screens/authenticated/checkout
rm -rf screens/authenticated/cart/components
rm -rf screens/authenticated/cart
rm -rf screens/authenticated/components
rm -rf screens/authenticated
rmdir screens 2>/dev/null || true
