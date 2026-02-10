export interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token?: string) => void;
  logout: () => void;
}
