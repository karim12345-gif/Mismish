import React, { useState } from "react";
import { ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutFulfillmentToggle } from "./components/CheckoutFulfillmentToggle";
import { CheckoutStoreDetails } from "./components/CheckoutStoreDetails";
import { CheckoutOrderItems } from "./components/CheckoutOrderItems";
import { CheckoutCoupon } from "./components/CheckoutCoupon";
import { CheckoutSummary } from "./components/CheckoutSummary";
import { CheckoutPaymentFooter } from "./components/CheckoutPaymentFooter";
import { PaymentMethodBottomSheet } from "./components/PaymentMethodBottomSheet";
import { AddNewCardBottomSheet } from "./components/AddNewCardBottomSheet";
import { ConfirmOrderBottomSheet } from "./components/ConfirmOrderBottomSheet";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { useCart } from "../../context/CartContext";

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cartItems } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [addCardSheetVisible, setAddCardSheetVisible] = useState(false);
  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);

  const handleInitialPayPress = () => setConfirmSheetVisible(true);

  const handleConfirm = () => {
    const surpriseBoxId = cartItems.find((i: any) => i.surpriseBoxId)?.surpriseBoxId;

    if (!surpriseBoxId) {
      Alert.alert("Error", "No bag selected. Please go back and add a bag.");
      return;
    }

    createOrder(
      { surpriseBoxId, deliveryMethod: "PICKUP" },
      {
        onSuccess: () => {
          setConfirmSheetVisible(false);
          navigation.navigate("Orders" as never);
        },
        onError: (err: any) => {
          setConfirmSheetVisible(false);
          Alert.alert(
            "Order Failed",
            err?.response?.data?.message ?? "Could not place order. Try again.",
          );
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <CheckoutHeader />

      <ScrollView className="flex-1 pb-40" showsVerticalScrollIndicator={false}>
        <CheckoutFulfillmentToggle />
        <CheckoutStoreDetails />
        <CheckoutOrderItems />
        <CheckoutCoupon />
        <CheckoutSummary
          onChangePaymentPress={() => setPaymentSheetVisible(true)}
        />
      </ScrollView>

      <CheckoutPaymentFooter onPayPress={handleInitialPayPress} />

      <PaymentMethodBottomSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
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
      />
    </SafeAreaView>
  );
}
