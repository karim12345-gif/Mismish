import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { styled } from "nativewind";
import { ButtonProps } from "./types";

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

export const Button = ({
  variant = "primary",
  label,
  onPress,
  className,
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  textClassName,
  ...props
}: ButtonProps) => {
  const getContainerStyles = () => {
    switch (variant) {
      case "outline":
        return "bg-transparent border border-gray-200";
      case "ghost":
        return "bg-transparent";
      case "social":
        return "bg-white border border-gray-200"; // Default social style, can be overridden via className
      case "primary":
      default:
        return "bg-[#F59E0B]";
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case "outline":
        return "text-gray-700";
      case "ghost":
        return "text-gray-400";
      case "social":
        return "text-black";
      case "primary":
      default:
        return "text-white font-bold";
    }
  };

  // Merge disabled state with isLoading
  const isDisabled = disabled || isLoading;

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full h-14 rounded-2xl flex-row items-center justify-center mb-3 ${getContainerStyles()} ${isDisabled ? "opacity-50" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "social" ? "#000" : "#FFF"
          }
        />
      ) : (
        <>
          {leftIcon && <StyledView className="mr-2">{leftIcon}</StyledView>}
          <StyledText
            className={`text-base font-semibold ${getTextStyles()} ${textClassName}`}
          >
            {label}
          </StyledText>
          {rightIcon && <StyledView className="ml-2">{rightIcon}</StyledView>}
        </>
      )}
    </StyledTouchableOpacity>
  );
};
