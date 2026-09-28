import React from "react";
import { View, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Store, SurpriseBox } from "../../../services/store/store.service";
import { CartItemProduct } from "../../../context/CartContext";
import { DEFAULT_LISTING_IMAGE } from "../../../constants/images";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "../../../i18n/localizedContent";

const fmtTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

interface CheckoutStoreDetailsProps {
  store: Store | undefined;
  bag: SurpriseBox | undefined;
  cartItem?: CartItemProduct;
}

export const CheckoutStoreDetails = ({
  store,
  bag,
  cartItem,
}: CheckoutStoreDetailsProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("ar") ? "ar-SA" : "en-US";
  return (
    <View className="bg-white px-5 pt-4 pb-6 border-t-[8px] border-gray-50">
      {/* Store Block */}
      <View className="mb-6">
        <Text className="text-[#111] font-black text-[15px] mb-3">
          {t("checkout.store_details")}
        </Text>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden mr-3 bg-white shadow-sm shadow-black/5">
            <Image
              source={{
                uri:
                  bag?.imageUrl ??
                  cartItem?.imageUrl ??
                  store?.imageUrl ??
                  DEFAULT_LISTING_IMAGE,
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[#111] font-bold text-[14px] mb-0.5"
              numberOfLines={1}
            >
              {getLocalizedName(store, i18n.language, "—")}
            </Text>
            <View className="flex-row items-center">
              <Feather name="map-pin" size={10} color="#FF7F50" />
              <Text
                className="text-gray-500 font-medium text-[12px] ml-1"
                numberOfLines={1}
              >
                {store?.address ?? "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 mb-6" />

      {/* Pickup Time Block */}
      <View>
        <Text className="text-[#111] font-black text-[15px] mb-2">
          {t("checkout.pickup_time")}
        </Text>
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#888" />
          <Text className="text-gray-500 font-medium text-[13px] ml-1.5">
            <Text className="text-[#111] font-black">
              {cartItem?.pickupOffset === 1 ? t("common.tomorrow") : t("common.today")}
            </Text>
            {bag?.pickupStart && bag?.pickupEnd
              ? ` — ${fmtTime(bag.pickupStart, locale)} – ${fmtTime(bag.pickupEnd, locale)}`
              : ""}
          </Text>
        </View>
      </View>
    </View>
  );
};
