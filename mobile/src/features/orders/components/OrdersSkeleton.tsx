import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function usePulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return opacity;
}

function OrderCardSkeleton() {
  const opacity = usePulse();
  return (
    <Animated.View
      style={{ opacity }}
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
    >
      {/* Top row: image + content */}
      <View className="flex-row items-start mb-4">
        {/* Thumbnail */}
        <View className="w-14 h-14 rounded-xl bg-gray-200 mr-3" />

        <View className="flex-1">
          {/* Name + badge */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="h-4 w-36 bg-gray-200 rounded-full" />
            <View className="h-5 w-24 bg-gray-200 rounded-full" />
          </View>
          {/* Subtitle */}
          <View className="h-3 w-40 bg-gray-100 rounded-full mb-2" />
          {/* Time row */}
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full bg-gray-200" />
            <View className="h-3 w-48 bg-gray-100 rounded-full" />
          </View>
        </View>
      </View>

      {/* Action buttons row */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-11 rounded-xl bg-gray-200" />
        <View className="w-11 h-11 rounded-xl bg-gray-100" />
      </View>
    </Animated.View>
  );
}

export function OrdersSkeleton() {
  return (
    <>
      <OrderCardSkeleton />
      <OrderCardSkeleton />
      <OrderCardSkeleton />
    </>
  );
}
