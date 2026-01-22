// Service Details interface
export interface ServiceDetails {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
  category: string;
  deposit_amount: string;
  requires_deposit: boolean;
}

// Payment Summary interface
export interface PaymentSummary {
  can_be_refunded: boolean;
  has_deposit_paid: boolean;
  is_fully_paid: boolean;
  remaining_balance: number;
  total_paid: number;
}

// Main Appointment interface
export interface Appointment {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: number;
  service_details: ServiceDetails;
  stylist: number | null;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status: "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
  payment_status: "pending" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
  duration_minutes: number;
  total_amount: string;
  deposit_amount: string;
  can_cancel: boolean;
  is_past_due: boolean;
  payment_summary: PaymentSummary;
}

// For creating new appointments
export interface CreateAppointmentData {
  client_name: string;
  client_email: string;
  client_phone: string;
  service: number;
  stylist: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

// For updating existing appointments
export interface UpdateAppointmentData {
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  status?: "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
  payment_status?: "pending" | "paid" | "refunded";
}

// For filtering appointments
export interface AppointmentFilters {
  status?: "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
  payment_status?: "pending" | "paid" | "refunded";
  appointment_date?: string;
  service?: number;
  stylist?: number;
}

// API Response types
export interface AppointmentListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Appointment[];
}

export interface AppointmentResponse {
  appointment: Appointment;
  message?: string;
}
