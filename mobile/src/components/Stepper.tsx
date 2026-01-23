import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';

interface StepperProps {
  totalSteps: number;
  currentStep: number;
}

const StyledView = styled(View);

export default function Stepper({ totalSteps, currentStep }: StepperProps) {
  return (
    <StyledView className="flex-row justify-center space-x-2 my-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <StyledView
          key={index}
          className={`h-2 rounded-full ${
            index === currentStep 
              ? 'w-8 bg-[#F59E0B]' // Active: Wide orange dash
              : 'w-2 bg-white/40'   // Inactive: Small white dot
          }`}
        />
      ))}
    </StyledView>
  );
}
