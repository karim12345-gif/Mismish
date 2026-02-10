import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "@navigation/types";

export type NavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Onboarding"
>;

export interface Props {
  navigation: NavigationProp;
}

export type OnboardingStep =
  | "welcome"
  | "nearbyStores"
  | "surprise"
  | "booking"
  | "collect"
  | "reminder";

export interface Slide {
  id: OnboardingStep;
  title: string;
  image: any;
}
