
export interface RegisterVendorBody {
  email: string;
  password: string;
  name: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginVendorBody {
  email: string;
  password: string;
}