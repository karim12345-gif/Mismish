import React from "react";
import { ScrollView, TouchableOpacity, Text, View, Image } from "react-native";

const COLLECTIONS = [
  {
    id: 1,
    name: "11 & Under",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Catering",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Dessert",
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Trending",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Shawarma",
    image:
      "https://images.unsplash.com/photo-1644485746765-b1a774291884?q=80&w=200&auto=format&fit=crop",
  },
];

export const HomeFeaturedCollections = () => {
  return (
    <View className="mt-6 mb-2">
      <Text className="px-5 text-[#111] text-[16px] font-black tracking-tight mb-4">
        Featured Collections
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {COLLECTIONS.map((col) => (
          <TouchableOpacity key={col.id} className="items-center">
            <View className="mb-2 bg-white rounded-2xl border border-gray-200 overflow-hidden w-[72px] h-[72px] items-center justify-center">
              <Image
                source={{ uri: col.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-[#333] font-semibold text-[11px]">
              {col.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
