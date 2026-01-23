import React from "react";
import { View } from "react-native";
import { styled } from "nativewind";
import { StepperProps } from "./types";

const StyledView = styled(View);

export const Stepper = ({ totalSteps, currentStep }: StepperProps) => {
  return (
    <StyledView className="flex-row justify-center space-x-2 my-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <StyledView
          key={index}
          className={`h-2 rounded-full ${
            index === currentStep ? "w-8 bg-[#F59E0B]" : "w-2 bg-white/40"
          }`}
        />
      ))}
    </StyledView>
  );
};
