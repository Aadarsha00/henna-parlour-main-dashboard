// Service categories based on your data
export type ServiceCategory = string; // Allow any category from API

// Individual service interface
export interface Service {
  id: number;
  name: string;
  price: string | number;
  category: string;
  duration_minutes: number;
  deposit_amount: string | number;
  requires_deposit: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// API response interface for paginated services
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

// Form data interface for creating/updating services
export interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  category: ServiceCategory;
  duration_minutes: number;
  deposit_amount: string;
  requires_deposit: boolean;
}

// Filter interface
export interface ServiceFilter {
  category: ServiceCategory | "all";
  search: string;
}

// Alias for response
export type ServiceResponse = ServicesResponse;
