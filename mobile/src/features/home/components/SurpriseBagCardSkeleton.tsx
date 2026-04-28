import React, { useEffect, useRef } from "react";
import { View, Animated, ScrollView } from "react-native";

function BagSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity, width: 180 }} className="bg-white rounded-2xl overflow-hidden border border-gray-100 mr-4">
      <View className="h-[120px] bg-gray-200" />
      <View className="p-3">
        <View className="h-3.5 w-28 bg-gray-200 rounded-full mb-2" />
        <View className="h-3 w-20 bg-gray-100 rounded-full mb-3" />
        <View className="h-4 w-16 bg-gray-200 rounded-full" />
      </View>
    </Animated.View>
  );
}

export function SurpriseBagRowSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
    >
      {[1, 2, 3].map((i) => <BagSkeleton key={i} />)}
    </ScrollView>
  );
}
