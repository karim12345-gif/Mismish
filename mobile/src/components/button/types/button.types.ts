import { TouchableOpacityProps } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "outline" | "ghost";
  label: string;
  onPress: () => void;
}
