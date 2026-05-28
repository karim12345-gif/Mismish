import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../../../hooks/useFavorites";

interface StoreCardProps {
  storeId: number;
  title: string;
  branch: string;
  price: string;
  timeRange: string;
  distance: string;
  imageUrl: any;
  logoUrl: any;
  leftCount: string;
  hasListings: boolean;
  rating?: number | null;
  reviewCount?: number;
}

export const StoreCard = ({
  storeId,
  title,
  branch,
  price,
  timeRange,
  distance,
  imageUrl,
  logoUrl,
  leftCount,
  hasListings,
  rating,
  reviewCount = 0,
}: StoreCardProps) => {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(storeId);

  return (
    <TouchableOpacity
      onPress={() => hasListings && navigation.push("SurpriseBag", { storeId })}
      disabled={!hasListings}
      activeOpacity={hasListings ? 0.85 : 1}
      className="w-full bg-white rounded-2xl mb-5"
      style={{
        opacity: hasListings ? 1 : 0.45,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Top Banner Image — overflow-hidden lives here, not on outer container */}
      <View className="relative h-[160px] w-full bg-gray-100 rounded-t-2xl overflow-hidden">
        <Image
          source={typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Left Count Badge — hidden when unavailable */}
        {hasListings && (
          <View className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FFF2C2]">
            <Text className="text-[11px] font-black text-[#D7402B]">
              {leftCount}
            </Text>
          </View>
        )}

        {/* Heart Icon */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(storeId);
          }}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full border border-gray-100"
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={18}
            color={favorited ? "#FF7F50" : "#555"}
          />
        </TouchableOpacity>

        {/* Square Logo Overlap */}
        <View className="absolute -bottom-5 left-4 w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200 overflow-hidden">
          <Image
            source={typeof logoUrl === "string" ? { uri: logoUrl } : logoUrl}
            className="w-[85%] h-[85%] rounded-lg"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Information */}
      <View className="pt-8 px-4 pb-4 rounded-b-2xl border border-t-0 border-gray-100">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 pr-2">
            <Text
              className="text-[#111] font-black text-[14px] mb-0.5"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {title}{" "}
              <Text className="font-semibold text-gray-500 text-[13px]">
                ({branch})
              </Text>
            </Text>
            {hasListings ? (
              <View className="flex-row items-center border border-green-100 bg-green-50 self-start px-2 py-0.5 rounded-full">
                <MaterialCommunityIcons name="clock-outline" size={12} color="#18C96D" />
                <Text className="text-[#18C96D] text-[10px] font-bold ml-1">
                  Now{" "}
                  <Text className="font-medium text-gray-500">, {timeRange}</Text>
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center border border-gray-200 bg-gray-100 self-start px-2 py-0.5 rounded-full">
                <MaterialCommunityIcons name="clock-remove-outline" size={12} color="#999" />
                <Text className="text-gray-400 text-[10px] font-bold ml-1">
                  Not available today
                </Text>
              </View>
            )}
          </View>
          <View className="items-end shrink-0">
            {hasListings && (
              <Text className="text-gray-500 text-[11px] font-bold mb-0.5">
                Starts at
              </Text>
            )}
            <Text
              className="font-black text-[15px]"
              style={{ color: hasListings ? "#FF2C55" : "#aaa" }}
              adjustsFontSizeToFit
            >
              {hasListings ? price : "—"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center mr-4">
            <Feather name="map-pin" size={12} color="#888" />
            <Text className="text-gray-500 text-[12px] font-semibold ml-1">
              {distance}
            </Text>
          </View>
          {reviewCount > 0 && rating != null && (
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="star" size={13} color="#F5B224" />
              <Text className="text-gray-500 text-[12px] font-semibold ml-1">
                {rating.toFixed(1)}{" "}
                <Text className="text-gray-400">({reviewCount})</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
