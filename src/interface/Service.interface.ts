export type ServiceCategory = string;

export interface Service {
  id: number;
  name: string;
  price: string | number;
  category: string;
  duration_minutes: number;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServicesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Service[];
}

export interface ServicesListProps {
  services: Service[];
  loading?: boolean;
  error?: string | null;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  category: ServiceCategory;
  duration_minutes: number;
  is_active: boolean;
}

export interface ServiceFilter {
  category: ServiceCategory | "all";
  search: string;
}

export type ServiceResponse = ServicesResponse;
