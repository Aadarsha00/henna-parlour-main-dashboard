export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  is_staff: boolean;
}

export interface AdminLoginResponse extends LoginResponse {
  user: AdminUser;
}
