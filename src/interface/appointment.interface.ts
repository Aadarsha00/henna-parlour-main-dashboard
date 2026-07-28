export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "late_cancelled"
  | "no_show";

export interface ServiceDetails {
  id: number;
  name: string;
  price: string;
  category: string;
  duration_minutes: number;
}

export interface Appointment {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: number;
  service_details: ServiceDetails;
  stylist: number | null;
  stylist_name?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  duration_minutes: number;
  total_amount: string;
  can_cancel: boolean;
  is_past_due: boolean;
  is_new?: boolean;
  needs_attention?: boolean;
}

export interface UpdateAppointmentData {
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  appointment_date?: string;
  appointment_date__gte?: string;
  appointment_date__lte?: string;
  service?: number;
}

export interface AppointmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

export interface AppointmentActionResponse {
  message: string;
  status?: AppointmentStatus;
}

export interface AvailabilitySlot {
  value: string;
  label: string;
}

export interface AppointmentAvailability {
  date: string;
  service: number;
  duration_minutes: number;
  slots: AvailabilitySlot[];
}

export interface AppointmentCounts {
  booked: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  late_cancelled: number;
  no_show: number;
  total: number;
}
