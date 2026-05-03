import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { Ionicons } from "@expo/vector-icons";

const CORAL = "#FF7F50";
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 95 : 75;
const FALLBACK_SECONDS = 9 * 60; // 9 min if no pickupEnd

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getSecondsLeft(pickupEnd?: string): number {
  if (!pickupEnd) return FALLBACK_SECONDS;
  const ms = new Date(pickupEnd).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

export default function CartReservationBanner() {
  const { cartItems, totalQuantity, clearCart } = useCart();
  const navigation = useNavigation<any>();
  const hasItems = totalQuantity > 0;

  const firstItem = cartItems[0];
  const pickupEnd = firstItem?.pickupEnd;

  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(pickupEnd));
  const slideAnim = useRef(new Animated.Value(200)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mounted, setMounted] = useState(hasItems);

  // Sync mount state
  useEffect(() => {
    if (hasItems && !mounted) setMounted(true);
  }, [hasItems, mounted]);

  // Slide up / down
  useEffect(() => {
    if (hasItems) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }).start();
    } else if (mounted) {
      Animated.timing(slideAnim, { toValue: 200, duration: 300, useNativeDriver: true }).start(() => setMounted(false));
    }
  }, [hasItems, mounted]);

  // Reset timer when pickupEnd changes (new item added)
  useEffect(() => {
    setSecondsLeft(getSecondsLeft(pickupEnd));
  }, [pickupEnd]);

  // Countdown — auto-clear when expired
  useEffect(() => {
    if (!hasItems) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          clearCart();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasItems, clearCart]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { bottom: TAB_BAR_HEIGHT + 12 },
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Pressable
        onPress={() => navigation.navigate("Cart")}
        style={({ pressed }) => [styles.banner, pressed && { opacity: 0.88 }]}
      >
        <Ionicons name="cart" size={26} color="#fff" />

        <View style={styles.middle}>
          <Text style={styles.timerLabel}>
            Reserve it before it's gone {fmt(secondsLeft)}
          </Text>
          <Text style={styles.storeName} numberOfLines={1}>
            {firstItem?.title ?? "Surprise Bag"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalQuantity}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 999,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CORAL,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 14,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  middle: { flex: 1, gap: 2 },
  timerLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
    includeFontPadding: false,
  },
  storeName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    includeFontPadding: false,
  },
  badge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: CORAL,
    fontSize: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },
});
