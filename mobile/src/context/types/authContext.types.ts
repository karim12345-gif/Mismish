export interface AuthContextProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}
