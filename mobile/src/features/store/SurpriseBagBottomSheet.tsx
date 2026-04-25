import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface SurpriseBagBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const SurpriseBagBottomSheet = ({
  visible,
  onClose,
}: SurpriseBagBottomSheetProps) => {
  const [showAllergies, setShowAllergies] = React.useState(false);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-end">
        {/* Dark Background Overlay */}
        <View className="absolute inset-0 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
        </View>

        {/* Bottom Sheet Modal Container */}
        <View className="bg-white rounded-t-3xl overflow-hidden h-[85%] mt-10 shadow-lg">
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Top Image Banner */}
            <View className="w-full h-56 bg-gray-100 relative">
              <Image
                source={require("../../../assets/images/Food.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Close Button X */}
              <TouchableOpacity
                onPress={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center bg-black/40"
              >
                <Feather name="x" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Content Body */}
            <View className="px-5 pt-6 pb-4">
              {/* Badge */}
              <View className="bg-[#FFF2C2] px-2.5 py-1 rounded-md self-start mb-3">
                <Text className="text-[#D7402B] text-[10px] font-black">
                  3 Left
                </Text>
              </View>

              {/* Title */}
              <Text className="text-[#111] font-black text-xl mb-3">
                Pastries Bag
              </Text>

              {/* Description */}
              <Text className="text-gray-500 font-medium text-[13px] leading-5 mb-5">
                A delightful assortment of half a kilo of freshly baked pastries
                or desserts from Mille Feuille Bakery. The selection includes a
                variety of flavors such as pies, puff pastries, croissants,
                cakes, cheesecakes, éclairs, and the signature mille-feuille.
              </Text>

              {/* Price */}
              <View className="flex-row items-end mb-6">
                <Text className="text-[#FF7F50] font-black text-[18px] mr-2">
                  SR 25.00
                </Text>
                <Text className="text-[#AAA] font-bold text-[12px] line-through decoration-[#AAA] mb-1">
                  SR 66.00
                </Text>
              </View>

              {/* Divider */}
              <View className="h-[1px] w-full bg-gray-100 mb-5" />

              {/* Ingredients & Allergies Accordion */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowAllergies(!showAllergies)}
                className={`flex-row items-center justify-between ${showAllergies ? "mb-2" : "mb-4"}`}
              >
                <Text className="text-[#111] font-bold text-[15px]">
                  Ingredients & Allergies
                </Text>
                <Feather
                  name={showAllergies ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#111"
                />
              </TouchableOpacity>

              {showAllergies && (
                <View className="mb-6">
                  <Text className="text-[#444] font-medium text-[12px] leading-5">
                    Bag may contain allergens. Please call restaurant for
                    details.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 shadow-md shadow-black/10 px-5 pt-4 pb-8 flex-row items-center justify-between z-10">
            {/* Stepper */}
            <View className="flex-row items-center bg-[#F9F9F9] rounded-xl py-3 px-3 border border-gray-200 mr-4">
              <TouchableOpacity>
                <Feather name="minus" size={18} color="#FF7F50" />
              </TouchableOpacity>
              <Text className="w-10 text-center font-black text-[15px] text-[#111]">
                1
              </Text>
              <TouchableOpacity>
                <Feather name="plus" size={18} color="#FF7F50" />
              </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-[#FF7F50] rounded-xl flex-row items-center justify-between px-5 h-[48px]"
            >
              <Text className="text-white font-bold text-[15px]">
                Add to Cart
              </Text>
              <Text className="text-white font-bold text-[15px]">SR 25.00</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
