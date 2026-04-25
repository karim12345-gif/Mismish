import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "@navigation/types";

export type NavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Onboarding"
>;

export interface Props {
  navigation: NavigationProp;
}

export type OnboardingStep = "surplus" | "surprise" | "booking" | "impact";

export interface Slide {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: any;
  decoration: any;
}
