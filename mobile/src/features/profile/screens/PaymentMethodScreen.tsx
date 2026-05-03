import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCards } from "../../../context/CardsContext";

export default function PaymentMethodScreen() {
  const navigation = useNavigation<any>();
  const { cards, removeCard } = useCards();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center mr-4 shadow-sm shadow-black/5"
        >
          <Feather name="arrow-left" size={18} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[18px] font-black">My Cards</Text>
      </View>

      {cards.length === 0 ? (
        /* Empty State */
        <View className="flex-1 items-center justify-center px-8">
          <View className="relative w-24 h-24 mb-8">
            <View className="absolute top-0 right-0 w-20 h-14 bg-gray-100 rounded-xl border border-gray-200" />
            <View className="absolute bottom-0 left-0 w-20 h-14 bg-gray-200 rounded-xl border border-gray-300 items-end justify-end p-2">
              <View className="w-5 h-3 bg-gray-300 rounded-sm" />
            </View>
            <View className="absolute -top-1 -right-1 w-8 h-8 bg-[#FF7F50] rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white font-black text-[12px]">!</Text>
            </View>
          </View>
          <Text className="text-[#111] text-[20px] font-black mb-2 text-center">No Payment Methods Yet</Text>
          <Text className="text-gray-400 text-[13px] font-medium text-center leading-5 mb-8">
            Add a payment method for faster checkout and seamless ordering.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddNewCard")}
            className="bg-[#366150] h-12 px-10 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-bold text-[15px]">Add new card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="px-5">
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden mb-4">
            {cards.map((card, i) => (
              <View
                key={card.id}
                className={`flex-row items-center px-4 py-4 ${i < cards.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <FontAwesome
                  name={card.brand === "visa" ? "cc-visa" : card.brand === "mastercard" ? "cc-mastercard" : "credit-card"}
                  size={26}
                  color="#366150"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-[#111] text-[14px] font-bold">•••• {card.last4}</Text>
                  <Text className="text-gray-400 text-[11px] font-medium mt-0.5">{card.name} · {card.expiry}</Text>
                </View>
                <TouchableOpacity onPress={() => removeCard(card.id)} className="p-2">
                  <Feather name="trash-2" size={16} color="#ccc" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AddNewCard")}
            className="flex-row items-center justify-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 py-4"
          >
            <Feather name="plus" size={16} color="#366150" />
            <Text className="text-[#366150] font-bold text-[14px]">Add new card</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
