import { ViewProps } from "react-native";

export interface InViewProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}
