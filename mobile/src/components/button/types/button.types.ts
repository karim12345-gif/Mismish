import { ReactNode } from "react";
import { TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "outline" | "ghost" | "social";
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  textClassName?: string;
}
