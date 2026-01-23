import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { styled } from 'nativewind';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'outline' | 'ghost';
  label: string;
  onPress: () => void;
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export default function Button({ 
  variant = 'primary', 
  label, 
  onPress, 
  className,
  ...props 
}: ButtonProps) {
  
  const getContainerStyles = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white border text-mismish-teal border-gray-100'; // White bg, thin border
      case 'ghost':
        return 'bg-transparent';
      case 'primary':
      default:
        return 'bg-[#F59E0B]'; // Orange/Amber-500 equivalent from image
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
        return 'text-gray-400'; // Mismish teal text for outline usually, but design shows gray? Image says "Skip for now" is gray/light text.
        // Actually looking at image: "Skip for now" is gray text on white. "Next" is White text on Orange.
      case 'ghost':
        return 'text-gray-400';
      case 'primary':
      default:
        return 'text-white font-bold';
    }
  };

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className={`w-full py-4 rounded-xl items-center justify-center mb-3 ${getContainerStyles()} ${className}`}
      {...props}
    >
      <StyledText className={`text-base font-semibold ${getTextStyles()}`}>
        {label}
      </StyledText>
    </StyledTouchableOpacity>
  );
}
