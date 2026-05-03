import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import { useLocation } from "../../../context/LocationContext";

const fmtHour = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const buildSlots = () => {
  const slots = [];
  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(base.getHours() + 1);
  for (let i = 0; i < 4; i++) {
    const start = new Date(base.getTime() + i * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    slots.push({ label: `${fmtHour(start)} – ${fmtHour(end)}`, start, end });
  }
  return slots;
};

interface Props {
  address: string;
}

export const CheckoutDeliveryDetails = ({ address }: Props) => {
  const { location } = useLocation();
  const [windowType, setWindowType] = useState<"fastest" | "scheduled">("fastest");
  const [slotPickerVisible, setSlotPickerVisible] = useState(false);
  const slots = buildSlots();
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);

  const deliveryLabel = windowType === "fastest"
    ? `${fmtHour(slots[0].start)} – ${fmtHour(slots[0].end)}`
    : `${fmtHour(selectedSlot.start)} – ${fmtHour(selectedSlot.end)}`;

  const region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : { latitude: 24.7136, longitude: 46.6753, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  return (
    <View className="border-t-[8px] border-gray-50">
      {/* Map */}
      <View className="h-[160px] overflow-hidden">
        <MapView
          style={{ flex: 1 }}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {location && (
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              pinColor="#366150"
            />
          )}
        </MapView>
      </View>

      <View className="px-5 py-5">
        {/* Address */}
        <Text className="text-[#111] font-black text-[15px] mb-3">Delivery address</Text>
        <View className="flex-row items-center mb-5">
          <Feather name="map-pin" size={14} color="#366150" />
          <Text className="text-gray-600 font-medium text-[13px] ml-2 flex-1" numberOfLines={2}>
            {address || "Detecting your location..."}
          </Text>
        </View>

        <View className="h-[1px] bg-gray-100 mb-5" />

        {/* Delivery window */}
        <Text className="text-[#111] font-black text-[15px] mb-3">Choose a delivery window</Text>
        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity
            onPress={() => setWindowType("fastest")}
            className={`flex-1 py-3 rounded-2xl border items-center ${windowType === "fastest" ? "border-[#366150] bg-[#E8F0ED]" : "border-gray-200 bg-white"}`}
          >
            <Text className={`font-bold text-[13px] ${windowType === "fastest" ? "text-[#366150]" : "text-gray-500"}`}>
              Fastest Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setWindowType("scheduled"); setSlotPickerVisible(true); }}
            className={`flex-1 py-3 rounded-2xl border items-center ${windowType === "scheduled" ? "border-[#366150] bg-[#E8F0ED]" : "border-gray-200 bg-white"}`}
          >
            <Text className={`font-bold text-[13px] ${windowType === "scheduled" ? "text-[#366150]" : "text-gray-500"}`}>
              Scheduled Time
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 text-[12px] font-medium">
          Your order will be delivered from{" "}
          <Text className="text-[#366150] font-bold">{deliveryLabel}</Text>
        </Text>
      </View>

      {/* Slot picker sheet */}
      <Modal visible={slotPickerVisible} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setSlotPickerVisible(false)}>
          <Pressable>
            <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-[#111] font-black text-[17px]">Select Delivery Time Slot</Text>
                <TouchableOpacity onPress={() => setSlotPickerVisible(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Feather name="x" size={16} color="#555" />
                </TouchableOpacity>
              </View>

              <View className="bg-[#E8F0ED] rounded-2xl px-4 py-3 mb-4">
                <Text className="text-gray-600 text-[12px] font-medium text-center">
                  The nearest time to schedule your delivery is
                </Text>
                <Text className="text-[#366150] font-black text-[14px] text-center mt-0.5">
                  {`${fmtHour(slots[0].start)} – ${fmtHour(slots[0].end)}`}
                </Text>
              </View>

              {slots.map((slot, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setSelectedSlot(slot); setSlotPickerVisible(false); }}
                  className={`py-4 rounded-2xl mb-2 items-center ${
                    selectedSlot.label === slot.label
                      ? "bg-[#E8F0ED] border border-[#366150]"
                      : "bg-white border border-gray-100"
                  }`}
                >
                  <Text className={`font-black text-[15px] ${selectedSlot.label === slot.label ? "text-[#366150]" : "text-[#111]"}`}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setSlotPickerVisible(false)}
                className="bg-[#366150] h-13 rounded-2xl items-center justify-center mt-2 py-4"
              >
                <Text className="text-white font-black text-[15px]">Confirm Delivery Slot</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
