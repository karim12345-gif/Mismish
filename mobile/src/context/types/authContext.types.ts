export interface AuthUser {
  id: number;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  needsProfile: boolean;
}

export interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSelectedLocation: boolean;
  hasSeenIntro: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  setLocationSelected: () => Promise<void>;
  completeIntro: () => Promise<void>;
}
