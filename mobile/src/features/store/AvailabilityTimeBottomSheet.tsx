import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface AvailabilityTimeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: "today" | "tomorrow";
  onSelectDate: (date: "today" | "tomorrow") => void;
  pickupStart: string;
  pickupEnd: string;
}

const fmtDate = (iso: string, offset = 0) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const fmtTime = (iso: string, offset = 0) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + offset);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeRange = (start: string, end: string, offset = 0) => {
  const s = new Date(start);
  const e = new Date(end);

  // If end is before start in clock time (ignoring date), it might be a weird data point.
  // We'll show them in chronological order of their clock times for better UX.
  const sHours = s.getHours() * 60 + s.getMinutes();
  const eHours = e.getHours() * 60 + e.getMinutes();

  if (sHours > eHours) {
    return `${fmtTime(end, offset)} – ${fmtTime(start, offset)}`;
  }
  return `${fmtTime(start, offset)} – ${fmtTime(end, offset)}`;
};

export const AvailabilityTimeBottomSheet = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  pickupStart,
  pickupEnd,
}: AvailabilityTimeBottomSheetProps) => {
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 500,
      duration: visible ? 300 : 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  const options: {
    key: "today" | "tomorrow";
    offset: number;
    label: string;
    icon: string;
  }[] = [
    { key: "today", offset: 0, label: "Today", icon: "clock" },
    { key: "tomorrow", offset: 1, label: "Tomorrow", icon: "calendar" },
  ];

  return (
    <Modal visible={visible} transparent animationType="none">
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1 w-full" onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl pt-5 pb-10 px-5 w-full"
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mb-6 relative">
            <Text className="text-[#111] font-black text-[18px]">
              Availability Time
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="x" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="flex-row justify-between mb-8">
            {options.map(({ key, offset, label, icon }) => {
              const isSelected = selectedDate === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.8}
                  onPress={() => onSelectDate(key)}
                  className={`w-[48%] rounded-xl p-4 border ${
                    isSelected ? "border-[#FF7F50]" : "border-gray-200"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mb-4 justify-center items-center ${
                      isSelected ? "border-[#FF7F50]" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <View className="w-3 h-3 bg-[#FF7F50] rounded-full" />
                    )}
                  </View>
                  <Text className="text-gray-500 font-medium text-[12px] mb-1">
                    {fmtDate(pickupEnd, offset)}
                  </Text>
                  <View className="flex-row items-center mb-1.5">
                    <Feather name={icon as any} size={20} color="#111" />
                    <Text className="text-[#111] font-black text-[16px] ml-1.5">
                      {label}
                    </Text>
                  </View>
                  <Text className="text-gray-400 font-medium text-[11px]">
                    {formatTimeRange(pickupStart, pickupEnd, offset)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="w-full h-14 bg-[#FF7F50] rounded-2xl items-center justify-center shadow-sm shadow-[#FF7F50]/30"
          >
            <Text className="text-white font-black text-[16px]">Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
