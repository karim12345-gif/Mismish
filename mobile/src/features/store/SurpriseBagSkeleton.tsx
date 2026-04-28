import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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

function Block({ w, h, radius = 8, className: cls }: { w: number | string; h: number; radius?: number; className?: string }) {
  return (
    <View
      style={{
        width: w as any,
        height: h,
        borderRadius: radius,
        backgroundColor: "#E5E7EB",
      }}
    />
  );
}

export function SurpriseBagSkeleton() {
  const opacity = usePulse();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }} edges={["bottom"]}>
      <Animated.View style={{ opacity, flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

          {/* Hero image */}
          <View style={{ width, height: width, backgroundColor: "#D1D5DB", position: "relative" }}>
            {/* Heart + X buttons */}
            <View style={{ position: "absolute", top: 54, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#9CA3AF" }} />
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#9CA3AF" }} />
            </View>
            {/* Save badge bottom-right */}
            <View style={{ position: "absolute", bottom: 24, right: 20, width: 80, height: 28, borderRadius: 20, backgroundColor: "#9CA3AF" }} />
          </View>

          {/* Store Profile Card — overlaps image */}
          <View style={{ paddingHorizontal: 20, marginTop: -64, marginBottom: 16, zIndex: 10 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#F3F4F6" }}>
              {/* Top row: logo + name + rating */}
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#E5E7EB", marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Block w={140} h={18} radius={6} />
                  <View style={{ marginTop: 6 }}>
                    <Block w={180} h={12} radius={4} />
                  </View>
                </View>
                <View style={{ width: 36, height: 18, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
              </View>
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: "#F3F4F6", marginBottom: 12 }} />
              {/* Address + options row */}
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Block w={80} h={13} radius={4} />
                  <View style={{ marginTop: 6 }}>
                    <Block w={90} h={11} radius={4} />
                  </View>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Block w={50} h={11} radius={4} />
                  <View style={{ marginTop: 6 }}>
                    <Block w={70} h={13} radius={4} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Availability Time */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Block w={140} h={16} radius={5} />
              <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Block w={16} h={16} radius={8} />
                <Block w={180} h={13} radius={4} />
              </View>
            </View>
            <View style={{ width: 70, height: 30, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" }} />
          </View>

          {/* Divider strip */}
          <View style={{ height: 8, backgroundColor: "#F3F4F6", marginBottom: 24 }} />

          {/* Item card 1 */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#F3F4F6", flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Block w={160} h={16} radius={5} />
                <View style={{ marginTop: 8 }}>
                  <Block w="90%" h={12} radius={4} />
                </View>
                <View style={{ marginTop: 4 }}>
                  <Block w={120} h={12} radius={4} />
                </View>
                <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                  <Block w={50} h={18} radius={5} />
                  <Block w={40} h={14} radius={5} />
                </View>
              </View>
              {/* Thumbnail */}
              <View style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: "#E5E7EB", position: "relative" }}>
                <View style={{ position: "absolute", top: 6, left: 6, width: 44, height: 20, borderRadius: 10, backgroundColor: "#9CA3AF" }} />
                <View style={{ position: "absolute", bottom: -10, right: -10, width: 32, height: 32, borderRadius: 16, backgroundColor: "#D1D5DB" }} />
              </View>
            </View>
          </View>

          {/* Item card 2 (lighter) */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16, opacity: 0.6 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#F3F4F6", flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Block w={130} h={16} radius={5} />
                <View style={{ marginTop: 8 }}>
                  <Block w="80%" h={12} radius={4} />
                </View>
                <View style={{ marginTop: 10, flexDirection: "row", gap: 8 }}>
                  <Block w={50} h={18} radius={5} />
                  <Block w={40} h={14} radius={5} />
                </View>
              </View>
              <View style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: "#E5E7EB" }} />
            </View>
          </View>

        </ScrollView>

        {/* Bottom CTA skeleton */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
          <View style={{ height: 52, borderRadius: 16, backgroundColor: "#E5E7EB" }} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
