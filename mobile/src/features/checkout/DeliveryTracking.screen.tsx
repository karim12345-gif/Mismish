import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AuthenticatedStackParamList } from "../../navigation/AuthenticatedNavigator";
import { useCart } from "../../context/CartContext";
import { useLocation } from "../../context/LocationContext";

type DeliveryStatus = "PENDING" | "CONFIRMED" | "READY_FOR_PICKUP" | "ON_THE_WAY" | "DELIVERED";

const STATUS_STEPS: { status: DeliveryStatus; label: string; icon: string }[] = [
  { status: "PENDING",          label: "Order Placed",     icon: "clock" },
  { status: "CONFIRMED",        label: "Driver Assigned",  icon: "user" },
  { status: "READY_FOR_PICKUP", label: "At the Store",     icon: "shopping-bag" },
  { status: "ON_THE_WAY",       label: "On the Way",       icon: "truck" },
  { status: "DELIVERED",        label: "Delivered",        icon: "check-circle" },
];

const STATUS_HEADLINE: Record<DeliveryStatus, string> = {
  PENDING:          "Order placed — finding a driver",
  CONFIRMED:        "Driver assigned",
  READY_FOR_PICKUP: "Driver is at the store",
  ON_THE_WAY:       "Driver on his way to you",
  DELIVERED:        "Your order has been delivered!",
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const STEP_ORDER: DeliveryStatus[] = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "ON_THE_WAY", "DELIVERED"];

export default function DeliveryTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AuthenticatedStackParamList, "DeliveryTracking">>();
  const { clearCart } = useCart();
  const { location } = useLocation();

  const { order } = route.params;
  const bag = order.surpriseBox;
  const vendor = bag?.vendor;
  const currentStatus: DeliveryStatus = (order.status as DeliveryStatus) ?? "CONFIRMED";
  const currentStepIndex = STEP_ORDER.indexOf(currentStatus);

  const vendorLat = vendor?.latitude ?? 24.7136;
  const vendorLng = vendor?.longitude ?? 46.6753;
  const userLat   = location?.coords.latitude  ?? 24.7236;
  const userLng   = location?.coords.longitude ?? 46.6853;

  const midLat = (vendorLat + userLat) / 2;
  const midLng = (vendorLng + userLng) / 2;
  const latDelta = Math.abs(vendorLat - userLat) * 2.5 + 0.01;
  const lngDelta = Math.abs(vendorLng - userLng) * 2.5 + 0.01;

  const estimatedDelivery = bag?.pickupEnd
    ? `Today, ${fmtTime(bag.pickupStart ?? "")} – ${fmtTime(bag.pickupEnd)}`
    : "Estimating...";

  const handleGoHome = () => {
    clearCart();
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
          <Feather name="chevron-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] font-black text-[16px]">Order Tracking</Text>
        <TouchableOpacity className="flex-row items-center gap-1">
          <Feather name="headphones" size={16} color="#366150" />
          <Text className="text-[#366150] font-bold text-[13px]">Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status hero */}
        <View className="px-5 pt-5 pb-4">
          <Text className="text-[#111] font-black text-[20px] mb-1">
            {STATUS_HEADLINE[currentStatus]}
          </Text>
          <Text className="text-gray-400 font-medium text-[13px]">
            Estimated delivery:{" "}
            <Text className="text-[#366150] font-bold">{estimatedDelivery}</Text>
          </Text>
        </View>

        {/* Progress steps */}
        <View className="px-5 pb-5">
          <View className="flex-row items-center">
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= currentStepIndex;
              const active  = i === currentStepIndex;
              const isLast  = i === STATUS_STEPS.length - 1;
              return (
                <React.Fragment key={step.status}>
                  <View className="items-center">
                    <View className={`w-9 h-9 rounded-full items-center justify-center border-2 ${
                      done ? "bg-[#366150] border-[#366150]" : "bg-white border-gray-200"
                    } ${active ? "shadow-md shadow-[#36615050]" : ""}`}>
                      <Feather name={step.icon as any} size={15} color={done ? "#fff" : "#ccc"} />
                    </View>
                  </View>
                  {!isLast && (
                    <View className={`flex-1 h-[2px] ${i < currentStepIndex ? "bg-[#366150]" : "bg-gray-100"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          <View className="flex-row justify-between mt-1.5">
            {STATUS_STEPS.map((step) => (
              <Text key={step.status} className="text-[9px] text-gray-400 font-semibold text-center" style={{ width: 36 }}>
                {step.label.split(" ")[0]}
              </Text>
            ))}
          </View>
        </View>

        {/* Courier card */}
        <View className="mx-5 mb-4 bg-white border border-gray-100 rounded-2xl px-4 py-4 flex-row items-center shadow-sm shadow-black/5">
          <View className="w-11 h-11 rounded-full bg-[#E8F0ED] items-center justify-center mr-3">
            <MaterialCommunityIcons name="bike" size={22} color="#366150" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-400 text-[11px] font-semibold">Courier</Text>
            <Text className="text-[#111] font-black text-[14px]">Mismish Delivery</Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("tel:+966500000000")}
            className="w-10 h-10 rounded-full bg-[#E8F0ED] items-center justify-center"
          >
            <Feather name="phone" size={16} color="#366150" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden h-[200px] border border-gray-100">
          <MapView
            style={{ flex: 1 }}
            region={{ latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}
            scrollEnabled={false}
          >
            {/* Store pin */}
            <Marker coordinate={{ latitude: vendorLat, longitude: vendorLng }} title={vendor?.name ?? "Store"}>
              <View className="w-9 h-9 rounded-full bg-[#366150] items-center justify-center border-2 border-white shadow-md">
                <Feather name="shopping-bag" size={16} color="#fff" />
              </View>
            </Marker>
            {/* User pin */}
            {location && (
              <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="Your location">
                <View className="w-9 h-9 rounded-full bg-[#FF7F50] items-center justify-center border-2 border-white shadow-md">
                  <Feather name="home" size={16} color="#fff" />
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        {/* Order Summary */}
        <View className="mx-5 mb-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shadow-black/5">
          <Text className="text-[#111] font-black text-[15px] mb-3">Order Summary</Text>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#F4F4F4] rounded-xl items-center justify-center">
                <Text style={{ fontSize: 18 }}>🎁</Text>
              </View>
              <View>
                <Text className="text-[#111] font-bold text-[13px]">{bag?.name ?? "Surprise Bag"}</Text>
                <Text className="text-gray-400 text-[11px] font-medium">#{order.orderCode}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 bg-[#E8F0ED] px-2 py-1 rounded-lg">
              <MaterialCommunityIcons name="bike" size={12} color="#366150" />
              <Text className="text-[#366150] font-bold text-[11px]">Delivery</Text>
            </View>
          </View>
          <View className="h-[1px] bg-gray-100 my-3" />
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-[13px] font-medium">Total paid</Text>
            <Text className="text-[#111] font-black text-[13px]">SAR {bag?.price?.toFixed(2) ?? "—"}</Text>
          </View>
        </View>

        {/* Go home */}
        <View className="mx-5 mb-10">
          <TouchableOpacity onPress={handleGoHome}
            className="bg-[#366150] h-13 rounded-2xl items-center justify-center py-4">
            <Text className="text-white font-black text-[15px]">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
