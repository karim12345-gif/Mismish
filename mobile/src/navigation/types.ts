export type AuthStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  AuthStart: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Map: { flyToLocation?: boolean } | undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
