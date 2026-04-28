import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import { AuthenticatedStackParamList } from "../../navigation/AuthenticatedNavigator";
import { useCart } from "../../context/CartContext";

const CORAL = "#FF7F50";

const formatPickupTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const label = isToday ? "Today" : "Tomorrow";
  return `${label}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
};

export default function BookingConfirmedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AuthenticatedStackParamList, "BookingConfirmed">>();
  const { clearCart } = useCart();
  const { order } = route.params;

  const bag = order.surpriseBox;
  const vendor = bag?.vendor;

  const handleBackToHome = () => {
    clearCart();
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const handleViewOrders = () => {
    clearCart();
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "MainTabs",
          params: { screen: "Orders" },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces={false}
      >
        {/* ── Coral hero ── */}
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color={CORAL} />
          </View>
          <Text style={styles.heroTitle}>Booking Confirmed!</Text>
          <Text style={styles.heroSubtitle}>Your surprise bag is waiting</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>

          {/* Store info */}
          <View style={styles.storeRow}>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{vendor?.name ?? "Store"}</Text>
              {vendor?.address && (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={12} color="#888" />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {vendor.address}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified Store</Text>
            </View>
          </View>

          {/* QR code */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrBox}>
              <QRCode
                value={order.orderCode}
                size={160}
                color="#111"
                backgroundColor="#fff"
              />
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.qrLabel}>SHOW THIS CODE TO STORE STAFF</Text>
          </View>

          {/* Order details grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>ORDER ID</Text>
              <Text style={styles.gridValue}>{order.orderCode}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>BAG TYPE</Text>
              <Text style={styles.gridValue}>{bag?.name ?? "Surprise Bag"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>COLLECT BY</Text>
              <View style={styles.collectRow}>
                <Ionicons name="time-outline" size={13} color={CORAL} />
                <Text style={[styles.gridValue, { color: CORAL, marginLeft: 4 }]}>
                  {bag?.pickupEnd ? formatPickupTime(bag.pickupEnd) : "—"}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>QUANTITY</Text>
              <View style={styles.collectRow}>
                <MaterialCommunityIcons name="shopping-outline" size={13} color="#111" />
                <Text style={[styles.gridValue, { marginLeft: 4 }]}>1 Surprise Bag</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Next Steps ── */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#111" />
            <Text style={styles.stepsTitle}>Next Steps</Text>
          </View>

          {[
            { icon: "location-outline", text: `Go to ${vendor?.name ?? "the store"}` },
            { icon: "chatbubble-ellipses-outline", text: "Tell the staff you have a Mismish booking" },
            { icon: "qr-code-outline", text: "Let them scan the QR code above" },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Ionicons name={step.icon as any} size={18} color="#555" style={styles.stepIcon} />
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleBackToHome} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Back to Home</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewOrders} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>View My Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Need help? </Text>
          <TouchableOpacity>
            <Text style={[styles.footerText, { color: CORAL, fontWeight: "700" }]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerSecure}>SECURE BOOKING · MISMISH</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  scroll: { paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: CORAL,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 48,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 26,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "500",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  storeInfo: { flex: 1, marginRight: 12 },
  storeName: { color: "#111", fontWeight: "900", fontSize: 16, marginBottom: 4 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressText: { color: "#888", fontSize: 12, flex: 1 },
  verifiedBadge: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: { color: "#555", fontSize: 11, fontWeight: "600" },

  // QR
  qrWrapper: { alignItems: "center", marginBottom: 20 },
  qrBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: CORAL,
  },
  cornerTL: { top: 6, left: 6, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 6, right: 6, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 6, left: 6, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 6, right: 6, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  qrLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 12,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    paddingTop: 16,
    gap: 16,
  },
  gridItem: { width: "45%" },
  gridLabel: { color: "#aaa", fontSize: 10, fontWeight: "700", letterSpacing: 0.8, marginBottom: 4 },
  gridValue: { color: "#111", fontSize: 13, fontWeight: "800" },
  collectRow: { flexDirection: "row", alignItems: "center" },

  // Steps
  stepsContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 6 },
  stepsTitle: { color: "#111", fontWeight: "900", fontSize: 15 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  stepIcon: { marginRight: 10 },
  stepText: { color: "#333", fontSize: 13, fontWeight: "500", flex: 1 },

  // Actions
  actions: { marginHorizontal: 16, marginTop: 20, gap: 10 },
  primaryBtn: {
    backgroundColor: CORAL,
    borderRadius: 18,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondaryBtn: {
    borderRadius: 18,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#111", fontWeight: "700", fontSize: 15 },

  // Footer
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#aaa", fontSize: 12 },
  footerSecure: {
    color: "#ccc",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 8,
  },
});
