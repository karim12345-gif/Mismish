import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useMyOrders } from "../../hooks/useMyOrders";
import { Order } from "../../services/order/order.service";
import { useAuth } from "../../context/AuthContext";
import { GuestAuthModal } from "../../components/GuestAuthModal";

const ACTIVE_STATUSES: Order["status"][] = ["PENDING", "CONFIRMED"];

const statusLabel: Record<Order["status"], string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusColor: Record<Order["status"], string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#10B981",
  COMPLETED: "#6B7280",
  CANCELLED: "#EF4444",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function OrderCard({ order }: { order: Order }) {
  const store = order.surpriseBox?.vendor;
  const bag = order.surpriseBox;

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm shadow-black/5">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-3">
          <Text
            className="text-[#111] font-black text-[15px] mb-0.5"
            numberOfLines={1}
          >
            {bag?.name ?? "Surprise Bag"}
          </Text>
          <Text className="text-gray-500 font-medium text-[12px]">
            {store?.name ?? "—"}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor[order.status]}20` }}
        >
          <Text
            className="font-black text-[11px]"
            style={{ color: statusColor[order.status] }}
          >
            {statusLabel[order.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View className="flex-row items-center">
          <Feather name="hash" size={12} color="#888" />
          <Text className="text-gray-500 font-bold text-[12px] ml-1">
            {order.orderCode}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Feather name="calendar" size={12} color="#888" />
          <Text className="text-gray-500 font-medium text-[12px] ml-1">
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Feather name="shopping-bag" size={12} color="#888" />
          <Text className="text-gray-500 font-medium text-[12px] ml-1">
            SAR {bag?.price ?? "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "past">("past");
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading, isError, refetch } = useMyOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
    }
  }, [isAuthenticated]);

  const activeOrders = (orders ?? []).filter((o: any) =>
    ACTIVE_STATUSES.includes(o.status),
  );
  const pastOrders = (orders ?? []).filter(
    (o) => !ACTIVE_STATUSES.includes(o.status),
  );
  const displayed = activeTab === "active" ? activeOrders : pastOrders;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View className="items-center justify-center pt-2 pb-5">
        <Text className="text-[#111] font-black text-[18px]">Orders</Text>
      </View>

      {/* Segmented Control */}
      <View className="px-5 mb-6">
        <View className="flex-row items-center bg-white rounded-[20px] p-1 border border-gray-100 shadow-sm shadow-black/5">
          {(["active", "past"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center py-3.5 rounded-[16px] ${
                activeTab === tab ? "bg-[#FF7F50]" : "bg-transparent"
              }`}
            >
              <Text
                className={`font-bold text-[14px] ${
                  activeTab === tab ? "text-white" : "text-gray-500"
                }`}
              >
                {tab === "active" ? "Active Orders" : "Past Orders"}
                {tab === "active" && activeOrders.length > 0
                  ? ` (${activeOrders.length})`
                  : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7F50" />
        </View>
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
        /* Empty state */
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
            <View className="items-center w-full mt-1">
              <Text className="text-[#888] font-medium text-[14px] text-center px-10 mb-6">
                You don't have any orders in progress right now.
              </Text>

              <TouchableOpacity className="bg-[#FF7F50] px-10 py-3.5 rounded-2xl shadow-sm shadow-[#FF7F50]/20 w-[60%] max-w-[240px] items-center">
                <Text className="text-white font-black text-[15px]">
                  Order now!
                </Text>
              </TouchableOpacity>
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
          <View className="pt-2 pb-8">
            {displayed.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        </ScrollView>
      )}

      <GuestAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onLoginSuccess={() => {
          setAuthModalVisible(false);
          refetch();
        }}
      />
    </SafeAreaView>
  );
}
