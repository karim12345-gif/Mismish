import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutStoreDetails } from "./components/CheckoutStoreDetails";
import { CheckoutOrderItems } from "./components/CheckoutOrderItems";
import { CheckoutCoupon } from "./components/CheckoutCoupon";
import { CheckoutSummary } from "./components/CheckoutSummary";
import { CheckoutPaymentFooter } from "./components/CheckoutPaymentFooter";
import { PaymentMethodBottomSheet } from "./components/PaymentMethodBottomSheet";
import { AddNewCardBottomSheet } from "./components/AddNewCardBottomSheet";
import { OrderErrorModal } from "./components/OrderErrorModal";
import { ConfirmOrderBottomSheet, isPickupExpired } from "./components/ConfirmOrderBottomSheet";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { useCart } from "../../context/CartContext";
import { useStores } from "../../hooks/useStores";
import { useTranslation } from "react-i18next";
import { OrderServices } from "../../services/order/order.service";
import type { Order } from "../../services/order/order.service";
import { useQueryClient } from "@tanstack/react-query";
import { STORES_QUERY_KEY } from "../../hooks/useStores";

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { cartItems, clearCart } = useCart();
  const { isPending: createHookPending } = useCreateOrder();
  const { data: stores = [] } = useStores();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartBoxId = cartItems.find((i: any) => i.surpriseBoxId)?.surpriseBoxId;
  const activeStore = stores.find((s) =>
    s.listings.some((l) => l.id === cartBoxId),
  );
  const activeBag = activeStore?.listings.find((l) => l.id === cartBoxId);

  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [addCardSheetVisible, setAddCardSheetVisible] = useState(false);
  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorReason, setErrorReason] = useState<"expired" | "sold_out">("expired");
  const [selectedMethod, setSelectedMethod] = useState("apple_pay");

  const handleInitialPayPress = () => setConfirmSheetVisible(true);

  const handleGoHomeAndClear = () => {
    setErrorModalVisible(false);
    clearCart();
    navigation.navigate("MainTabs" as never);
  };

  const invalidateAfterOrders = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
  };

  const handleConfirm = async () => {
    const lineItems = cartItems.filter((i: any) => i.surpriseBoxId);
    if (lineItems.length === 0) {
      Alert.alert(t("checkout.no_bag_title"), t("checkout.no_bag_message"));
      return;
    }

    // Pre-check expiry for every line against its own listing + offset
    for (const item of lineItems) {
      const store = stores.find((s) =>
        s.listings.some((l) => l.id === item.surpriseBoxId),
      );
      const bag = store?.listings.find((l) => l.id === item.surpriseBoxId);
      const offset = item.pickupOffset ?? 0;
      if (bag?.pickupEnd && isPickupExpired(bag.pickupEnd, offset)) {
        setConfirmSheetVisible(false);
        setErrorReason("expired");
        setErrorModalVisible(true);
        return;
      }
    }

    setIsSubmitting(true);
    const created: Order[] = [];

    try {
      for (const item of lineItems) {
        const response = await OrderServices.createOrder({
          surpriseBoxId: item.surpriseBoxId!,
          deliveryMethod: "PICKUP",
          pickupOffset: item.pickupOffset ?? 0,
          quantity: item.quantity ?? 1,
        });
        created.push(response.data);
      }

      invalidateAfterOrders();
      setConfirmSheetVisible(false);
      clearCart();
      (navigation.navigate as any)("BookingConfirmed", {
        order: created[0],
        orders: created,
      });
    } catch (err: any) {
      setConfirmSheetVisible(false);
      const msg = err?.response?.data?.message ?? "";

      if (created.length > 0) {
        invalidateAfterOrders();
        clearCart();
        Alert.alert(
          t("checkout.order_failed"),
          msg
            ? `${msg}\n(${created.length}/${lineItems.length})`
            : t("checkout.order_failed_message"),
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs", params: { screen: "Orders" } }],
        });
        return;
      }

      if (msg === "Sorry, this bag just sold out") {
        setErrorReason("sold_out");
        setErrorModalVisible(true);
      } else if (msg === "Pickup time has ended") {
        setErrorReason("expired");
        setErrorModalVisible(true);
      } else {
        Alert.alert(t("checkout.order_failed"), msg || t("checkout.order_failed_message"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || createHookPending;

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <CheckoutHeader />

      <ScrollView className="flex-1 pb-40" showsVerticalScrollIndicator={false}>
        <CheckoutStoreDetails
          store={activeStore}
          bag={activeBag}
          cartItem={cartItems[0]}
        />
        <CheckoutOrderItems />
        <CheckoutCoupon />
        <CheckoutSummary
          onChangePaymentPress={() => setPaymentSheetVisible(true)}
          selectedMethod={selectedMethod}
        />
      </ScrollView>

      <CheckoutPaymentFooter onPayPress={handleInitialPayPress} />

      <PaymentMethodBottomSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        selectedMethod={selectedMethod}
        onSelectMethod={setSelectedMethod}
        onAddCardPress={() => {
          setPaymentSheetVisible(false);
          setTimeout(() => setAddCardSheetVisible(true), 350);
        }}
      />

      <AddNewCardBottomSheet
        visible={addCardSheetVisible}
        onClose={() => setAddCardSheetVisible(false)}
        onSave={() => setAddCardSheetVisible(false)}
      />

      <ConfirmOrderBottomSheet
        visible={confirmSheetVisible}
        onClose={() => setConfirmSheetVisible(false)}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        pickupStart={activeBag?.pickupStart}
        pickupEnd={activeBag?.pickupEnd}
        pickupOffset={cartItems[0]?.pickupOffset ?? 0}
        fulfillment="pickup"
      />

      <OrderErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        onHomePress={handleGoHomeAndClear}
        reason={errorReason}
      />
    </SafeAreaView>
  );
}
