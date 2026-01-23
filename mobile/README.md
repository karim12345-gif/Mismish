# Mismish Mobile App - Setup & Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies (if needed)
```bash
cd /Users/karim/Desktop/Mismish/Mismish/mobile
npm install
```

### 2. Start the Development Server
```bash
npm start
```

This will open the Expo Dev Tools in your browser.

### 3. Run on Simulator/Device

**For iOS Simulator:**
```bash
npm run ios
```
Or press `i` in the terminal after running `npm start`

**For Android Emulator:**
```bash
npm run android
```
Or press `a` in the terminal after running `npm start`

**For Physical Device:**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal

---

## 📱 What You'll See

The welcome screen features:
- **Lottie Animation** - Professional bouncing smiley with floating food elements
- **MishMish Logo** - Fades in smoothly with a scale animation
- **Tagline** - "Delicious food, delivered fast"
- **Teal Background** - Brand color (#0d9488)

### Animation Timeline:
1. **0-200ms**: Screen loads with teal background
2. **200-800ms**: Smiley face bounces in with rotation wiggle
3. **600-1400ms**: "MishMish" text fades in and scales up
4. **Result**: Smooth, professional loading experience

---

## 🛠️ Technologies Used

- **Expo** - React Native framework
- **NativeWind v2** - Tailwind CSS for React Native
- **Lottie** - Professional animations from JSON files
- **React Native Reanimated** - Smooth 60fps animations for text
- **react-native-size-matters** - Responsive scaling across devices

---

## 📁 Project Structure

```
mobile/
├── App.tsx                                    # Main app entry point
├── src/
│   └── screens/
│       ├── unauthenticated/                   # Pre-login screens
│       │   ├── WelcomeScreen.tsx             # Animated welcome with Lottie
│       │   ├── LoginScreen.tsx               # Login (placeholder)
│       │   └── SignupScreen.tsx              # Signup (placeholder)
│       └── authenticated/                     # Post-login screens
│           ├── HomeScreen.tsx                # Home (placeholder)
│           └── ProfileScreen.tsx             # Profile (placeholder)
├── assets/
│   └── animations/
│       └── welcome.json                      # Lottie animation
├── tailwind.config.js                        # NativeWind configuration
├── babel.config.js                           # Babel with Reanimated plugin
└── package.json                              # Dependencies
```

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'mismish-teal': '#0d9488',  // Change this
}
```

### Adjust Animation Speed
Edit `WelcomeScreen.tsx`:
```typescript
// Make animations faster/slower
withTiming(1, { duration: 800 })  // Change duration
withSpring(1, { damping: 12 })    // Change spring physics
```

### Modify Smiley Face
The `SmileyFace` component in `WelcomeScreen.tsx` can be customized:
- Eye size/position
- Smile width
- Cheek placement

---

## 🐛 Troubleshooting

### "Metro bundler not starting"
```bash
npm start -- --clear
```

### "Reanimated plugin not working"
1. Clear cache: `npm start -- --clear`
2. Restart the dev server

### "NativeWind styles not applying"
1. Make sure `babel.config.js` includes `nativewind/babel`
2. Restart the dev server after config changes

---

## ✅ Next Steps

After testing the welcome screen:
1. Add navigation (React Navigation)
2. Create authentication screens (Login/Signup)
3. Integrate with backend API
4. Add more screens (Browse, Orders, Profile)

---

## 📝 Notes

- The welcome screen uses **responsive scaling** - it will look consistent on all device sizes
- Animations use **native drivers** for 60fps performance
- All colors are defined in Tailwind config for easy theming
- Screens are organized into **authenticated** and **unauthenticated** folders for better structure
- Lottie animations provide professional, lightweight animations from JSON files
