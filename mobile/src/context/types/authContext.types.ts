export interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSelectedLocation: boolean;
  hasSeenIntro: boolean;
  login: (token?: string) => void;
  logout: () => void;
  setLocationSelected: () => void;
  completeIntro: () => void;
}
