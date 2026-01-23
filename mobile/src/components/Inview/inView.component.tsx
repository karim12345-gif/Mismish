import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { InViewProps } from "./types";

const StyledView = styled(View);

export const InView = ({ children, className, ...props }: InViewProps) => {
  return (
    <SafeAreaProvider>
      <StyledView
        className={`flex-1 bg-white relative ${className || ""}`}
        {...props}
      >
        {children}
      </StyledView>
    </SafeAreaProvider>
  );
};
