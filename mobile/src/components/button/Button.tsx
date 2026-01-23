import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styled } from "nativewind";
import { ButtonProps } from "./types";

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export const Button = ({
  variant = "primary",
  label,
  onPress,
  className,
  ...props
}: ButtonProps) => {
  const getContainerStyles = () => {
    switch (variant) {
      case "outline":
        return "bg-white border border-gray-200";
      case "ghost":
        return "bg-transparent";
      case "primary":
      default:
        return "bg-[#F59E0B]";
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case "outline":
        return "text-gray-400";
      case "ghost":
        return "text-gray-400";
      case "primary":
      default:
        return "text-white font-bold";
    }
  };

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className={`w-full h-14 rounded-2xl items-center justify-center mb-3 ${getContainerStyles()} ${className}`}
      {...props}
    >
      <StyledText className={`text-base font-semibold ${getTextStyles()}`}>
        {label}
      </StyledText>
    </StyledTouchableOpacity>
  );
};
