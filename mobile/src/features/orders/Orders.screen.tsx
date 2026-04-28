import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMyOrders } from "../../hooks/useMyOrders";
import { useCollectOrder } from "../../hooks/useCollectOrder";
import { useQueryClient } from "@tanstack/react-query";
import {
  Order,
  OrderStatus,
  OrderServices,
} from "../../services/order/order.service";
import { MY_ORDERS_QUERY_KEY } from "../../hooks/useMyOrders";
import { OrdersSkeleton } from "./components/OrdersSkeleton";
import {
  STATUS_CONFIG,
  TAB_BADGE_SELECTED,
  TAB_BADGE_UNSELECTED,
  TAB_BADGE_TEXT_SELECTED,
  TAB_BADGE_TEXT_UNSELECTED,
  styles,
} from "./Orders.styles";

const ACTIVE_STATUSES: Order["status"][] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "ON_THE_WAY",
];

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
    ? "Today"
    : "Tomorrow";
};

import { IMPACT_STATS_QUERY_KEY } from "../../hooks/useImpactStats";

const STATUS_CYCLE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "ON_THE_WAY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];
const STATUS_CYCLE_LABELS: Record<OrderStatus, string> = {
  PENDING: "→ Confirmed",
  CONFIRMED: "→ Ready",
  READY_FOR_PICKUP: "→ On the Way",
  ON_THE_WAY: "→ Delivered",
  DELIVERED: "→ Collected",
  COMPLETED: "→ Cancelled",
  CANCELLED: "→ Pending",
};

function OrderCard({ order }: { order: Order }) {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { mutate: collectOrder, isPending: isCollecting } = useCollectOrder();
  const bag = order.surpriseBox;
  const vendor = bag?.vendor;
  const status = STATUS_CONFIG[order.status];
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const isConfirmed = order.status === "CONFIRMED";

  const cycleStatus = async () => {
    const next =
      STATUS_CYCLE[
        (STATUS_CYCLE.indexOf(order.status) + 1) % STATUS_CYCLE.length
      ];
    await OrderServices.devSetStatus(order.id, next);
    queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: IMPACT_STATS_QUERY_KEY });
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm shadow-black/5">
      {/* Top row: image + info + badge */}
      <View className="flex-row items-start mb-4">
        <View className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 mr-3">
          {bag?.imageUrl ? (
            <Image
              source={{ uri: bag.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-2xl">🎁</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text
              className="text-[#111] font-black text-[15px] flex-1 mr-2"
              numberOfLines={1}
            >
              {vendor?.name ?? "Store"}
            </Text>
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: status.bg }}
            >
              <Text
                className="font-black text-[11px]"
                style={{ color: status.color }}
              >
                {status.label}
              </Text>
            </View>
          </View>

          <Text className="text-gray-500 font-medium text-[13px] mb-1.5">
            1 Surprise Bag · SAR {bag?.price?.toFixed(2) ?? "—"}
          </Text>

          {bag?.pickupStart && bag?.pickupEnd && (
            <View className="flex-row items-center">
              <Feather name="clock" size={12} color="#aaa" />
              <Text className="text-gray-400 font-medium text-[12px] ml-1">
                {fmtTime(bag.pickupStart)} – {fmtTime(bag.pickupEnd)}
                {"  "}
                <Text className="text-[#111] font-bold">
                  {dayLabel(bag.pickupEnd)}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* DEV: cycle order status */}
      {__DEV__ && (
        <TouchableOpacity
          onPress={cycleStatus}
          className="mb-3 h-8 rounded-lg border border-dashed border-gray-300 items-center justify-center"
        >
          <Text className="text-gray-400 font-bold text-[11px]">
            [DEV] {order.status} {STATUS_CYCLE_LABELS[order.status]}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action row — only for active orders */}
      {isActive && (
        <View className="flex-col gap-2">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("BookingConfirmed", { order })}
              className="flex-1 h-11 rounded-xl bg-[#111] flex-row items-center justify-center gap-2"
            >
              <Ionicons name="qr-code-outline" size={16} color="#fff" />
              <Text className="text-white font-black text-[13px]">
                View QR Code
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-11 h-11 rounded-xl border border-gray-200 items-center justify-center bg-white">
              <Feather name="map-pin" size={16} color="#FF7F50" />
            </TouchableOpacity>
          </View>

          {isConfirmed && (
            <TouchableOpacity
              onPress={() => collectOrder(order.id)}
              disabled={isCollecting}
              className="h-11 rounded-xl border border-[#18C96D] flex-row items-center justify-center gap-2"
              style={
                isCollecting ? styles.collectDisabled : styles.collectEnabled
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#18C96D"
              />
              <Text className="text-[#18C96D] font-black text-[13px]">
                {isCollecting ? "Marking…" : "Mark as Collected"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const { data: orders, isLoading, isError, refetch } = useMyOrders();

  const activeOrders = (orders ?? []).filter((o) =>
    ACTIVE_STATUSES.includes(o.status),
  );
  const pastOrders = (orders ?? []).filter(
    (o) => !ACTIVE_STATUSES.includes(o.status),
  );
  const displayed = activeTab === "active" ? activeOrders : pastOrders;

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      <View className="items-center justify-center pt-2 pb-5">
        <Text className="text-[#111] font-black text-[18px]">Orders</Text>
      </View>

      {/* Segmented control */}
      <View className="px-5 mb-5">
        <View className="flex-row items-stretch h-10 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm shadow-black/5">
          {(["active", "past"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const count =
              tab === "active" ? activeOrders.length : pastOrders.length;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
                  isSelected ? "bg-[#FF7F50]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`font-bold text-[14px] ${
                    isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {tab === "active" ? "Active" : "Past Orders"}
                </Text>
                {tab === "active" && count > 0 && (
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={
                      isSelected ? TAB_BADGE_SELECTED : TAB_BADGE_UNSELECTED
                    }
                  >
                    <Text
                      className="font-black text-[11px]"
                      style={
                        isSelected
                          ? TAB_BADGE_TEXT_SELECTED
                          : TAB_BADGE_TEXT_UNSELECTED
                      }
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          <OrdersSkeleton />
        </ScrollView>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 text-center font-medium mb-4">
            Could not load orders.
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="text-[#FF7F50] font-bold">Try again</Text>
          </TouchableOpacity>
        </View>
      ) : displayed.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-24">
          <Image
            source={require("../../../assets/images/gift_bag.png")}
            style={{ width: 140, height: 170, marginBottom: 28 }}
            resizeMode="contain"
          />
          <Text className="text-[#111] font-black text-[20px] mb-2">
            {activeTab === "active" ? "No Active Orders" : "No Past Orders"}
          </Text>
          {activeTab === "active" && (
            <View className="items-center mt-1 w-full">
              <Text className="text-[#888] font-medium text-[14px] text-center px-10 mb-6">
                You don't have any orders in progress right now.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor="#FF7F50"
            />
          }
        >
          <View className="pt-1 pb-4">
            {displayed.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>

          {/* Info box — active tab only */}
          {activeTab === "active" && displayed.length > 0 && (
            <View className="flex-row items-center bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-4 py-3.5 mb-8 gap-3">
              <Ionicons name="qr-code-outline" size={28} color="#16A34A" />
              <Text className="flex-1 text-[#15803D] font-medium text-[13px] leading-5">
                Show your QR code to the shop staff at the counter to collect
                your surprise bag.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
