export interface UpdateProfileBody {
  name?: string;
  email?: string;
}

export interface UserProfile {
  id: number;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  needsProfile: boolean;
}
