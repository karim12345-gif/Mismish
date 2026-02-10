import React, { ReactNode } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { styled } from "nativewind";

const StyledTouchableOpacity = styled(TouchableOpacity);

interface IconButtonProps extends TouchableOpacityProps {
  icon: ReactNode;
  onPress: () => void;
  className?: string;
}

export const IconButton = ({
  icon,
  onPress,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className={`items-center justify-center ${className}`}
      {...props}
    >
      {icon}
    </StyledTouchableOpacity>
  );
};
