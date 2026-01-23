import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
};

export type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
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
