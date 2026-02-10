import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = ({
  label,
  error,
  containerClassName = "",
  className = "",
  ...props
}: InputProps) => {
  return (
    <StyledView className={`w-full mb-4 ${containerClassName}`}>
      {label && (
        <StyledText className="text-gray-700 font-medium mb-1 ml-1">
          {label}
        </StyledText>
      )}
      <StyledTextInput
        className={`w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl px-4 text-gray-800 focus:border-[#F59E0B] focus:border-2 ${
          error ? "border-red-500" : ""
        } ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <StyledText className="text-red-500 text-sm mt-1 ml-1">
          {error}
        </StyledText>
      )}
    </StyledView>
  );
};
