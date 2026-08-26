import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import type { AuthenticatedStackParamList } from "../../navigation/AuthenticatedNavigator";
import { OrderServices } from "../../services/order/order.service";

const formatPickup = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not available";

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<AuthenticatedStackParamList, "OrderDetails">>();
  const orderId = route.params.orderId;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => OrderServices.getOrderById(orderId),
  });

  const order = data?.data;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-16 flex-row items-center border-b border-gray-100 px-5">
        <TouchableOpacity
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={30} color="#102F2B" />
        </TouchableOpacity>
        <Text className="flex-1 pr-11 text-center text-xl font-bold text-[#102F2B]">
          Order details
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7A4D" />
        </View>
      ) : isError || !order ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-lg font-bold text-[#102F2B]">
            We could not load this order.
          </Text>
          <TouchableOpacity
            className="mt-5 bg-[#FF7A4D] px-7 py-3"
            onPress={() => refetch()}
          >
            <Text className="font-bold text-white">Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <Text className="text-sm font-semibold uppercase text-[#62807B]">
            Order #{order.id}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-[#102F2B]">
            {order.surpriseBox?.vendor.name ?? "Mismish order"}
          </Text>

          <View className="mt-7 border-y border-gray-100 py-5">
            <Text className="text-sm font-semibold text-[#62807B]">Status</Text>
            <Text className="mt-1 text-xl font-bold text-[#FF7A4D]">
              {order.status.replaceAll("_", " ")}
            </Text>
          </View>

          <View className="gap-6 py-6">
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">Item</Text>
              <Text className="mt-1 text-lg font-bold text-[#102F2B]">
                {order.quantity} × {order.surpriseBox?.name ?? "Surprise bag"}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                Pickup starts
              </Text>
              <Text className="mt-1 text-lg text-[#102F2B]">
                {formatPickup(order.surpriseBox?.pickupStart)}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                Pickup ends
              </Text>
              <Text className="mt-1 text-lg text-[#102F2B]">
                {formatPickup(order.surpriseBox?.pickupEnd)}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                Pickup code
              </Text>
              <Text className="mt-1 text-3xl font-bold tracking-widest text-[#102F2B]">
                {order.orderCode}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
