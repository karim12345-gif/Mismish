import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface CartMilestoneTrackerProps {
  subTotal: number;
}

export const CartMilestoneTracker = ({
  subTotal,
}: CartMilestoneTrackerProps) => {
  const MILESTONE_TARGET = 30.0;
  const remaining = Math.max(0, MILESTONE_TARGET - subTotal);
  const progressPercentage = Math.min(100, (subTotal / MILESTONE_TARGET) * 100);

  return (
    <View className="bg-[#F2FAF6] px-5 py-4 w-full border-t border-gray-100">
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-[#111] font-black text-[14px] tracking-tight">
          {remaining > 0
            ? `Add ﷼ ${remaining.toFixed(2)} more to reach your next milestone`
            : `This order completes a milestone from the challenge!`}
        </Text>
        {remaining === 0 && (
          <View className="bg-[#18C96D] w-4 h-4 rounded-[4px] items-center justify-center shadow-sm shadow-[#18C96D]/50">
            <Feather name="check" size={10} color="#FFF" />
          </View>
        )}
      </View>

      {/* Progress Bar Container */}
      <View className="w-full h-1.5 bg-[#E0E0E0] rounded-full overflow-hidden">
        {/* Fill */}
        <View
          className="h-full bg-[#18C96D] rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </View>
  );
};
