import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CartItem } from "./components/CartItem";
import { GuestAuthModal } from "../../components/GuestAuthModal";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { CartMilestoneTracker } from "./components/CartMilestoneTracker";
import { useStoreInventory } from "../../hooks/useStoreInventory";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";

export default function CartScreen() {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const {
    cartItems,
    totalQuantity,
    subtotal,
    incrementItem,
    decrementItem,
    addToCart,
  } = useCart();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const activeStoreId = cartItems.length > 0 ? cartItems[0].storeId : undefined;
  const { data: storeInventory } = useStoreInventory(activeStoreId ?? 0);

  const dynamicUpsells = storeInventory
    ? storeInventory
        .filter(
          (bag) => !cartItems.some((item) => item.surpriseBoxId === bag.id),
        )
        .map((bag: any) => ({
          id: String(bag.id),
          surpriseBoxId: bag.id,
          storeId: activeStoreId,
          title: bag.name,
          price: bag.price,
          originalPrice: bag.originalPrice,
          quantity: bag.quantity,
          imageUrl: bag.imageUrl ?? DEFAULT_LISTING_IMAGE,
        }))
    : [];

  const handleCheckoutPress = () => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
    } else {
      navigation.navigate("Checkout" as never);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-gray-100 relative">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-5 z-10 w-8 h-8 items-center justify-center -ml-2"
        >
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-[#111] font-black text-[16px]">My Cart</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length > 0 ? (
          <>
            {/* Upsell Horizontal Banner */}
            {dynamicUpsells.length > 0 && (
              <View className="pt-6 pb-2 bg-white">
                <View className="px-5 mb-4">
                  <Text className="text-[#111] font-black text-[18px] mb-1">
                    Complement your bag
                  </Text>
                  <Text className="text-gray-500 font-medium text-[13px]">
                    Enjoy any of these add-ons by adding them to your order
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {dynamicUpsells.map((upsell) => {
                    const blockItem = cartItems.find((i) => i.id === upsell.id);
                    const qty = blockItem?.quantity || 0;

                    const maxQty = (upsell as any).quantity ?? undefined;
                    const atMax = maxQty !== undefined && qty >= maxQty;

                    return (
                      <View
                        key={upsell.id}
                        className="w-32 mr-3 bg-white border border-gray-100 rounded-2xl p-2 relative shadow-sm shadow-black/5"
                      >
                        <View className="w-full h-28 bg-[#F8F6F2] rounded-xl mb-3 overflow-hidden relative">
                          <Image
                            source={
                              typeof upsell.imageUrl === "string"
                                ? { uri: upsell.imageUrl }
                                : upsell.imageUrl
                            }
                            className="w-full h-full"
                            resizeMode="cover"
                          />

                          {qty > 0 ? (
                            <View className="absolute bottom-2 left-2 bg-white rounded-full flex-row items-center px-2 py-1 shadow-sm shadow-black/10">
                              <TouchableOpacity
                                onPress={() => decrementItem(upsell.id)}
                                className="px-1"
                              >
                                <Feather
                                  name="minus"
                                  size={14}
                                  color="#E7246A"
                                />
                              </TouchableOpacity>
                              <Text className="text-[#E7246A] font-black text-[12px] mx-1.5">
                                {qty}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  !atMax && incrementItem(upsell.id)
                                }
                                disabled={atMax}
                                className="px-1"
                              >
                                <Feather
                                  name="plus"
                                  size={14}
                                  color={atMax ? "#CCC" : "#E7246A"}
                                />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity
                              onPress={() =>
                                addToCart({ ...upsell, maxQuantity: maxQty })
                              }
                              className="absolute bottom-2 left-2 bg-white w-7 h-7 rounded-full items-center justify-center shadow-sm shadow-black/10"
                            >
                              <Feather name="plus" size={14} color="#E7246A" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text
                          className="text-[#111] font-bold text-[12px] mb-1 leading-tight"
                          numberOfLines={2}
                        >
                          {upsell.title}
                        </Text>
                        <Text className="text-[#E7246A] font-black text-[12px]">
                          ﷼ {upsell.price.toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Divider */}
            <View className="w-full h-1 bg-gray-50 mt-4 mb-2" />

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={{
                  ...item,
                  imageUrl:
                    storeInventory?.find((bag) => bag.id === item.surpriseBoxId)
                      ?.imageUrl ??
                    item.imageUrl ??
                    DEFAULT_LISTING_IMAGE,
                }}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
              />
            ))}

            {/* Optional Milestone UI Block overlay injected from the milestone tracker */}
            {cartItems.length > 0 && (
              <View className="mt-8 mb-6">
                <CartMilestoneTracker subTotal={subtotal} />
              </View>
            )}

            {/* Bottom padding for the absolute floating dock checkout */}
            <View className="h-40" />
          </>
        ) : (
          <View className="flex-1 items-center justify-center -mt-20">
            <View className="w-24 h-24 bg-[#F4F9F6] rounded-full items-center justify-center mb-5 border-[4px] border-white shadow-sm shadow-black/5">
              <Ionicons name="cart-outline" size={48} color="#FF7F50" />
            </View>
            <Text className="text-[#111] font-black text-[20px] mb-2">
              Cart is empty
            </Text>
            <Text className="text-gray-500 font-medium text-[14px]">
              Looks like you haven't added any bags yet.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Dock - ONLY SHOW WHEN ITEMS EXIST */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-0 w-full bg-white shadow-[0_-15px_30px_rgba(0,0,0,0.05)] pt-4 pb-10 px-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#111] font-black text-[14px]">
              Sub-total
            </Text>
            <Text className="text-[#111] font-black text-[15px]">
              ﷼ {subtotal.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckoutPress}
            className="w-full h-14 bg-[#FF7F50] rounded-2xl items-center justify-center shadow-sm shadow-[#FF7F50]/30"
          >
            <Text className="text-white font-black text-[16px]">
              Go to checkout
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <GuestAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onLoginSuccess={() => {
          setAuthModalVisible(false);
          if (user?.needsProfile) {
            navigation.navigate("CompleteProfile" as never);
          } else {
            navigation.navigate("Checkout" as never);
          }
        }}
      />
    </SafeAreaView>
  );
}
