import React from "react";
import { View } from "react-native";
import { styled } from "nativewind";
import { InViewProps } from "./types";

const StyledView = styled(View);

/**
 * Simplified InView to resolve the RNSafeAreaView crash.
 * Using standard View instead of SafeAreaView from libraries that might be missing native modules.
 */
export const InView = ({ children, className, ...props }: InViewProps) => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StyledView
        className={`flex-1 bg-white relative ${className || ""}`}
        {...props}
      >
        {children}
      </StyledView>
    </View>
  );
};
