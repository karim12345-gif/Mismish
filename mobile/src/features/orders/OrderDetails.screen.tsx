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
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "../../i18n/localizedContent";

const formatPickup = (value: string | undefined, locale: string, fallback: string) =>
  value
    ? new Date(value).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : fallback;

export default function OrderDetailsScreen() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-SA" : "en-SA";
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
          accessibilityLabel={t("common.go_back")}
          className="h-11 w-11 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={30} color="#102F2B" />
        </TouchableOpacity>
        <Text className="flex-1 pr-11 text-center text-xl font-bold text-[#102F2B]">
          {t("orders.details")}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7A4D" />
        </View>
      ) : isError || !order ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-lg font-bold text-[#102F2B]">
            {t("orders.load_error")}
          </Text>
          <TouchableOpacity
            className="mt-5 bg-[#FF7A4D] px-7 py-3"
            onPress={() => refetch()}
          >
            <Text className="font-bold text-white">{t("common.try_again")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <Text className="text-sm font-semibold uppercase text-[#62807B]">
            {t("orders.number", { id: order.id })}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-[#102F2B]">
            {getLocalizedName(
              order.surpriseBox?.vendor,
              i18n.language,
              t("orders.fallback_order"),
            )}
          </Text>

          <View className="mt-7 border-y border-gray-100 py-5">
            <Text className="text-sm font-semibold text-[#62807B]">{t("orders.status")}</Text>
            <Text className="mt-1 text-xl font-bold text-[#FF7A4D]">
              {t(`orders.statuses.${order.status}`)}
            </Text>
          </View>

          <View className="gap-6 py-6">
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">{t("orders.item")}</Text>
              <Text className="mt-1 text-lg font-bold text-[#102F2B]">
                {order.quantity} × {order.surpriseBox?.name ?? t("store.default_bag")}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                {t("orders.pickup_starts")}
              </Text>
              <Text className="mt-1 text-lg text-[#102F2B]">
                {formatPickup(order.surpriseBox?.pickupStart, locale, t("orders.not_available"))}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                {t("orders.pickup_ends")}
              </Text>
              <Text className="mt-1 text-lg text-[#102F2B]">
                {formatPickup(order.surpriseBox?.pickupEnd, locale, t("orders.not_available"))}
              </Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-[#62807B]">
                {t("orders.pickup_code")}
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
