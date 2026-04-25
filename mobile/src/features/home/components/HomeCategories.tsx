import React from "react";
import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";

const CATEGORIES = [
  {
    id: 1,
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Sushi",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Healthy",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop",
  },
];

export const HomeCategories = () => {
  return (
    <View className="mt-8 mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} className="items-center">
            <View className="mb-2.5 p-[3px] rounded-full border-[2.5px] border-[#FF2C55]">
              <Image
                source={{ uri: cat.image }}
                className="w-[72px] h-[72px] rounded-full bg-gray-100"
              />
            </View>
            <Text className="text-[#3b414a] font-extrabold text-[14px]">
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
