import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutFulfillmentToggle } from "./components/CheckoutFulfillmentToggle";
import { CheckoutStoreDetails } from "./components/CheckoutStoreDetails";
import { CheckoutDeliveryDetails } from "./components/CheckoutDeliveryDetails";
import { useLocation } from "../../context/LocationContext";
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

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { cartItems, clearCart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { data: stores = [] } = useStores();

  const cartBoxId = cartItems.find((i: any) => i.surpriseBoxId)?.surpriseBoxId;
  const activeStore = stores.find((s) =>
    s.listings.some((l) => l.id === cartBoxId),
  );
  const activeBag = activeStore?.listings.find((l) => l.id === cartBoxId);

  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const { address } = useLocation();
  const deliveryAddress = address
    ? [address.street, address.district, address.city].filter(Boolean).join(", ")
    : "";

  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [addCardSheetVisible, setAddCardSheetVisible] = useState(false);
  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("apple_pay");

  const handleInitialPayPress = () => setConfirmSheetVisible(true);

  const handleGoHomeAndClear = () => {
    setErrorModalVisible(false);
    clearCart();
    navigation.navigate("MainTabs" as never);
  };

  const handleConfirm = () => {
    const surpriseBoxId = cartItems.find(
      (i: any) => i.surpriseBoxId,
    )?.surpriseBoxId;

    if (!surpriseBoxId) {
      Alert.alert("Error", "No bag selected. Please go back and add a bag.");
      return;
    }

    if (activeBag?.pickupEnd && isPickupExpired(activeBag.pickupEnd)) {
      setConfirmSheetVisible(false);
      setErrorModalVisible(true);
      return;
    }

    createOrder(
      {
        surpriseBoxId,
        deliveryMethod: fulfillment === "delivery" ? "DELIVERY" : "PICKUP",
        ...(fulfillment === "delivery" && deliveryAddress ? { deliveryAddress } : {}),
      },
      {
        onSuccess: (response) => {
          setConfirmSheetVisible(false);
          const screen = fulfillment === "delivery" ? "DeliveryTracking" : "BookingConfirmed";
          (navigation.navigate as any)(screen, { order: response.data });
        },
        onError: (err: any) => {
          setConfirmSheetVisible(false);
          const msg = err?.response?.data?.message ?? "";

          if (msg === "Pickup time has ended") {
            setErrorModalVisible(true);
          } else {
            Alert.alert(
              "Order Failed",
              msg || "Could not place order. Try again.",
            );
          }
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <CheckoutHeader />

      <ScrollView className="flex-1 pb-40" showsVerticalScrollIndicator={false}>
        <CheckoutFulfillmentToggle method={fulfillment} onChange={setFulfillment} />
        {fulfillment === "delivery" && (
          <CheckoutDeliveryDetails address={deliveryAddress} />
        )}
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
        isLoading={isPending}
        pickupStart={activeBag?.pickupStart}
        pickupEnd={activeBag?.pickupEnd}
        pickupOffset={cartItems[0]?.pickupOffset ?? 0}
        fulfillment={fulfillment}
      />

      <OrderErrorModal
        visible={errorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        onHomePress={handleGoHomeAndClear}
      />
    </SafeAreaView>
  );
}
