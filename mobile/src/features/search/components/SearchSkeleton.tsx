import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonCard() {
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
    <Animated.View style={{ opacity }} className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-4">
      {/* Image area */}
      <View className="h-[160px] w-full bg-gray-200" />

      {/* Logo overlap */}
      <View className="absolute top-[128px] left-4 w-12 h-12 rounded-xl bg-gray-300 border-2 border-white" />

      {/* Content */}
      <View className="pt-9 px-4 pb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-4">
            <View className="h-4 w-40 bg-gray-200 rounded-full mb-2" />
            <View className="h-3 w-32 bg-gray-100 rounded-full" />
          </View>
          <View className="items-end">
            <View className="h-3 w-14 bg-gray-100 rounded-full mb-1" />
            <View className="h-4 w-16 bg-gray-200 rounded-full" />
          </View>
        </View>
        <View className="flex-row items-center pt-3 border-t border-gray-100 gap-4">
          <View className="h-3 w-14 bg-gray-100 rounded-full" />
          <View className="h-3 w-14 bg-gray-100 rounded-full" />
          <View className="h-3 w-20 bg-gray-100 rounded-full" />
        </View>
      </View>
    </Animated.View>
  );
}

export function SearchSkeleton() {
  return (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  );
}
